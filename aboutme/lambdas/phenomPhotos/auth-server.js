const express = require('express');
const log = require('debug')('phenom-photos:auth');
const { google } = require('googleapis');

const PORT = 8888;

const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    `http://localhost:${PORT}/callback`
);

const app = express();

app.get('/', (req, res) => {
    const authURL = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: 'https://www.googleapis.com/auth/photoslibrary.readonly'
    });
    res.send(`<a href="${authURL}">Authorize</a>`);
});

app.get('/callback', async (req, res) => {
    const { tokens } = await oauth2Client.getToken(req.query.code);

    log(`GOOGLE_ACCESS_TOKEN=${tokens.access_token}`);
    log(`GOOGLE_REFRESH_TOKEN=${tokens.refresh_token}`);

    res.send('Access token and refresh token have been printed to stdout');
});

app.listen(PORT, () => log(`listening on ${PORT}`));
