import createDebug from 'debug';
import type { APIGatewayProxyEvent } from 'aws-lambda';

import { handler } from './index.js';

const log = createDebug('current-contribs:test');

//const noLimit: APIGatewayProxyEvent = {
//    queryStringParameters: null,
//    body: null,
//    headers: {},
//    multiValueHeaders: {},
//    httpMethod: 'GET',
//    isBase64Encoded: false,
//    path: '/',
//    pathParameters: null,
//    multiValueQueryStringParameters: null,
//    stageVariables: null,
//    requestContext: {} as APIGatewayProxyEvent['requestContext'],
//    resource: '',
//} as APIGatewayProxyEvent;

const limit5: APIGatewayProxyEvent = {
    queryStringParameters: { limit: '5' },
    body: null,
    headers: {},
    multiValueHeaders: {},
    httpMethod: 'GET',
    isBase64Encoded: false,
    path: '/',
    pathParameters: null,
    multiValueQueryStringParameters: null,
    stageVariables: null,
    requestContext: {} as APIGatewayProxyEvent['requestContext'],
    resource: '',
} as APIGatewayProxyEvent;

//handler(noLimit).then((data) => log(data));
handler(limit5).then((data) => log(data));
