import createDebug from 'debug';
import { handler } from './index.js';

const log = createDebug('recent-runs:test');

const noLimit = { queryStringParameters: null };
const limit5 = { queryStringParameters: { limit: 5 } };

handler(noLimit).then((data) => log(data));
handler(limit5).then((data) => log(JSON.parse(data.body)));
