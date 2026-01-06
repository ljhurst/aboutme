import { Octokit } from '@octokit/rest';
import createDebug from 'debug';

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

const enrichEventURLs = async (owner, repo, pushEvent) => {
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

const enrichCommits = async (owner, repo, pushEvent) => {
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

const enrichEvent = async (pushEvent) => {
    const [owner, repo] = pushEvent.repo.name.split('/');

    const [repoEnriched, commitsEnriched] = await Promise.all([
        enrichEventURLs(owner, repo, pushEvent),
        enrichCommits(owner, repo, pushEvent),
    ]);

    return {
        created_at: pushEvent.created_at,
        ...repoEnriched,
        ...commitsEnriched,
    };
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

    const enrichedEvents = await Promise.all(slicedEvents.map(enrichEvent));

    return lambdaResponse(enrichedEvents);
};
