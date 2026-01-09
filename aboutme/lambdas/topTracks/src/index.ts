/// <reference types="spotify-api" />

import SpotifyWebApi from 'spotify-web-api-node';
import type { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import createDebug from 'debug';

import type { QueryStringParameters, ErrorResponse } from './types.js';

const log = createDebug('top-tracks:lambda');

const NO_TRACKS_LIMIT = undefined;

const spotifyWebApi = new SpotifyWebApi({
    clientId: process.env.SPOTIFY_CLIENT_ID,
    clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
    refreshToken: process.env.SPOTIFY_REFRESH_TOKEN,
});

let nextRefresh = 0;

const ensureAccessToken = async (): Promise<void> => {
    if (Date.now() > nextRefresh) {
        log('Refreshing Spotify access token');

        const response = await spotifyWebApi.refreshAccessToken();

        process.env.SPOTIFY_ACCESS_TOKEN = response.body.access_token;
        nextRefresh += response.body.expires_in * 1000;
    }

    const accessToken = process.env.SPOTIFY_ACCESS_TOKEN;
    if (accessToken) {
        spotifyWebApi.setAccessToken(accessToken);
    }
};

const getTracksLimit = (queryStringParameters: QueryStringParameters): number | undefined => {
    if (queryStringParameters !== null && queryStringParameters.limit) {
        const limit = parseInt(queryStringParameters.limit, 10);
        return isNaN(limit) ? undefined : limit;
    }

    return NO_TRACKS_LIMIT;
};

const getTopTracks = async (
    tracksLimit: number | undefined,
): Promise<SpotifyApi.TrackObjectFull[]> => {
    const options = {
        time_range: 'short_term' as const,
        limit: tracksLimit,
    };

    const topTracksResponse = await spotifyWebApi.getMyTopTracks(options);

    return topTracksResponse.body.items;
};

const lambdaResponse = (
    statusCode: number,
    body: SpotifyApi.TrackObjectFull[] | ErrorResponse,
): APIGatewayProxyResult => ({
    statusCode: statusCode,
    headers: {
        'Access-Control-Allow-Origin': '*',
    },
    body: JSON.stringify(body),
    isBase64Encoded: false,
});

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    log(`Received event: ${JSON.stringify(event)}`);

    try {
        await ensureAccessToken();

        const tracksLimit = getTracksLimit(event.queryStringParameters);

        const topTracks = await getTopTracks(tracksLimit);

        return lambdaResponse(200, topTracks);
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        log(`Error: ${errorMessage}`);
        return lambdaResponse(500, { error: errorMessage });
    }
};
