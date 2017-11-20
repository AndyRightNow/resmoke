import Resmoke, { ActionDefinition, ActionDefinitionReturnType } from '../Resmoke/index';
import { isNumber, defaultTo } from 'lodash';
import { validateArg } from '../utils/validation';
import * as sizzle from 'sizzle';

export function waitFor(
    sizzleObj: (selector: string) => Element[] = sizzle,
): ActionDefinition<Resmoke> {
    function fn(this: Resmoke, timeout: number): ActionDefinitionReturnType;
    function fn(this: Resmoke, selector: string, timeout: number): ActionDefinitionReturnType;
    function fn(this: Resmoke, ...args: any[]): ActionDefinitionReturnType {
        let timeout = 0;
        let selector = '';
        if (isNumber(args[0])) {
            timeout = args[0];

            validateArg('timeout', timeout, 'number', 0);

            return new Promise(resolve => {
                setTimeout(() => {
                    resolve();
                }, timeout);
            });
        } else {
            selector = args[0];
            timeout = args[1];
            validateArg('selector', selector, 'string', 0);
            validateArg('timeout', timeout, 'number', 1, true);
            timeout = defaultTo(timeout, this.timeout);

            let el: Element[] = null;
            let cnt = 0;
            return new Promise((resolve, reject) => {
                const checkInterval = setInterval(() => {
                    cnt++;
                    el = sizzleObj(selector);

                    if (el && el.length) {
                        resolve(el);
                    } else if (cnt >= timeout) {
                        reject(
                            new Error(
                                `Timeout ${
                                    timeout
                                } exceeded. No elements that match the selector '${selector};`,
                            ),
                        );
                    } else {
                        return;
                    }

                    clearInterval(checkInterval);
                });
            });
        }
    }

    return fn;
}
