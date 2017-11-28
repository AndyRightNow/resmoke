/* tslint:disable */
import { expect } from 'chai';
import { click } from '../click';
import Resmoke from '../../Resmoke/index';

describe('File click.ts', () => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 3000;

    const resmoke = new Resmoke({
        timeout: 1000,
    });

    describe('Action click', () => {
        const foundSizzle = () => [{}] as any;
        let newResmoke: Resmoke & {
            click: (selector: string) => Resmoke;
        };

        beforeAll(() => {
            newResmoke = resmoke.addAction('click', click(foundSizzle)) as Resmoke & {
                click: (selector: string) => Resmoke;
            };
        });

        it('should trigger click event', () => {
            const div = document.createElement('div');
            div.id = 'test';
            document.body.appendChild(div);

            return new Promise(resolve => {
                div.addEventListener('click', e => {
                    expect(e).to.not.be.undefined;
                    resolve();
                });

                newResmoke.click('#test').exec();
            });
        });
    });
});
