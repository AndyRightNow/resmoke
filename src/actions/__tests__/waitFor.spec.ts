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
        it('should resolve successfully if waiting for a specific amount of time', () => {
            let cnt = 0;

            setInterval(() => cnt++);

            return waitFor(() => null)
                .call(resmoke, 2000)
                .then(() => {
                    expect(cnt).to.be.approximately(2000, 1000);
                });
        });

        it('should reject if no element is found for a selector and the timeout is exceeded', () => {
            return waitFor(() => null)
                .call(resmoke, 's')
                .then(() => {
                    expect(true).to.be.false;
                })
                .catch((err: Error) => {
                    expect(err).to.not.be.undefined;
                });
        });

        it('should resolve if any elements are found within the timeout', () => {
            return waitFor(() => [{}] as any)
                .call(resmoke, 's')
                .then((els: any[]) => {
                    expect(els).to.have.length(1);
                });
        });
    });
});
