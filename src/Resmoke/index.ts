import { validateArg, ajv } from '../utils/validation';
import constants from '../constants';
import {
    ITestCaseDefinition,
    ITestCaseRunResult,
    TestCaseAction,
    TestCaseActionFn,
    TEST_CASE_RUN_RESULT_STATUS,
} from '../types/index';
import extend = require('lodash/extend');
import forEach = require('lodash/forEach');
import forOwn = require('lodash/forOwn');
import { isPromise } from '../utils/types';

const DEFAULT_TIMEOUT = 3000;

let runSingleDebug: any;
if (!PRODUCTION) {
    runSingleDebug = require('debug')(require('../utils/debug').getDebugName('instance-runSingle'));
}

export interface IResmokeProps {
    timeout?: number;
}

export type ActionDefinitionReturnType = Promise<any> | void | Resmoke;
export type ActionDefinition<T> = (this: T, ...args: any[]) => ActionDefinitionReturnType;

export interface IRunOptions {
    withTestRunner?: boolean;
}

export default class Resmoke {
    public static describe?: (description: string, callback: () => void) => any;
    public static it?: (expectation: string, callback?: (done: any) => any) => any;
    public static addAction(name: string, def: ActionDefinition<Resmoke>): void {
        Resmoke.prototype.addActionInternal.call(null, name, def, Resmoke.prototype);
    }
    public static removeAction(name: string): void {
        if (Resmoke.prototype.hasOwnProperty(name)) {
            delete (Resmoke.prototype as any)[name];
        }
    }

    public timeout: number;
    private internalPromise: Promise<void>;
    private actionMap: {
        [action: string]: ActionDefinition<Resmoke>;
    };

    constructor(props?: IResmokeProps) {
        if (props) {
            this.timeout = props.timeout || DEFAULT_TIMEOUT;
        }
        this.internalPromise = new Promise(resolve => resolve());
        this.actionMap = {};
    }

    public get and() {
        return this;
    }

    public addAction(name: string, def: ActionDefinition<this>): this {
        this.actionMap[name] = def;
        this.addActionInternal(name, def, this);

        return this;
    }

    public removeAction(name: string): this {
        if (this.hasOwnProperty(name)) {
            delete (this as any)[name];
        }

        return this;
    }

    public callAction(name: string, ...args: any[]): this {
        validateArg('name', name, 'string', 0);

        if (this.hasOwnProperty(name) || Resmoke.prototype.hasOwnProperty(name)) {
            return (this as any)[name].apply(this, args);
        } else {
            throw new Error(`Action ${name} does not exist.`);
        }
    }

    public exec() {
        return this.internalPromise.then(() => {
            return;
        });
    }

    public then(fn: ActionDefinition<this>) {
        this.internalPromise = this.internalPromise.then(fn.bind(this.getClonedInstance()));
        return this;
    }

    public run(
        cases: ITestCaseDefinition[],
        options: IRunOptions = {
            withTestRunner: false,
        },
    ): Promise<ITestCaseRunResult[]> {
        validateArg('cases', cases, 'array', 0);

        const testCaseResults: ITestCaseRunResult[] = [];

        for (let i = 0, l = cases.length; i < l; i++) {
            if (!ajv.validate(constants.SCHEMA_ID.TEST_CASE_DEFINITION, cases[i])) {
                throw new Error(
                    `Error occured when validating the case at index ${i}: ${ajv.errorsText()}`,
                );
            }
        }

        return new Promise(resolve => {
            if (options.withTestRunner) {
                if (!Resmoke.describe || !Resmoke.it) {
                    throw new Error(
                        `Must provide 'describe' and 'it' functions if options.withTestRunner is set to true`,
                    );
                }

                let doneCaseCnt = 0;
                Resmoke.describe(`Run e2e tests with Resmoke`, () => {
                    forEach(cases, c => {
                        Resmoke.it(c.name, () => {
                            return this.runSingle(c).then(result => {
                                if (result.errors && result.errors.length) {
                                    for (const err of result.errors) {
                                        throw err;
                                    }
                                }

                                doneCaseCnt++;

                                if (doneCaseCnt >= cases.length) {
                                    resolve();
                                }
                            });
                        });
                    });
                });
            } else {
                forEach(cases, c => {
                    this.then(() => {
                        return this.runSingle(c).then(result => {
                            testCaseResults.push(result);
                        });
                    });
                });

                resolve(
                    this.exec().then(() => {
                        return testCaseResults;
                    }),
                );
            }
        });
    }

    private getClonedInstance(): Resmoke {
        const inst = new Resmoke({
            timeout: this.timeout,
        });

        forOwn(this.actionMap, (fn, name) => {
            inst.addAction(name, fn);
        });

        return inst;
    }

    private addActionInternal<T>(name: string, def: ActionDefinition<T>, objToAdd: T): void {
        validateArg('name', name, 'string', 0);
        validateArg('actionDefinition', def, 'function', 1);

        Object.defineProperty(objToAdd, name, {
            value(this: Resmoke, ...args: any[]) {
                return this.then(() => {
                    const localInstance = this.getClonedInstance();

                    return localInstance.then(def.bind(localInstance, ...args)).exec();
                });
            },
            enumerable: true,
            configurable: true,
            writable: true,
        });
    }

    private runSingle(singleCase: ITestCaseDefinition): Promise<ITestCaseRunResult> {
        if (!PRODUCTION) {
            runSingleDebug(`Running single case ${singleCase.name}...`);
        }
        const actionFnArr = [
            ...this.parseTestCaseAction(singleCase.pre),
            ...this.parseTestCaseAction(singleCase.test),
            ...this.parseTestCaseAction(singleCase.post),
        ];

        const result: ITestCaseRunResult = {
            name: singleCase.name,
            status: TEST_CASE_RUN_RESULT_STATUS.SUCCESS,
            errors: [],
        };

        let runPromise: Promise<any> = Promise.resolve();

        forEach(actionFnArr, actionFn => {
            runPromise = runPromise
                .then(() => {
                    const runResult = actionFn.call(this.getClonedInstance());

                    if (isPromise(runResult)) {
                        return runResult;
                    } else if (runResult instanceof Resmoke) {
                        return runResult.exec();
                    }
                })
                .catch((error: Error) => {
                    extend(result, {
                        status: TEST_CASE_RUN_RESULT_STATUS.FAIL,
                        errors: result.errors.concat(error),
                    });
                });
        });

        if (!PRODUCTION) {
            runSingleDebug(`Queued ${actionFnArr.length} actions`);
        }

        return runPromise.then(() => {
            if (!PRODUCTION) {
                runSingleDebug(`Case ${singleCase.name} is successfully run.`);
            }
            return result;
        });
    }

    private parseTestCaseAction(testCaseAction: TestCaseAction): TestCaseActionFn[] {
        if (typeof testCaseAction === 'function') {
            return [testCaseAction];
        }

        const ret = [];

        if (testCaseAction && testCaseAction.length) {
            for (const action of testCaseAction) {
                const args = Array.isArray(action) ? action : [action];

                const localInstance = this.getClonedInstance();
                ret.push(localInstance.callAction.bind(localInstance, ...args));
            }
        }

        return ret;
    }
}
