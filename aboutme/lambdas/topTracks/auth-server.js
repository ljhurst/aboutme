const SpotifyWebApi = require('spotify-web-api-node');
const express = require('express');
const log = require('debug')('top-tracks:auth');

const PORT = 8888;

const spotifyWebApi = new SpotifyWebApi({
    clientId: process.env.SPOTIFY_CLIENT_ID,
    clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
    redirectUri: `http://localhost:${PORT}/callback`
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

app.listen(PORT, () => log(`listening on ${PORT}`));
