var request = require('request');

var topTracks = [];

function getTopTracks(request, response) {
    response.send(topTracks);
}

function requestTopTracks() {
    request({
        url: 'https://api.spotify.com/v1/me/top/tracks',
        auth: {
            bearer: 'BQCwJs4pRTkuD815_xtveGQDC1W_nNKaO03e1-cwaQiihJVVX7SPbeoCO5fc48fsPfwfxY_QYivWR1AAmFS_9lPsi5eqtD6zKkFaVRrR213Tf_ByC1NM6pbLowwwisEtFNLwKY4vIeGQptJjLF4',
        },
        qs: {
            time_range: 'short_term',
            limit: 5,
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
