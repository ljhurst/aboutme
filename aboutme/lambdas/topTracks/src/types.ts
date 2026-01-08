import type { APIGatewayProxyEvent } from 'aws-lambda';

type QueryStringParameters = APIGatewayProxyEvent['queryStringParameters'];

export type { QueryStringParameters };
