/* tslint:disable */
import { expect } from 'chai';
import { waitFor } from '../waitFor';
import Resmoke from '../../Resmoke/index';

jasmine.DEFAULT_TIMEOUT_INTERVAL = 30000;

describe('File waitFor.ts', () => {
    const resmoke = new Resmoke({
        timeout: 1000,
    });

    describe('Action waitFor', () => {
        const nullSizzle = () => null as any;
        const foundSizzle = () => [{}] as any;
        describe('Without selector', () => {
            it('should resolve successfully if waiting for a specific amount of time', () => {
                return waitFor(nullSizzle).call(resmoke, 2000);
            });
        });

        describe('With selector', () => {
            describe('With toShow flagged true', () => {
                it('should reject if no element is found for a selector and the timeout is exceeded', () => {
                    return waitFor(nullSizzle)
                        .call(resmoke, 's')
                        .then(() => {
                            expect(true).to.be.false;
                        })
                        .catch((err: Error) => {
                            expect(err).to.not.be.undefined;
                        });
                });

                it('should resolve if any elements are found within the timeout', () => {
                    return waitFor(foundSizzle)
                        .call(resmoke, 's')
                        .then((els: any[]) => {
                            expect(els).to.have.length(1);
                        });
                });
            });

            describe('With toShow flagged false', () => {
                it('should reject if elements are found for a selector and the timeout is exceeded', () => {
                    return waitFor(foundSizzle)
                        .call(resmoke, 's', false)
                        .then(() => {
                            expect(true).to.be.false;
                        })
                        .catch((err: Error) => {
                            expect(err).to.not.be.undefined;
                        });
                });

                it('should resolve if any elements are not found within the timeout', () => {
                    return waitFor(nullSizzle)
                        .call(resmoke, 's', false)
                        .then((els: any[]) => {
                            expect(els).to.be.null;
                        });
                });
            });
        });
    });
});
