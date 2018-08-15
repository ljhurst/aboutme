$(function () {
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
    }

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

    const fillerTracks = new Array(5).fill().map(u => fillerTrack);
    const fillerContribs = new Array(5).fill().map(u => fillerContrib);

    // Get templates
    let songsTemplate = Handlebars.compile($('#song-template').html());
    let contribsTemplate = Handlebars.compile($('#contrib-template').html());

    // Render filler data
    $('#top-tracks-list').html(songsTemplate({songs: fillerTracks}));
    $('#current-contribs-list').html(contribsTemplate({contribs: fillerContribs}));

    // Render real data
    $.ajax({url: '/top-tracks'}).done(function (data) {
        $('#top-tracks-list').html(songsTemplate({songs: data}));
    });
    $.ajax({url: '/current-contribs'}).done(function (data) {
        $('#current-contribs-list').html(contribsTemplate({contribs: data}));
    });
});
