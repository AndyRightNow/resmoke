/* tslint:disable */
import { expect } from 'chai';
import Resmoke from './../index';
import { ITestCaseDefinition, TEST_CASE_RUN_RESULT_STATUS } from '../../types/index';

describe('class Resmoke', () => {
    let resmoke: NewResmoke;

    type NewResmoke = Resmoke & {
        sync1?: (arr: number[]) => NewResmoke;
        async1?: (arr: number[]) => NewResmoke;
        sync2?: (arr: number[]) => NewResmoke;
    };

    describe('Construction', () => {
        it('should have no errors', () => {
            resmoke = new Resmoke({
                timeout: 3000,
            });

            expect(resmoke).to.not.be.undefined;
        });
    });

    describe('Props', () => {
        describe('Language chains', () => {
            describe('and', () => {
                it('should return itself', () => {
                    expect(resmoke.and).to.eq(resmoke);
                });
            });
        });
    });

    describe('Static Methods', () => {
        describe('addAction', () => {
            it('should be visible to all instances', () => {
                const inst1 = new Resmoke();
                const inst2 = new Resmoke();

                inst1.addAction('ac1', () => {});
                inst2.addAction('ac2', () => {});

                expect((inst2 as any).ac1).to.be.undefined;
                expect((inst1 as any).ac2).to.be.undefined;

                Resmoke.addAction('ac3', () => {});

                expect((inst2 as any).ac3).to.not.be.undefined;
                expect((inst1 as any).ac3).to.not.be.undefined;
            });
        });
    });

    describe('Own Methods', () => {
        describe('addAction', () => {
            it('should add the action to the instance itself', () => {
                const arr: number[] = [];

                resmoke
                    .addAction('sync1', function(pArr) {
                        pArr.push(1);
                    })
                    .addAction('async1', function(pArr) {
                        return Promise.resolve().then(() => {
                            pArr.push(2);
                        });
                    })
                    .addAction('sync2', function(pArr) {
                        pArr.push(3);
                    }) as NewResmoke;

                return resmoke
                    .sync1(arr)
                    .async1(arr)
                    .sync2(arr)
                    .exec()
                    .then(() => {
                        expect(arr).to.deep.eq([1, 2, 3]);
                    });
            });
        });

        describe('callAction', () => {
            it('should call the action in order', () => {
                const arr: number[] = [];

                return resmoke
                    .callAction('sync1', arr)
                    .callAction('async1', arr)
                    .callAction('sync2', arr)
                    .exec()
                    .then(() => {
                        expect(arr).to.deep.eq([1, 2, 3]);
                    });
            });
        });

        describe('run', () => {
            describe('Without errors', () => {
                describe('withTestRunner is false', () => {
                    it('should run cases in order and collect results', () => {
                        const arr: number[] = [];

                        const cases: ITestCaseDefinition[] = [
                            {
                                name: 'case 1',
                                pre() {
                                    return Promise.resolve().then(() => {
                                        arr.push(1);
                                    });
                                },
                                test() {
                                    arr.push(2);
                                },
                                post() {
                                    arr.push(3);
                                },
                            },
                            {
                                name: 'case 2',
                                test() {
                                    arr.push(1);
                                },
                                post() {
                                    return new Promise(resolve => {
                                        setTimeout(() => {
                                            arr.pop();
                                            resolve();
                                        }, 1000);
                                    });
                                },
                            },
                        ];

                        return resmoke.run(cases).then(res => {
                            expect(arr).to.deep.eq([1, 2, 3]);
                            expect(res[0].name).to.eq('case 1');
                            expect(res[0].errors).to.be.empty;
                            expect(res[0].status).to.eq(TEST_CASE_RUN_RESULT_STATUS.SUCCESS);
                            expect(res[1].name).to.eq('case 2');
                            expect(res[1].errors).to.be.empty;
                            expect(res[1].status).to.eq(TEST_CASE_RUN_RESULT_STATUS.SUCCESS);
                        });
                    });

                    it('should run cases in order and collect results with pre-defined actions', () => {
                        const arr: number[] = [];

                        resmoke.addAction('test-action1', function() {
                            return Promise.resolve().then(() => {
                                arr.push(1);
                            });
                        });
                        resmoke.addAction('test-action2', function() {
                            arr.push(2);
                        });
                        resmoke.addAction('test-action3', function() {
                            arr.push(3);
                        });
                        resmoke.addAction('test-action4', function() {
                            arr.push(1);
                        });
                        resmoke.addAction('test-action5', function() {
                            return new Promise(resolve => {
                                setTimeout(() => {
                                    arr.pop();
                                    resolve();
                                }, 1000);
                            });
                        });

                        const cases: ITestCaseDefinition[] = [
                            {
                                name: 'case 1',
                                pre: ['test-action1'],
                                test: ['test-action2'],
                                post: ['test-action3'],
                            },
                            {
                                name: 'case 2 with nested actions',
                                pre() {
                                    return this.then(function() {
                                        return this.callAction('test-action2').then(function() {
                                            return this.callAction('test-action2').then(function() {
                                                return this.callAction('test-action2');
                                            });
                                        });
                                    });
                                },
                                test: ['test-action4'],
                                post: ['test-action5'],
                            },
                        ];

                        return resmoke.run(cases).then(res => {
                            expect(arr).to.deep.eq([1, 2, 3, 2, 2, 2]);
                            expect(res[0].name).to.eq('case 1');
                            expect(res[0].errors).to.be.empty;
                            expect(res[0].status).to.eq(TEST_CASE_RUN_RESULT_STATUS.SUCCESS);
                            expect(res[1].name).to.contain('case 2');
                            expect(res[1].errors).to.be.empty;
                            expect(res[1].status).to.eq(TEST_CASE_RUN_RESULT_STATUS.SUCCESS);
                        });
                    });

                    afterAll(() => {
                        resmoke.removeAction('test-action1');
                        resmoke.removeAction('test-action2');
                        resmoke.removeAction('test-action3');
                        resmoke.removeAction('test-action4');
                        resmoke.removeAction('test-action5');
                    });
                });

                describe('withTestRunner is true and no errors', () => {
                    Resmoke.describe = describe;
                    Resmoke.it = it;
                    const arr: number[] = [];

                    new Resmoke({
                        timeout: 3000,
                    }).run(
                        [
                            {
                                name: 'it should be ok',
                                pre() {
                                    return Promise.resolve().then(() => {
                                        arr.push(1);
                                    });
                                },
                                test() {
                                    arr.push(2);
                                },
                                post() {
                                    arr.push(3);
                                },
                            },
                        ],
                        {
                            withTestRunner: true,
                        },
                    );
                });

                describe('withTestRunner is true and with errors', () => {
                    beforeAll(() => {
                        Resmoke.describe = undefined;
                        Resmoke.it = undefined;
                    });

                    it('should throw errors if describe and it are not provided', async () => {
                        const arr: number[] = [];

                        try {
                            await resmoke.run(
                                [
                                    {
                                        name: 'it should be ok',
                                        pre() {
                                            return Promise.resolve().then(() => {
                                                arr.push(1);
                                            });
                                        },
                                        test() {
                                            arr.push(2);
                                        },
                                        post() {
                                            arr.push(3);
                                        },
                                    },
                                ],
                                {
                                    withTestRunner: true,
                                },
                            );
                        } catch (error) {
                            expect(error).to.not.be.undefined;
                        }
                    });
                });
            });

            describe('With errors', () => {
                it('should run all cases and collect all errors', () => {
                    const arr: number[] = [];

                    const cases: ITestCaseDefinition[] = [
                        {
                            name: 'case 1',
                            pre() {
                                return Promise.resolve().then(() => {
                                    arr.push(1);
                                });
                            },
                            test() {
                                throw new Error('err 1');
                            },
                            post() {
                                arr.push(3);
                            },
                        },
                        {
                            name: 'case 2',
                            test() {
                                throw new Error('err 2');
                            },
                            post() {
                                return new Promise(resolve => {
                                    setTimeout(() => {
                                        arr.pop();
                                        resolve();
                                    }, 1000);
                                });
                            },
                        },
                    ];

                    return resmoke.run(cases).then(res => {
                        expect(arr).to.deep.eq([1]);
                        expect(res[0].name).to.eq('case 1');
                        expect(res[0].errors).to.have.length(1);
                        expect(res[0].status).to.eq(TEST_CASE_RUN_RESULT_STATUS.FAIL);
                        expect(res[1].name).to.eq('case 2');
                        expect(res[1].errors).to.have.length(1);
                        expect(res[1].status).to.eq(TEST_CASE_RUN_RESULT_STATUS.FAIL);
                    });
                });
            });
        });
    });
});
