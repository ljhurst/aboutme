var request = require('request');
var githubConfig = require('./githubConfig.js').githubConfig;

var data = [];

function getData() {
    return data;
}

function requestData() {
    request({
        url: githubConfig.eventUrl,
        headers: {
            'User-agent': githubConfig.userAgent
        }
    },
    function (error, response, body) {
        body = JSON.parse(body);
        // TODO: Filter events by type
        data = body.slice(0, 5);
        console.log(data);
    });
}

requestData();

exports.getData = getData;
exports.requestData = requestData;
