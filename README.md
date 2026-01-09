# aboutme

A repository for my personal website

[![Frontend](https://github.com/ljhurst/aboutme/workflows/Frontend/badge.svg)](https://github.com/ljhurst/aboutme/actions/workflows/frontend.yml)
[![Backend](https://github.com/ljhurst/aboutme/workflows/Backend/badge.svg)](https://github.com/ljhurst/aboutme/actions/workflows/backend.yml)

## Where

My website is available at <http://lj-aboutme.s3-website-us-west-2.amazonaws.com>

## Tour

```tree
.
├── aboutme
│   ├── lambdas    # <-- Backend Lambda source code
│   ├── public     # <-- Static site source code
│   └── terraform  # <-- Full stack infrastructure
└── README.md
```

## Tech Stack

- Static site hosted on [AWS S3](https://aws.amazon.com/s3/)
- TypeScript [Lambda](https://aws.amazon.com/lambda/) functions behind an [API Gateway](https://aws.amazon.com/api-gateway/)

## Deployment

### Authentication

An `aboutme-deploy` user is available to manage the infrastructure and deploy the code.
If you don't have credentials you'll have to go to the console to create new ones

Save the credentials in `~/.aws/credentials` under an `[aboutme]` profile

```bash
[aboutme]
aws_access_key_id = <access-key-id>
aws_secret_access_key = <secret-access-key>
```

And then export the profile for use with Terraform and AWS CLI

```bash
export AWS_PROFILE=aboutme
```

### Infrastructure

Infrastructure is managed by [Terraform](https://www.terraform.io/).

Go to `aboutme/terraform` and initialize Terraform

```bash
terraform init
```

Review the planned changes

```bash
terraform plan
```

Apply the changes

```bash
terraform apply
```

When making changes to the infrastructure be sure to format and validate

```bash
terraform fmt
terraform validate
```

### Frontend

Upload static assets to the S3 bucket at `s3://lj-aboutme/`.

Go to `aboutme/public` and build the static assets

```bash
npm run build
```

Deploy the static assets

```bash
aws --profile aboutme s3 sync dist/ s3://lj-aboutme/ --delete
```

### Backend

#### Lambda

Go to whichever function you want to deploy.

Zip up the Lambda handler and its dependencies.

```bash
npm run zip
```

Deploy it

```bash
aws --profile aboutme lambda update-function-code --function-name lj-aboutme-current-contribs --zip-file fileb://currentContribs.zip  --region us-east-1 
```

If you need to update environment variables, modify them in `aboutme/terraform/terraform.tfvars`
and re-apply the Terraform configuration.

#### API Gateway

A `lj-aboutme` API Gateway exists to allow the browser to call the Lambda functions. There is a resource for each integration.

The API Gateway uses the [Lambda proxy integration](https://docs.aws.amazon.com/apigateway/latest/developerguide/api-gateway-create-api-as-simple-proxy-for-lambda.html)
to allow the Lambda function to access request information like query parameters in the event delivered to the Lambda.
This means the Lambda response must be formatted in a specific way to pass through the API Gateway response.
See [here](https://docs.aws.amazon.com/apigateway/latest/developerguide/api-gateway-create-api-as-simple-proxy-for-lambda.html#api-gateway-proxy-integration-lambda-function-nodejs)
for a JavaScript example. In general the response looks like this.

```json
{
    "statusCode": 200,
    "headers": {
        "Access-Control-Allow-Origin": "*"
    },                                                                          
    "body": "{}",                                               
    "isBase64Encoded": false
}
```

The API Gateway allows CORS so that the endpoints can be invoked directly from the browser.
CORS in enabled in Terraform

## Integrations

The data the site surfaces is powered by various API's

### Spotify

The song data is pulled from [Spotify's Top Tracks API](https://developer.spotify.com/documentation/web-api/reference/personalization/get-users-top-artists-and-tracks/).
This API allows a user to pull their "top" tracks or artists over the short and long term. "Top" is measured by a user's affinity and is calculated using several data points.

This integrations requires authorization so an app exists in the [Spotify Developer Dashboard](https://developer.spotify.com/dashboard).
The standard `client_id` and `client_secret` are found here.

The next steps are to prime the OAuth flow to get an `access_token`.
`access_token`'s are generated via an OAuth round trip.

We need a secure redirect URL so first we'll generate a cert for HTTPS.
We only need to fill out the `Common Name` field with 127.0.0.1 when prompted.

```bash
openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -days 365 -nodes
```

Then run the provided server

```bash
DEBUG=top-tracks:auth node auth-server.js
```

Then open a browser and visit <https://localhost:8888>.

There you will see a link to authorize with Spotify.
After clicking the link, the `access_token` and associated `refresh_token` will be printed to the terminal so they can be saved in `.env` or uploaded to the Lambda.

### GitHub

The contribution data is pulled from [GitHub's Public User Events API](https://docs.github.com/en/rest/activity/events?apiVersion=2022-11-28#list-public-events-for-a-user).
Events are enriched with links from [GitHub's Repos API](https://docs.github.com/en/rest/repos/repos?apiVersion=2022-11-28#get-a-repository)
and commit information from [GitHub's Commits API](https://docs.github.com/en/rest/commits/commits?apiVersion=2022-11-28#compare-two-commits).

### Garmin Connect

The run data is pull from [Garmin Connect](https://connect.garmin.com/modern/)
with the help of the [garmin-connect](https://github.com/Pythe1337N/garmin-connect) library.
