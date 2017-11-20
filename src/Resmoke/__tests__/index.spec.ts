/* tslint:disable */
import { expect } from 'chai';
import Resmoke from './../index';

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
    });
});
