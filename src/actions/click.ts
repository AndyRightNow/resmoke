import Resmoke, { ActionDefinition } from '../Resmoke/index';
import { validateArg } from '../utils/validation';
import * as sizzle from 'sizzle';
import * as debug from 'debug';
import { getDebugName } from '../utils/debug';

const clickDebug = debug(getDebugName('action-click'));

export function click(
    sizzleObj: (selector: string) => Element[] = sizzle,
): ActionDefinition<Resmoke> {
    return (selector: string) => {
        validateArg('selector', selector, 'string', 0);

        const els = sizzle(selector);
        clickDebug(`Found elements with selector ${selector}:`, els);

        for (const el of els) {
            el.dispatchEvent(new Event('click'));
        }
    };
}
