import { Octokit } from '@octokit/rest';
import type { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import type { components } from '@octokit/openapi-types';
import createDebug from 'debug';

import type { PushEvent, EnrichedEvent, QueryStringParameters, ErrorResponse } from './types.js';

const log = createDebug('current-contribs:lambda');

const octokit = new Octokit();

const GITHUB_USERNAME = 'ljhurst';
const NO_EVENTS_LIMIT = undefined;

const getEventsLimit = (queryStringParameters: QueryStringParameters): number | undefined => {
    if (queryStringParameters !== null && queryStringParameters.limit) {
        const limit = parseInt(queryStringParameters.limit, 10);
        return isNaN(limit) ? undefined : limit;
    }

    return NO_EVENTS_LIMIT;
};

const getEventsForUser = async (username: string): Promise<components['schemas']['event'][]> => {
    const result = await octokit.rest.activity.listPublicEventsForUser({
        username,
    });

    return result.data;
};

const enrichEventURLs = async (
    owner: string,
    repo: string,
    pushEvent: PushEvent,
): Promise<Pick<EnrichedEvent, 'actor' | 'repo'>> => {
    const result = await octokit.repos.get({ owner, repo });

    return {
        actor: {
            login: pushEvent.actor.login,
            html_url: result.data.owner.html_url,
        },
        repo: {
            name: result.data.name,
            html_url: result.data.html_url,
        },
    };
};

const enrichCommits = async (
    owner: string,
    repo: string,
    pushEvent: PushEvent,
): Promise<Pick<EnrichedEvent, 'payload'>> => {
    const comparison = await octokit.repos.compareCommits({
        owner,
        repo,
        base: pushEvent.payload.before,
        head: pushEvent.payload.head,
    });

    return {
        payload: {
            size: comparison.data.commits.length,
            commits: comparison.data.commits.map((commit) => ({
                sha: commit.sha,
                message: commit.commit.message,
                html_url: commit.html_url,
            })),
        },
    };
};

const enrichEvent = async (pushEvent: PushEvent): Promise<EnrichedEvent> => {
    const [owner, repo] = pushEvent.repo.name.split('/');

    const [repoEnriched, commitsEnriched] = await Promise.all([
        enrichEventURLs(owner, repo, pushEvent),
        enrichCommits(owner, repo, pushEvent),
    ]);

    return {
        created_at: pushEvent.created_at ?? '',
        ...repoEnriched,
        ...commitsEnriched,
    };
};

const lambdaResponse = (
    statusCode: number,
    body: EnrichedEvent[] | ErrorResponse,
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
        const eventsLimit = getEventsLimit(event.queryStringParameters);

        const events = await getEventsForUser(GITHUB_USERNAME);

        const publicPushEvents = events.filter((e): e is PushEvent => e.type === 'PushEvent');
        const slicedEvents = publicPushEvents.slice(0, eventsLimit);

        const enrichedEvents = await Promise.all(slicedEvents.map(enrichEvent));

        return lambdaResponse(200, enrichedEvents);
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        log(`Error: ${errorMessage}`);
        return lambdaResponse(500, { error: errorMessage });
    }
};
