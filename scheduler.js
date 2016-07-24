var node_schedule = require('node-schedule');
var topTracks = require('./topTracks/topTracks.js');

function schedule() {
    console.log('Scheduler Started');
    node_schedule.scheduleJob('00 00 * * *', function () {
        console.log(new Date());
        topTracks.getData();
    });
}

exports.schedule = schedule;
