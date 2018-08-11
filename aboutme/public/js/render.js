$(function () {
    // Create filler
    const fillerContrib = {
        'actor': {
            'login': 'Loading...',
            'url': '#'
        },
        'repo': {
            'name': 'Loading...',
            'url': '#'
        },
    };

    const fillerContribs = new Array(5).fill().map(u => fillerContrib);

    // Get templates
    let songsTemplate = Handlebars.compile($('#song-template').html());
    let contribsTemplate = Handlebars.compile($('#contrib-template').html());

    // Render filler data
    $('#current-contribs-list').html(contribsTemplate({contribs: fillerContribs}));

    // Render real data
    $.ajax({url: '/top-tracks'}).done(function (data) {
        $('#top-tracks-list').html(songsTemplate({songs: data}));
    });
    $.ajax({url: '/current-contribs'}).done(function (data) {
        $('#current-contribs-list').html(contribsTemplate({contribs: data}));
    });
});
