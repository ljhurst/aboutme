$(function () {
    $.ajax({url: '/top-tracks'}).done(function (data) {
        var songsTemplate = Handlebars.compile($('#song-template').html());
        $('#top-tracks-list').html(songsTemplate({songs: data}));
    });
    $.ajax({url: '/current-contribs'}).done(function (data) {
        var contribsTemplate = Handlebars.compile($('#contrib-template').html());
        $('#current-contribs-list').html(contribsTemplate({contribs: data}));
    });
});
