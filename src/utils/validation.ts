import { capitalize } from 'lodash';

export function validateArg<T>(
    name: string,
    value: T,
    type: string,
    pos: number,
    allowUndefined = false,
): void {
    const valueType = (Object.prototype.toString.call(value) as string).match(
        /\[object (.*?)\]/,
    )[1];
    const expectedType = capitalize(type);

    if ((allowUndefined && valueType === 'Undefined') || valueType === capitalize(type)) {
        return;
    } else {
        throw new Error(
            `Argument Error: Expect the argument ${name}` +
                `at index ${pos} to be '${expectedType}', instead '${valueType}' is received.`,
        );
    }
}
