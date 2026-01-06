import GarminConnectPkg from 'garmin-connect';
import createDebug from 'debug';

const { GarminConnect } = GarminConnectPkg;
const log = createDebug('recent-runs:lambda');

const ACTIVITY_TYPE_RUNNING = 'running';
const NO_ACTIVITIES_LIMIT = undefined;

const getRunsLimit = (queryStringParameters) => {
    if (queryStringParameters !== null) {
        return queryStringParameters.limit;
    }

    return NO_ACTIVITIES_LIMIT;
};

const authenticateGarmin = async () => {
    const garminConnect = new GarminConnect({
        username: process.env.GARMIN_EMAIL,
        password: process.env.GARMIN_PASSWORD,
    });

    await garminConnect.login();

    return garminConnect;
};

const getRecentRuns = async (client, activitiesLimit) => {
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
        }) => ({
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

const lambdaResponse = (statusCode, body) => ({
    statusCode: statusCode,
    headers: {
        'Access-Control-Allow-Origin': '*',
    },
    body: JSON.stringify(body),
    isBase64Encoded: false,
});

export const handler = async (event) => {
    log(`Received event: ${JSON.stringify(event)}`);

    try {
        const client = await authenticateGarmin();
        const runsLimit = getRunsLimit(event.queryStringParameters);
        const runs = await getRecentRuns(client, runsLimit);

        return lambdaResponse(200, runs);
    } catch (error) {
        log(`Error: ${error.message}`);
        return lambdaResponse(500, { error: error.message });
    }
};
