import Resmoke, { ActionDefinition } from '../Resmoke/index';
import { validateArg } from '../utils/validation';
import * as sizzle from 'sizzle';

let clickDebug: any;
if (!PRODUCTION) {
    clickDebug = require('debug')(require('../utils/debug').getDebugName('action-click'));
}

export function click(
    sizzleObj: (selector: string) => Element[] = sizzle,
): ActionDefinition<Resmoke> {
    return (selector: string) => {
        validateArg('selector', selector, 'string', 0);

        const els = sizzle(selector);
        if (!PRODUCTION) {
            clickDebug(`Found elements with selector ${selector}:`, els);
        }

        for (const el of els) {
            el.dispatchEvent(new Event('click'));
        }
    };
}
