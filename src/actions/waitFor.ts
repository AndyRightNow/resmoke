import Resmoke, { ActionDefinition, ActionDefinitionReturnType } from '../Resmoke/index';
import { isNumber, defaultTo, isBoolean } from 'lodash';
import { validateArg } from '../utils/validation';
import * as sizzle from 'sizzle';

export function waitFor(
    sizzleObj: (selector: string) => Element[] = sizzle,
): ActionDefinition<Resmoke> {
    function fn(this: Resmoke, timeout: number): ActionDefinitionReturnType;
    function fn(this: Resmoke, selector: string, timeout: number): ActionDefinitionReturnType;
    function fn(
        this: Resmoke,
        selector: string,
        toShow: boolean,
        timeout: number,
    ): ActionDefinitionReturnType;
    function fn(this: Resmoke, ...args: any[]): ActionDefinitionReturnType {
        let timeout = 0;
        let selector = '';
        let toShow = true;
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
            validateArg('selector', selector, 'string', 0);

            if (isNumber(args[1])) {
                timeout = args[1];
                timeout = defaultTo(timeout, this.timeout);
            } else if (isBoolean(args[1])) {
                toShow = args[1];
                toShow = defaultTo(toShow, true);
                timeout = args[2];
                timeout = defaultTo(timeout, this.timeout);

                validateArg('timeout', timeout, 'number', 2);
            }

            const checkCond = toShow
                ? (e: Element[]) => !!(e && e.length)
                : (e: Element[]) => !!(!e || !e.length);

            let el: Element[] = null;
            let cnt = 0;
            return new Promise((resolve, reject) => {
                const checkInterval = setInterval(() => {
                    cnt++;
                    el = sizzleObj(selector);

                    if (checkCond(el)) {
                        resolve(el);
                    } else if (cnt >= timeout) {
                        reject(
                            new Error(
                                `Timeout ${
                                    timeout
                                } exceeded. No elements that match the selector '${selector}'`,
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
