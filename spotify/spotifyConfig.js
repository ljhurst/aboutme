var spotifyConfig = {
    topTracksUrl: 'https://api.spotify.com/v1/me/top/tracks',
    auth: {
        bearer_token: 'BQCwJs4pRTkuD815_xtveGQDC1W_nNKaO03e1-cwaQiihJVVX7SPbeoCO5fc48fsPfwfxY_QYivWR1AAmFS_9lPsi5eqtD6zKkFaVRrR213Tf_ByC1NM6pbLowwwisEtFNLwKY4vIeGQptJjLF4',
    },
    requestParams: {
        time_range: 'short_term',
        limit: 5,
    },
};

module.exports.spotifyConfig = spotifyConfig;
