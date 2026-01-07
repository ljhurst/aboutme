/*global Handlebars*/

(async () => {
    const API = 'https://63rg8n6j71.execute-api.us-east-1.amazonaws.com/aboutme';
    const LIMIT = 5;

    const FILLER_LOADING_TEXT = 'Loading...';
    const FILLER_HREF = '#';

    function getInnerHtmlById(id) {
        return document.getElementById(id).innerHTML;
    }

    function setInnerHtmlById(id, html) {
        document.getElementById(id).innerHTML = html;
    }

    async function fetchData(endpoint) {
        const response = await fetch(`${API}/${endpoint}?limit=${LIMIT}`);

        return response.json();
    }

    function renderSection(listId, template, data) {
        setInnerHtmlById(listId, template({ items: data }));
    }

    function handleError(sectionName, error) {
        console.error(`Error processing ${sectionName}:`, error);
    }

    function createDataSource(config) {
        const templateHtml = getInnerHtmlById(config.templateId);
        const template = Handlebars.compile(templateHtml);
        const fillerArray = new Array(LIMIT).fill().map(() => config.filler);

        renderSection(config.listId, template, fillerArray);

        return async () => {
            try {
                const data = await fetchData(config.endpoint);
                renderSection(config.listId, template, data);
            } catch (error) {
                handleError(config.endpoint, error);
            }
        };
    }

    const dataSources = [
        {
            templateId: 'song-template',
            listId: 'top-tracks-list',
            endpoint: 'top-tracks',
            filler: {
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
            },
        },
        {
            templateId: 'contrib-template',
            listId: 'current-contribs-list',
            endpoint: 'current-contribs',
            filler: {
                actor: {
                    login: FILLER_LOADING_TEXT,
                    url: FILLER_HREF,
                },
                repo: {
                    name: FILLER_LOADING_TEXT,
                    url: FILLER_HREF,
                },
            },
        },
        {
            templateId: 'run-template',
            listId: 'recent-runs-list',
            endpoint: 'recent-runs',
            filler: {
                activityName: FILLER_LOADING_TEXT,
                averageHR: '-',
                calories: '-',
                elevationGain: null,
                avgPower: '- ',
            },
        },
    ];

    const loadFunctions = dataSources.map((config) => createDataSource(config));
    loadFunctions.forEach((loadFunc) => loadFunc());
})();
