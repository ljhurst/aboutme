import type { APIGatewayProxyEvent } from 'aws-lambda';

type QueryStringParameters = APIGatewayProxyEvent['queryStringParameters'];

type RunActivity = {
    activityId: number;
    activityName: string;
    beginTimestamp: number;
    pr: boolean;
    distance: number;
    averageSpeed: number;
    duration: number;
    averageHR: number;
    calories: number;
    elevationGain: number;
    avgPower: number;
    locationName: string;
};

type ErrorResponse = {
    error: string;
};

export type { QueryStringParameters, RunActivity, ErrorResponse };
