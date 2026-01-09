import type { APIGatewayProxyEvent } from 'aws-lambda';

type QueryStringParameters = APIGatewayProxyEvent['queryStringParameters'];

type ErrorResponse = {
    error: string;
};

export type { QueryStringParameters, ErrorResponse };
