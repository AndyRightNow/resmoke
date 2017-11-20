import { expect } from 'chai';
import { validateArg } from './../validation';

describe('File validation.ts', () => {
    describe('Function validateArg', () => {
        it('should not throw any errors if the validation passes', () => {
            validateArg('a', 1, 'number', 0);
            validateArg('a', null, 'Null', 0);
            validateArg('a', undefined, 'Null', 0, true);
        });

        it('should throw errors if the validation fails', () => {
            expect(validateArg.bind(null, 'a', 1, 'string', 0)).to.throw();
            expect(validateArg.bind(null, 'a', undefined, 'string', 0, false)).to.throw();
        });
    });
});
