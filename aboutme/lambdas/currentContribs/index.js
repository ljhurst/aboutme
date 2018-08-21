const octokit = require('@octokit/rest')();

octokit.authenticate({
       type: 'token',
       token: process.env.GH_TOKEN
});

exports.handler = async (event) => {
    console.log(`Received event: ${JSON.stringify(event)}`);

    // Get number of events to return from query string
    var eventsLimit = undefined; // MAX

    if (event.queryStringParameters !== null) {
        if (event.queryStringParameters.limit !== null &&
            event.queryStringParameters.limit !== undefined &&
            event.queryStringParameters.limit !== "") {
                eventsLimit = event.queryStringParameters.limit;
            }
    }

    // Get events for user
    const username = process.env.GH_LOGIN;

    const result = await octokit.activity.getEventsForUser({ username });
    const events = result.data;

    // Select only public events
    const publicEvents = events.filter(e => !e.private);

    // Select only Push Events
    const publicPushEvents = publicEvents.filter(e => e.type === 'PushEvent');

    // Select only the first limit push events
    const slicedEvents = publicPushEvents.slice(0, eventsLimit);

    // Update the Push Event's urls
    const updatedPushEventPromises = slicedEvents.map(async (pushEvent) => {
        const [ owner, repo ] = pushEvent.repo.name.split('/');

        const result = await octokit.repos.get({ owner, repo });

        pushEvent.actor.url = result.data.owner.html_url;
        pushEvent.repo.name = result.data.name;
        pushEvent.repo.url = result.data.html_url;

        return pushEvent;
    });

    return Promise.all(updatedPushEventPromises).then(labmdaResponse);
};

const labmdaResponse = body => ({
    'statusCode': 200,
    'headers': {
        'Access-Control-Allow-Origin': '*'
    },
    'body': JSON.stringify(body),
    'isBase64Encoded': false
});
