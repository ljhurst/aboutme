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

    const fillerRun = {
        activityName: FILLER_LOADING_TEXT,
        averageHR: '-',
        calories: '-',
        elevationGain: null,
        avgPower: '- ',
    };

    const SONG_TEMPLATE_ID = 'song-template';
    const CONTRIB_TEMPLATE_ID = 'contrib-template';
    const RUN_TEMPLATE_ID = 'run-template';

    const TOP_TRACKS_LIST_ID = 'top-tracks-list';
    const CURRENT_CONTRIBS_LIST_ID = 'current-contribs-list';
    const RECENT_RUNS_LIST_ID = 'recent-runs-list';

    const fillerTracks = new Array(LIMIT).fill().map(() => fillerTrack);
    const fillerContribs = new Array(LIMIT).fill().map(() => fillerContrib);
    const fillerRuns = new Array(LIMIT).fill().map(() => fillerRun);

    const songsHtml = getInnterHtmlById(SONG_TEMPLATE_ID);
    const contribsHtml = getInnterHtmlById(CONTRIB_TEMPLATE_ID);
    const runsHtml = getInnterHtmlById(RUN_TEMPLATE_ID);

    const songsTemplate = Handlebars.compile(songsHtml);
    const contribsTemplate = Handlebars.compile(contribsHtml);
    const runsTemplate = Handlebars.compile(runsHtml);

    setInnerHtmlById(TOP_TRACKS_LIST_ID, songsTemplate({ songs: fillerTracks }));
    setInnerHtmlById(CURRENT_CONTRIBS_LIST_ID, contribsTemplate({ contribs: fillerContribs }));
    setInnerHtmlById(RECENT_RUNS_LIST_ID, runsTemplate({ runs: fillerRuns }));

    const [tracksResult, contribsResult, runsResult] = await Promise.allSettled([
        fetch(`${API}/top-tracks?limit=${LIMIT}`).then((res) => res.json()),
        fetch(`${API}/current-contribs?limit=${LIMIT}`).then((res) => res.json()),
        fetch(`${API}/recent-runs?limit=${LIMIT}`).then((res) => res.json()),
    ]);

    if (tracksResult.status === 'fulfilled') {
        setInnerHtmlById(
            TOP_TRACKS_LIST_ID,
            songsTemplate({ songs: tracksResult.value.body.items }),
        );
    }

    if (contribsResult.status === 'fulfilled') {
        setInnerHtmlById(
            CURRENT_CONTRIBS_LIST_ID,
            contribsTemplate({ contribs: contribsResult.value }),
        );
    }

    if (runsResult.status === 'fulfilled') {
        setInnerHtmlById(RECENT_RUNS_LIST_ID, runsTemplate({ runs: runsResult.value }));
    }

    if (tracksResult.status === 'rejected') {
        console.error('Error fetching top tracks:', tracksResult.reason);
    }

    if (contribsResult.status === 'rejected') {
        console.error('Error fetching current contributions:', contribsResult.reason);
    }

    if (runsResult.status === 'rejected') {
        console.error('Error fetching recent runs:', runsResult.reason);
    }

    function getInnterHtmlById(id) {
        return document.getElementById(id).innerHTML;
    }

    function setInnerHtmlById(id, html) {
        document.getElementById(id).innerHTML = html;
    }
})();
