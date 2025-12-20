/*global Handlebars*/

(async () => {
    const API = 'https://63rg8n6j71.execute-api.us-east-1.amazonaws.com/aboutme';
    const LIMIT = 5;

    // Create filler
    const FILLER_LOADING_TEXT = 'Loading...';
    const FILLER_HREF = '#';

    const fillerTrack = {
        album: {
            external_urls: { spotify: FILLER_HREF },
            images: [
                {
                    height: 640,
                    width: 640,
                    url: './images/Spotify_Icon_RGB_Black.png',
                },
            ],
        },
        artists: [
            {
                external_urls: { spotify: FILLER_HREF },
                name: FILLER_LOADING_TEXT,
            },
        ],
        external_urls: { spotify: FILLER_HREF },
        name: FILLER_LOADING_TEXT,
    };

    const fillerContrib = {
        actor: {
            login: FILLER_LOADING_TEXT,
            url: FILLER_HREF,
        },
        repo: {
            name: FILLER_LOADING_TEXT,
            url: FILLER_HREF,
        },
    };

    const SONG_TEMPLATE_ID = 'song-template';
    const CONTRIB_TEMPLATE_ID = 'contrib-template';

    const TOP_TRACKS_LIST_ID = 'top-tracks-list';
    const CURRENT_CONTRIBS_LIST_ID = 'current-contribs-list';

    const fillerTracks = new Array(LIMIT).fill().map(() => fillerTrack);
    const fillerContribs = new Array(LIMIT).fill().map(() => fillerContrib);

    const songsHtml = getInnterHtmlById(SONG_TEMPLATE_ID);
    const contribsHtml = getInnterHtmlById(CONTRIB_TEMPLATE_ID);

    const songsTemplate = Handlebars.compile(songsHtml);
    const contribsTemplate = Handlebars.compile(contribsHtml);

    setInnerHtmlById(TOP_TRACKS_LIST_ID, songsTemplate({ songs: fillerTracks }));
    setInnerHtmlById(CURRENT_CONTRIBS_LIST_ID, contribsTemplate({ contribs: fillerContribs }));

    // Render real data
    //$.ajax({ url: `${API}/top-tracks?limit=${LIMIT}` }).done((res) => {
    //    $('#top-tracks-list').html(songsTemplate({ songs: res.body.items }));
    //});

    const response = await fetch(`${API}/current-contribs?limit=${LIMIT}`);
    const contribs = await response.json();
    setInnerHtmlById(CURRENT_CONTRIBS_LIST_ID, contribsTemplate({ contribs: contribs }));

    function getInnterHtmlById(id) {
        return document.getElementById(id).innerHTML;
    }

    function setInnerHtmlById(id, html) {
        document.getElementById(id).innerHTML = html;
    }
})();
