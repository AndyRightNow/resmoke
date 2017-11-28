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

    describe('Methods', () => {
        describe('addAction', () => {
            it('should add the action to the class prototype', () => {
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
                        expect(arr).to.deep.eq([1, 3]);
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
