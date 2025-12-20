import createDebug from 'debug';
import { Octokit } from '@octokit/rest';

const log = createDebug('current-contribs:lambda');

const octokit = new Octokit();

const GITHUB_USERNAME = 'ljhurst';
const NO_EVENTS_LIMIT = undefined;

const getEventsLimit = (queryStringParameters) => {
    if (queryStringParameters !== null) {
        return queryStringParameters.limit;
    }

    return NO_EVENTS_LIMIT;
};

const getEventsForUser = async (username) => {
    const result = await octokit.rest.activity.listPublicEventsForUser({
        username,
    });

    return result.data;
};

const enrichEventURLs = async (pushEvent) => {
    const [owner, repo] = pushEvent.repo.name.split('/');

    const result = await octokit.repos.get({ owner, repo });

    pushEvent.actor.url = result.data.owner.html_url;
    pushEvent.repo.name = result.data.name;
    pushEvent.repo.url = result.data.html_url;

    return pushEvent;
};

const lambdaResponse = (body) => ({
    statusCode: 200,
    headers: {
        'Access-Control-Allow-Origin': '*',
    },
    body: JSON.stringify(body),
    isBase64Encoded: false,
});

export const handler = async (event) => {
    log(`Received event: ${JSON.stringify(event)}`);

    const eventsLimit = getEventsLimit(event.queryStringParameters);

    const events = await getEventsForUser(GITHUB_USERNAME);

    const publicPushEvents = events.filter((e) => e.type === 'PushEvent');
    const slicedEvents = publicPushEvents.slice(0, eventsLimit);

    await Promise.all(slicedEvents.map(enrichEventURLs));

    return lambdaResponse(slicedEvents);
};
