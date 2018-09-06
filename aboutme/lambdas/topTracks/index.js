const SpotifyWebApi = require('spotify-web-api-node');
const log = require('debug')('top-tracks:lambda');

const spotifyWebApi = new SpotifyWebApi({
    clientId: process.env.SPOTIFY_CLIENT_ID,
    clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
    refreshToken: process.env.SPOTIFY_REFRESH_TOKEN
});

let nextRefresh = Date.now();

exports.handler = async (event) => {
    log(`Received event: ${JSON.stringify(event)}`);

    // Check if access token needs to be refreshed
    if (Date.now() > nextRefresh) {
        const response = await spotifyWebApi.refreshAccessToken();

        process.env.SPOTIFY_ACCESS_TOKEN = response.body.access_token;
        nextRefresh += response.body.expires_in * 1000;
    }

    // Set up to date access token
    spotifyWebApi.setAccessToken(process.env.SPOTIFY_ACCESS_TOKEN);

    // Get number of tracks to return from query string
    let tracksLimit = undefined; // MAX

    if (event.queryStringParameters !== null) {
        tracksLimit = event.queryStringParameters.limit;
    }

    // Get top tracks in short term for user
    const options = {
        time_range: 'short_term',
        limit: tracksLimit
    };

    const topTracks = await spotifyWebApi.getMyTopTracks(options);

    return labmdaResponse(topTracks);
};

const labmdaResponse = body => ({
    'statusCode': 200,
    'headers': {
        'Access-Control-Allow-Origin': '*'
    },
    'body': JSON.stringify(body),
    'isBase64Encoded': false
});
