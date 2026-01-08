import GarminConnectPkg from 'garmin-connect';
import type { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import createDebug from 'debug';

import type { QueryStringParameters, RunActivity, ErrorResponse } from './types.js';
import type { GarminConnect, GarminActivity } from 'garmin-connect';

const { GarminConnect: GarminConnectClass } = GarminConnectPkg;
const log = createDebug('recent-runs:lambda');

const ACTIVITY_TYPE_RUNNING = 'running';
const NO_ACTIVITIES_LIMIT = undefined;

const getRunsLimit = (queryStringParameters: QueryStringParameters): number | undefined => {
    if (queryStringParameters !== null && queryStringParameters.limit) {
        const limit = parseInt(queryStringParameters.limit, 10);
        return isNaN(limit) ? undefined : limit;
    }

    return NO_ACTIVITIES_LIMIT;
};

const authenticateGarmin = async (): Promise<GarminConnect> => {
    const garminConnect = new GarminConnectClass({
        username: process.env.GARMIN_EMAIL ?? '',
        password: process.env.GARMIN_PASSWORD ?? '',
    });

    await garminConnect.login();

    return garminConnect;
};

const getRecentRuns = async (
    client: GarminConnect,
    activitiesLimit: number | undefined,
): Promise<RunActivity[]> => {
    const runs = await client.getActivities(0, activitiesLimit, ACTIVITY_TYPE_RUNNING);

    return runs.map(
        ({
            activityId,
            activityName,
            beginTimestamp,
            pr,
            distance,
            averageSpeed,
            duration,
            averageHR,
            calories,
            elevationGain,
            avgPower,
            locationName,
        }: GarminActivity) => ({
            activityId,
            activityName,
            beginTimestamp,
            pr,
            distance,
            averageSpeed,
            duration,
            averageHR,
            calories,
            elevationGain,
            avgPower,
            locationName,
        }),
    );
};

const lambdaResponse = (
    statusCode: number,
    body: RunActivity[] | ErrorResponse,
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
        const client = await authenticateGarmin();
        const runsLimit = getRunsLimit(event.queryStringParameters);
        const runs = await getRecentRuns(client, runsLimit);

        return lambdaResponse(200, runs);
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        log(`Error: ${errorMessage}`);
        return lambdaResponse(500, { error: errorMessage });
    }
};
