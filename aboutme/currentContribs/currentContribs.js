var request = require('request');
var githubConfig = require('./githubConfig.js').githubConfig;

var data = [];

var maxNumEvents = 5;

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
        // Empty the data array
        data = [];

        body = JSON.parse(body);

        // Select only Push Events
        body = body.filter(isPushEvent);
        // Select only the first maxNumEvents Push Events
        body = body.slice(0, maxNumEvents);
        // Update the Push Event's urls
        body.forEach(replaceUrlsAndAddToData);
    });
}

function isPushEvent(someEvent) {
    return someEvent.type === githubConfig.pushType;
}

function replaceUrlsAndAddToData(pushEvent) {
    request({
        url: pushEvent.repo.url,
        headers: {
            'User-agent': githubConfig.userAgent
        }
    },
    function (error, response, body) {
        body = JSON.parse(body);
        pushEvent.actor.url = body.owner.html_url;
        pushEvent.repo.name = body.name;
        pushEvent.repo.url = body.html_url;
        data.push(pushEvent);
    });
}

requestData();

exports.getData = getData;
exports.requestData = requestData;
