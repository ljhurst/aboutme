var request = require('request');
var spotifyConfig = require('./spotifyConfig.js').spotifyConfig;

var topTracks = [];

function getTopTracks(request, response) {
    response.send(topTracks);
}

function requestTopTracks() {
    request({
        url: spotifyConfig.topTracksUrl,
        auth: {
            bearer: spotifyConfig.auth.bearer_token,
        },
        qs: {
            time_range: spotifyConfig.requestParams.time_range,
            limit: spotifyConfig.requestParams.limit,
        },
    },
    function (error, response, body) {
        if (error) {
            console.log(error);
        } else {
            console.log(body);
            body = JSON.parse(body);
            topTracks = body.items;
        }
    });
}

requestTopTracks();

module.exports.getTopTracks = getTopTracks;
