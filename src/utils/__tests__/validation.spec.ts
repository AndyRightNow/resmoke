/* tslint:disable */
import { expect } from 'chai';
import { validateArg, ajv } from './../validation';

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

    describe('Ajv validation keywords', () => {
        describe('Keyword objectTypes', () => {
            it('should report errors if objectTypes is function and data is not a function', () => {
                const result = ajv.validate(
                    {
                        type: 'object',
                        properties: {
                            fn: {
                                objectTypes: ['function'],
                            },
                        },
                    },
                    {
                        fn: {},
                    },
                );

                expect(result).to.be.false;
                expect(ajv.errorsText()).to.contain('should be function');
            });

            it('should report errors if data is none of all', () => {
                const result = ajv.validate(
                    {
                        type: 'object',
                        properties: {
                            fn: {
                                objectTypes: ['function', 'array', 'RegExp'],
                            },
                        },
                    },
                    {
                        fn: {},
                    },
                );

                expect(result).to.be.false;
                expect(ajv.errorsText()).to.contain('should be function, array or RegExp');
            });

            it('should forward the array keywords', () => {
                const result = ajv.validate(
                    {
                        type: 'object',
                        properties: {
                            fn: {
                                objectTypes: ['array'],
                                items: {
                                    type: 'integer',
                                },
                            },
                        },
                    },
                    {
                        fn: ['1'],
                    },
                );

                expect(result).to.be.false;
                expect(ajv.errorsText()).to.contain('integer');
            });

            it('should not report errors if objectTypes is function and data is a function', () => {
                const result = ajv.validate(
                    {
                        type: 'object',
                        properties: {
                            fn: {
                                objectTypes: ['function'],
                            },
                        },
                    },
                    {
                        fn: () => true,
                    },
                );

                expect(ajv.errors).to.be.null;
                expect(result).to.be.true;
            });
        });
    });
});
