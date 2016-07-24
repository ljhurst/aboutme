var request = require('request');
var refreshSpotifyToken = require('spotify-refresh');
var spotifyAuth = require('./spotifyAuth.js').spotifyAuth;
var spotifyConfig = require('./spotifyConfig.js').spotifyConfig;

var data = [];

function getData() {
    return data;
}

function requestData() {
    refreshSpotifyToken(spotifyAuth.refreshToken,
        spotifyAuth.clientId,
        spotifyAuth.clientSecret,
        function (error, response, body) {
            if (error) {
                console.log('Error refreshing access token');
                console.log(error);
            } else {
                console.log('Data from refresh request');
                console.log(body);
                requestTopTracks(body.access_token);
            }
        });
}

function requestTopTracks(bearerToken) {
    request({
        url: spotifyConfig.topTracksUrl,
        auth: {
            bearer: bearerToken
        },
        qs: {
            time_range: spotifyConfig.requestParams.time_range,
            limit: spotifyConfig.requestParams.limit
        }
    },
    function (error, response, body) {
        if (error) {
            console.log('Error requesting top tracks');
            console.log(error);
        } else {
            console.log('Data from top tracks request');
            console.log(body);
            body = JSON.parse(body);
            data = body.items;
        }
    });
}

requestData();

exports.getData = getData;
exports.requestData = requestData;
