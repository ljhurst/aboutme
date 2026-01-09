import type { APIGatewayProxyEvent } from 'aws-lambda';
import type { components } from '@octokit/openapi-types';

type PushEvent = components['schemas']['event'] & {
    type: 'PushEvent';
    payload: {
        before: string;
        head: string;
    };
};

type EnrichedEvent = {
    created_at: string;
    actor: {
        login: string;
        html_url: string;
    };
    repo: {
        name: string;
        html_url: string;
    };
    payload: {
        size: number;
        commits: Array<{
            sha: string;
            message: string;
            html_url: string;
        }>;
    };
};

type QueryStringParameters = APIGatewayProxyEvent['queryStringParameters'];

type ErrorResponse = {
    error: string;
};

export type { PushEvent, EnrichedEvent, QueryStringParameters, ErrorResponse };
