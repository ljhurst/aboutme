import SpotifyWebApi from 'spotify-web-api-node';
import createDebug from 'debug';

const log = createDebug('top-tracks:lambda');

const NO_TRACKS_LIMIT = undefined;

const spotifyWebApi = new SpotifyWebApi({
    clientId: process.env.SPOTIFY_CLIENT_ID,
    clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
    refreshToken: process.env.SPOTIFY_REFRESH_TOKEN,
});

let nextRefresh = Date.now();

const ensureAccessToken = async () => {
    if (Date.now() > nextRefresh) {
        log('Refreshing Spotify access token');

        const response = await spotifyWebApi.refreshAccessToken();

        process.env.SPOTIFY_ACCESS_TOKEN = response.body.access_token;
        nextRefresh += response.body.expires_in * 1000;
    }

    spotifyWebApi.setAccessToken(process.env.SPOTIFY_ACCESS_TOKEN);
};

const getTracksLimit = (queryStringParameters) => {
    if (queryStringParameters !== null) {
        return queryStringParameters.limit;
    }

    return NO_TRACKS_LIMIT;
};

const getTopTracks = async (tracksLimit) => {
    const options = {
        time_range: 'short_term',
        limit: tracksLimit,
    };

    const topTracksResponse = await spotifyWebApi.getMyTopTracks(options);

    return topTracksResponse.body.items;
};

const labmdaResponse = (body) => ({
    statusCode: 200,
    headers: {
        'Access-Control-Allow-Origin': '*',
    },
    body: JSON.stringify(body),
    isBase64Encoded: false,
});

export const handler = async (event) => {
    log(`Received event: ${JSON.stringify(event)}`);

    await ensureAccessToken();

    const tracksLimit = getTracksLimit(event.queryStringParameters);

    const topTracks = await getTopTracks(tracksLimit);

    return labmdaResponse(topTracks);
};
