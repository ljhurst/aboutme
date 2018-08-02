var node_schedule = require('node-schedule');
var topTracks = require('./topTracks/topTracks.js');
var currentContribs = require('./currentContribs/currentContribs.js');

function schedule() {
    node_schedule.scheduleJob('00 3 * * *', function () {
        topTracks.requestData();
        currentContribs.requestData();
    });
}

exports.schedule = schedule;
