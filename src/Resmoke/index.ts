import { validateArg } from '../utils/validation';
import { isPromise } from '../utils/types';
import constants from '../constants';

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
            return (this as any)[name].apply(name, args);
        } else {
            throw new Error(`Action ${name} does not exist.`);
        }
    }

    public exec(): Promise<any> {
        return new Promise(resolve => this.next(resolve));
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
