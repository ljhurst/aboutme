import SpotifyWebApi from 'spotify-web-api-node';
import createDebug from 'debug';
import express from 'express';
import fs from 'fs';
import https from 'https';

const log = createDebug('top-tracks:auth');

const HOST = '127.0.0.1';
const PORT = 8888;
const URL_STRING = `https://${HOST}:${PORT}`;

const REQUIRED_ENV_VARS = ['SPOTIFY_CLIENT_ID', 'SPOTIFY_CLIENT_SECRET'];
const KEY_PATH = 'key.pem';
const CERT_PATH = 'cert.pem';

for (const path of [KEY_PATH, CERT_PATH]) {
    if (!fs.existsSync(path)) {
        log(
            `Missing ${path} in ${process.cwd()}.\n` +
                `Generate a self-signed cert. See README for command.`,
        );
        process.exit(1);
    }
}

const options = {
    key: fs.readFileSync(KEY_PATH),
    cert: fs.readFileSync(CERT_PATH),
};

const missingEnvVars = REQUIRED_ENV_VARS.filter((name) => !process.env[name]);

if (missingEnvVars.length > 0) {
    log(`Missing required env var(s): ${missingEnvVars.join(', ')}`);
    process.exit(1);
}

const spotifyWebApi = new SpotifyWebApi({
    clientId: process.env.SPOTIFY_CLIENT_ID,
    clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
    redirectUri: `${URL_STRING}/callback`,
});

const app = express();

app.get('/', (req, res) => {
    const scopes = ['user-top-read'];
    const authURL = spotifyWebApi.createAuthorizeURL(scopes);
    res.send(`<a href="${authURL}">Authorize</a>`);
});

app.get('/callback', async (req, res) => {
    const response = await spotifyWebApi.authorizationCodeGrant(req.query.code);

    log(`SPOTIFY_ACCESS_TOKEN=${response.body.access_token}`);
    log(`SPOTIFY_REFRESH_TOKEN=${response.body.refresh_token}`);

    res.send('Access token and refresh token have been printed to stdout');
});

https.createServer(options, app).listen(PORT, HOST, () => {
    log(`HTTPS server running on ${URL_STRING}`);
});
