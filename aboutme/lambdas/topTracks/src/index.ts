/// <reference types="spotify-api" />

import SpotifyWebApi from 'spotify-web-api-node';
import type { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import createDebug from 'debug';

import { getParameters, parameterNameFromEnv } from './ssm.js';
import type { QueryStringParameters, ErrorResponse } from './types.js';

const log = createDebug('top-tracks:lambda');

const NO_TRACKS_LIMIT = undefined;

const REFRESH_MARGIN_MS = 60 * 1000;

let spotifyWebApi: SpotifyWebApi | undefined;
let accessTokenExpiresAt = 0;

const getSpotifyClient = async (): Promise<SpotifyWebApi> => {
    if (!spotifyWebApi) {
        const clientSecretParam = parameterNameFromEnv('SPOTIFY_CLIENT_SECRET_SSM_PARAM');
        const refreshTokenParam = parameterNameFromEnv('SPOTIFY_REFRESH_TOKEN_SSM_PARAM');
        const parameters = await getParameters([clientSecretParam, refreshTokenParam]);

        spotifyWebApi = new SpotifyWebApi({
            clientId: process.env.SPOTIFY_CLIENT_ID,
            clientSecret: parameters.get(clientSecretParam),
            refreshToken: parameters.get(refreshTokenParam),
        });
    }

    return spotifyWebApi;
};

const getAuthorizedClient = async (): Promise<SpotifyWebApi> => {
    const client = await getSpotifyClient();

    if (Date.now() >= accessTokenExpiresAt) {
        log('Refreshing Spotify access token');

        const response = await client.refreshAccessToken();

        client.setAccessToken(response.body.access_token);
        accessTokenExpiresAt = Date.now() + response.body.expires_in * 1000 - REFRESH_MARGIN_MS;
    }

    return client;
};

const getTracksLimit = (queryStringParameters: QueryStringParameters): number | undefined => {
    if (queryStringParameters !== null && queryStringParameters.limit) {
        const limit = parseInt(queryStringParameters.limit, 10);
        return isNaN(limit) ? undefined : limit;
    }

    return NO_TRACKS_LIMIT;
};

const getTopTracks = async (
    client: SpotifyWebApi,
    tracksLimit: number | undefined,
): Promise<SpotifyApi.TrackObjectFull[]> => {
    const options = {
        time_range: 'short_term' as const,
        limit: tracksLimit,
    };

    const topTracksResponse = await client.getMyTopTracks(options);

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
        const client = await getAuthorizedClient();

        const tracksLimit = getTracksLimit(event.queryStringParameters);

        const topTracks = await getTopTracks(client, tracksLimit);

        return lambdaResponse(200, topTracks);
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        log(`Error: ${errorMessage}`);
        return lambdaResponse(500, { error: errorMessage });
    }
};
