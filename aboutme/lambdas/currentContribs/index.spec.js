handler = require('./index.js').handler;

const noLimit = { queryStringParameters: null };
const limit5 = { queryStringParameters: { limit: 5 } };

handler(noLimit).then(data => console.log(data));
handler(limit5).then(data => console.log(data));
