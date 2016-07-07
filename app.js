var express = require('express');
var spotify = require('./spotify/spotify.js');

var app = express();

app.use(express.static('public'));

app.get('/top-tracks', spotify.getTopTracks);

app.listen(8888);
