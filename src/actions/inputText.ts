import Resmoke, { ActionDefinition } from '../Resmoke/index';
import { validateArg } from '../utils/validation';
import * as sizzle from 'sizzle';

export function inputText(
    sizzleObj: (selector: string) => Element[] = sizzle,
): ActionDefinition<Resmoke> {
    return (selector: string, text: string) => {
        validateArg('selector', selector, 'string', 0);
        validateArg('text', text, 'string', 1);

        const els = sizzle(selector);
        for (const el of els) {
            if (
                el instanceof HTMLInputElement ||
                el instanceof HTMLTextAreaElement ||
                'value' in el
            ) {
                (el as Element & { value: string }).value = text;

                el.dispatchEvent(new Event('change'));
                el.dispatchEvent(new Event('input'));
            }
        }
    };
}
