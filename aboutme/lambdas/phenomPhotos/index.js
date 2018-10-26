const log = require('debug')('top-tracks:lambda');
const request = require('request-promise');
const { google } = require('googleapis');

const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET
);
oauth2Client.setCredentials({
    refresh_token: process.env.GOOGLE_REFRESH_TOKEN
});

let nextRefresh = Date.now();

exports.handler = async (event) => {
    log(`Received event: ${JSON.stringify(event)}`);

    // Check if access token needs to be refreshed
    if (Date.now() > nextRefresh) {
        const tokens = await oauth2Client.refreshAccessToken();

        process.env.GOOGLE_ACCESS_TOKEN = tokens.access_token;
        nextRefresh = new Date(tokens.expiry_date);
    }

    // Get number of photos to return from query string
    let photosLimit = undefined; // MAX

    if (event.queryStringParameters !== null) {
        photosLimit = event.queryStringParameters.limit;
    }

    // Get photos featuring landscapes and nothing else
    const auth = {
        'bearer': process.env.GOOGLE_ACCESS_TOKEN
    };

    const headers = {
        'Content-Type': 'application/json'
    };

    const json = {
        'pageSize': photosLimit,
        'filters': {
            'mediaTypeFilter': {
                'mediaTypes': [ 'PHOTO' ]
            },
            'contentFilter': {
                'includedContentCategories': [ 'LANDSCAPES', 'CITYSCAPES', 'LANDMARKS' ],
                'excludedContentCategories': [ 'SELFIES', 'PEOPLE' ]
            }
        }
    };

    const phenomPhotos = await request.post('https://photoslibrary.googleapis.com/v1/mediaItems:search', {
        auth: auth,
        headers: headers,
        json: json
    });

    return labmdaResponse(phenomPhotos);
};

const labmdaResponse = body => ({
    'statusCode': 200,
    'headers': {
        'Access-Control-Allow-Origin': '*'
    },
    'body': JSON.stringify(body),
    'isBase64Encoded': false
});
