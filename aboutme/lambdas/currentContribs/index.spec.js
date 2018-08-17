handler = require('./index.js').handler;

const limit5 = { queryStringParameters: { limit: 5 } };

handler(limit5).then(data => console.log(data));
