/* tslint:disable */
import { inputText } from '../../inputText';
import Resmoke from '../../../Resmoke/index';

describe('File inputText.ts', () => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 3000;

    const resmoke = new Resmoke({
        timeout: 1000,
    });

    type ActionDef = (selector: string, text: string) => Resmoke;

    describe('Action inputText', () => {
        const foundSizzle = () => [{}] as any;
        let newResmoke: Resmoke & {
            inputText: ActionDef;
        };

        beforeAll(() => {
            newResmoke = resmoke.addAction('inputText', inputText(foundSizzle)) as Resmoke & {
                inputText: ActionDef;
            };
        });

        it('should trigger input and change event', () => {
            const input = document.createElement('input');
            input.id = 'testinput';
            document.body.appendChild(input);

            return new Promise(resolve => {
                let hit = 0;
                input.addEventListener('input', e => {
                    expect(e).not.toBe(undefined);
                    hit++;
                });

                input.addEventListener('change', e => {
                    expect(e).not.toBe(undefined);
                    hit++;
                });

                setInterval(() => {
                    if (hit >= 2) {
                        resolve();
                    }
                }, 1);

                newResmoke.inputText(`#${input.id}`, 'sometext').exec();
            });
        });
    });
});
