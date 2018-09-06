/*global $*/
/*global Handlebars*/

$(function () {
    const API = 'https://63rg8n6j71.execute-api.us-east-1.amazonaws.com/aboutme';
    const LIMIT = 5;

    // Create filler
    const FILLER_OADING_TEXT = 'Loading...';
    const FILLER_HREF = '#';

    const fillerTrack = {
        'album': {
            'external_urls': { 'spotify': FILLER_HREF },
            'images': [{
                'height': 640,
                'width': 640,
                'url': './images/Spotify_Icon_RGB_Black.png'
            }]
        },
        'artists': [{
            'external_urls': { 'spotify': FILLER_HREF },
            'name': FILLER_OADING_TEXT
        }],
        'external_urls': { 'spotify': FILLER_HREF },
        'name': FILLER_OADING_TEXT
    };

    const fillerContrib = {
        'actor': {
            'login': FILLER_OADING_TEXT,
            'url': FILLER_HREF
        },
        'repo': {
            'name': FILLER_OADING_TEXT,
            'url': FILLER_HREF
        },
    };

    const fillerTracks = new Array(LIMIT).fill().map(() => fillerTrack);
    const fillerContribs = new Array(LIMIT).fill().map(() => fillerContrib);

    // Get templates
    let songsTemplate = Handlebars.compile($('#song-template').html());
    let contribsTemplate = Handlebars.compile($('#contrib-template').html());

    // Render filler data
    $('#top-tracks-list').html(songsTemplate({songs: fillerTracks}));
    $('#current-contribs-list').html(contribsTemplate({contribs: fillerContribs}));

    // Render real data
    $.ajax({url: `${API}/top-tracks?limit=${LIMIT}`}).done(function (res) {
        $('#top-tracks-list').html(songsTemplate({songs: res.body.items}));
    });
    $.ajax({ url: `${API}/current-contribs?limit=${LIMIT}` }).done(function (data) {
        $('#current-contribs-list').html(contribsTemplate({contribs: data}));
    });
});
