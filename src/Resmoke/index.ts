import { validateArg, ajv } from '../utils/validation';
import { isPromise } from '../utils/types';
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

let runSingleDebug: any;
if (!PRODUCTION) {
    runSingleDebug = require('debug')(require('../utils/debug').getDebugName('instance-runSingle'));
}

export interface IResmokeProps {
    timeout?: number;
}

export type ActionDefinitionReturnType = Promise<any> | void;
export type ActionDefinition<T> = (this: T, ...args: any[]) => ActionDefinitionReturnType;

export default class Resmoke {
    public static addAction(name: string, def: ActionDefinition<Resmoke>): void {
        Resmoke.prototype.addActionInternal.call(null, name, def, Resmoke.prototype);
    }

    public timeout: number;
    private actionQueue: Array<ActionDefinition<this>>;

    constructor(props?: IResmokeProps) {
        if (props) {
            this.timeout = props.timeout || constants.DEFAULT_TIME_OUT;
        }
        this.actionQueue = [];
    }

    public get and() {
        return this;
    }

    public addAction(name: string, def: ActionDefinition<this>): this {
        this.addActionInternal(name, def, this);

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

    public exec(): Promise<any> {
        return new Promise((resolve, reject) => {
            function finalCb(err?: Error): void {
                if (err) {
                    reject(err);
                    return;
                }

                resolve();
            }

            this.next(finalCb);
        });
    }

    public then(fn: () => ActionDefinitionReturnType): this {
        this.enqueue(fn.bind(this));
        return this;
    }

    public run(cases: ITestCaseDefinition[]): Promise<ITestCaseRunResult[]> {
        validateArg('cases', cases, 'array', 0);

        const testCaseResults: ITestCaseRunResult[] = [];
        let runPromise: Promise<any> = Promise.resolve();

        for (let i = 0, l = cases.length; i < l; i++) {
            if (!ajv.validate(constants.SCHEMA_ID.TEST_CASE_DEFINITION, cases[i])) {
                throw new Error(
                    `Error occured when validating the case at index ${i}: ${ajv.errorsText()}`,
                );
            }
        }

        forEach(cases, c => {
            runPromise = runPromise.then(() => {
                return this.runSingle(c).then(result => {
                    testCaseResults.push(result);
                });
            });
        });

        return runPromise.then(() => {
            return testCaseResults;
        });
    }

    private addActionInternal<T>(name: string, def: ActionDefinition<T>, objToAdd: T): void {
        validateArg('name', name, 'string', 0);
        validateArg('actionDefinition', def, 'function', 1);

        Object.defineProperty(objToAdd, name, {
            value(this: Resmoke, ...args: any[]) {
                this.enqueue(def.bind(this, ...args));
                return this;
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

        for (let i = 0, l = actionFnArr.length; i < l; i++) {
            this.enqueue(actionFnArr[i]);
        }
        if (!PRODUCTION) {
            runSingleDebug(`Queued ${actionFnArr.length} actions`);
        }

        const result: ITestCaseRunResult = {
            name: singleCase.name,
            status: TEST_CASE_RUN_RESULT_STATUS.SUCCESS,
            errors: [],
        };

        return this.exec()
            .then<ITestCaseRunResult>(() => {
                if (!PRODUCTION) {
                    runSingleDebug(`Case ${singleCase.name} is successfully run.`);
                }
                return result;
            })
            .catch((error: Error) => {
                if (!PRODUCTION) {
                    runSingleDebug(`Case ${singleCase.name} finished with error ${error}.`);
                }
                return extend(result, {
                    status: TEST_CASE_RUN_RESULT_STATUS.FAIL,
                    errors: result.errors.concat(error),
                });
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

                ret.push(this.callAction.bind(this, ...args));
            }
        }

        return ret;
    }

    private next(finalCb: (err?: Error) => void): void {
        if (this.actionQueue.length) {
            const actionDef = this.actionQueue.shift();

            let result;

            try {
                result = actionDef.call(this);
            } catch (error) {
                finalCb(error);
                return;
            }

            if (isPromise(result)) {
                result.then(() => {
                    this.next(finalCb);
                });
            } else {
                this.next(finalCb);
            }
        } else {
            finalCb();
        }
    }

    private enqueue(a: ActionDefinition<this>): void {
        this.actionQueue.push(a);
    }
}
