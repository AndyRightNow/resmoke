import Resmoke, { ActionDefinition } from '../Resmoke/index';
import { validateArg } from '../utils/validation';
import * as sizzle from 'sizzle';

export function scrollTo(
    sizzleObj: (selector: string) => Element[] = sizzle,
): ActionDefinition<Resmoke> {
    return (x: number, y: number, selector?: string) => {
        validateArg('x', x, 'number', 0);
        validateArg('y', y, 'number', 1);
        validateArg('selector', selector, 'string', 2, true);

        if (selector) {
            const els = sizzle(selector);

            for (const el of els) {
                if (el.scrollTo) {
                    el.scrollTo(x, y);
                } else {
                    el.scrollLeft = x;
                    el.scrollTop = y;
                }
            }
        } else {
            window.scrollTo(x, y);
        }
    };
}
