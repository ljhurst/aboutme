var express = require('express');
var topTracks = require('./topTracks/topTracks.js');
var scheduler = require('./scheduler.js');

var app = express();

app.use(express.static('public'));

app.get('/top-tracks', function (request, response) {
    console.log('\nSending:', topTracks.getData());
    response.send(topTracks.getData());
});

app.listen(8888);

scheduler.schedule();
