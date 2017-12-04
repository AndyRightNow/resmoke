import Resmoke from './Resmoke';
import { waitFor } from './actions/waitFor';
import { click } from './actions/click';
import { inputText } from './actions/inputText';
import { scrollTo } from './actions/scrollTo';
import * as sizzle from 'sizzle';

Resmoke.addAction('waitFor', waitFor(sizzle));
Resmoke.addAction('click', click(sizzle));
Resmoke.addAction('inputText', inputText(sizzle));
Resmoke.addAction('scrollTo', scrollTo(sizzle));

export = Resmoke;
