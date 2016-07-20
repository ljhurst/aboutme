$(function () {
    $.ajax({url: '/top-tracks'})
        .done(function (data) {
            var songsTemplate = Handlebars.compile($('#song-template').html());
            $('#top-tracks-list').html(songsTemplate({songs: data}));
        });
});
