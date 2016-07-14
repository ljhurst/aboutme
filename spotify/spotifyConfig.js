var spotifyConfig = {
    topTracksUrl: 'https://api.spotify.com/v1/me/top/tracks',
    requestParams: {
        time_range: 'short_term',
        limit: 5,
    },
};

module.exports.spotifyConfig = spotifyConfig;
