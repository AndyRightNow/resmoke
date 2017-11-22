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
import { extend } from 'lodash';

export interface IResmokeProps {
    timeout?: number;
}

export type ActionDefinitionReturnType = Promise<any> | void;
export type ActionDefinition<T> = (this: T, ...args: any[]) => ActionDefinitionReturnType;

export default class Resmoke {
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
        validateArg('name', name, 'string', 0);
        validateArg('actionDefinition', def, 'function', 1);

        Object.defineProperty(Resmoke.prototype, name, {
            value: (...args: any[]) => {
                this.enqueue(def.bind(this, ...args));
                return this;
            },
            enumerable: true,
            configurable: true,
            writable: true,
        });

        return this;
    }

    public callAction(name: string, ...args: any[]): this {
        validateArg('name', name, 'string', 0);

        if (Resmoke.prototype.hasOwnProperty(name)) {
            return (this as any)[name].apply(this, args);
        } else {
            throw new Error(`Action ${name} does not exist.`);
        }
    }

    public exec(): Promise<any> {
        return new Promise(resolve => this.next(resolve));
    }

    public then(fn: () => ActionDefinitionReturnType): this {
        this.enqueue(fn.bind(this));
        return this;
    }

    public run(cases: ITestCaseDefinition[]): Promise<ITestCaseRunResult[]> {
        validateArg('cases', cases, 'array', 0);

        for (let i = 0, l = cases.length; i < l; i++) {
            if (!ajv.validate(constants.SCHEMA_ID.TEST_CASE_DEFINITION, cases[i])) {
                throw new Error(ajv.errorsText());
            }
        }
        // dummy
        this.runSingle(cases[0]);

        // dummy
        return Promise.resolve([]);
    }

    private runSingle(singleCase: ITestCaseDefinition): Promise<ITestCaseRunResult> {
        const actionFnArr = [
            ...this.parseTestCaseAction(singleCase.pre),
            ...this.parseTestCaseAction(singleCase.test),
            ...this.parseTestCaseAction(singleCase.post),
        ];

        for (let i = 0, l = actionFnArr.length; i < l; i++) {
            this.enqueue(actionFnArr[i]);
        }

        const result: ITestCaseRunResult = {
            name: singleCase.name,
            status: TEST_CASE_RUN_RESULT_STATUS.SUCCESS,
            errors: [],
        };

        return this.exec()
            .then<ITestCaseRunResult>(() => {
                return result;
            })
            .catch((error: Error) => {
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

        for (const action of testCaseAction) {
            const args = Array.isArray(action) ? action : [action];

            ret.push(this.callAction.bind(this, ...args));
        }

        return ret;
    }

    private next(finalCb: () => void): void {
        if (this.actionQueue.length) {
            const actionDef = this.actionQueue.shift();

            const result = actionDef.call(this);

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
