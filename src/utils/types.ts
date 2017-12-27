export function isPromise(obj: any): obj is Promise<any> {
    return (
        obj instanceof Promise ||
        (typeof obj === 'object' &&
            typeof obj['then'] === 'function' &&
            typeof obj['catch'] === 'function')
    );
}
