'use strict'

const rpn = require('request-promise-native');

const GITHUB_USER = 'ljhurst';
const GITHUB_EVENT_URL = `https://api.github.com/users/${GITHUB_USER}/events`
const GITHUB_PUSH_EVENT = 'PushEvent'

exports.handler = async (event) => {
    console.log(`event: ${JSON.stringify(event)}`);

    // Get number of events to return from query string
    var eventsLimit = undefined; // MAX

    if (event.queryStringParameters !== null &&
        event.queryStringParameters !== undefined) {
        if (event.queryStringParameters.limit !== null &&
            event.queryStringParameters.limit !== undefined &&
            event.queryStringParameters.limit !== "") {
                eventsLimit = event.queryStringParameters.limit;
            }
    }

    // Get Push Events
    return await rpn({
        uri: GITHUB_EVENT_URL,
        headers: {
            'User-Agent': GITHUB_USER
        },
        json: true
    }).then(events => {
        // Select only Push Events
        const pushEvents = events.filter(e => e.type === GITHUB_PUSH_EVENT);

        // Select only the first limit Push Events
        const slicedEvents = pushEvents.slice(0, eventsLimit);

        // Update the Push Event's urls
        return Promise.all(slicedEvents.map(pushEvent => {
            return rpn({
                uri: pushEvent.repo.url,
                headers: {
                    'User-agent': GITHUB_USER
                },
                json: true
            }).then(repo => {
                pushEvent.actor.url = repo.owner.html_url;
                pushEvent.repo.name = repo.name;
                pushEvent.repo.url = repo.html_url;
                return pushEvent;
            }).catch(handleError);
        })).then(mappedEvents => ({
            contribs: mappedEvents
        })).catch(handleError);
    }).catch(handleError);
};

const handleError = err => {
    console.error(`caught ${err}`);
    return err;
};
