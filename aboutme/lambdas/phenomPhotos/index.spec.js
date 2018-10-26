const log = require('debug')('top-tracks:test');

const handler = require('./index.js').handler;

const noLimit = { queryStringParameters: null };
const limit5 = { queryStringParameters: { limit: 5 } };

handler(noLimit).then(data => log(data));
handler(limit5).then(data => log(data));
