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
        try {
            const response = await fetch(`${API}/${endpoint}?limit=${LIMIT}`);

            if (!response.ok) {
                throw {
                    type: 'http',
                    message: `Failed to load ${endpoint} data`,
                    status: response.status,
                    sectionName: endpoint,
                };
            }

            return await response.json();
        } catch (error) {
            if (error.type) {
                throw error;
            }

            if (error instanceof SyntaxError) {
                throw {
                    type: 'parse',
                    message: `Invalid data received from ${endpoint}`,
                    sectionName: endpoint,
                };
            }

            throw {
                type: 'network',
                message: `Unable to connect to ${endpoint}`,
                sectionName: endpoint,
            };
        }
    }

    function renderSection(listId, template, data) {
        setInnerHtmlById(listId, template({ items: data }));
    }

    function renderError(listId, template, errorData) {
        setInnerHtmlById(listId, template(errorData));
    }

    function handleError(sectionName, error, listId) {
        console.error(`Error processing ${sectionName}:`, error);

        const userFriendlyMessage = getUserFriendlyMessage(error, sectionName);
        const errorData = {
            sectionName: sectionName,
            message: userFriendlyMessage,
            canRetry: true,
        };

        const errorTemplateHtml = getInnerHtmlById('error-template');
        const errorTemplate = Handlebars.compile(errorTemplateHtml);

        renderError(listId, errorTemplate, errorData);
    }

    function getUserFriendlyMessage(error, sectionName) {
        if (error.type === 'network') {
            return `Unable to load ${sectionName}. Please check your connection.`;
        }

        if (error.type === 'http') {
            if (error.status >= 500) {
                return `Service temporarily unavailable. Please try again later.`;
            }
            return `Unable to load ${sectionName} at this time.`;
        }

        if (error.type === 'parse') {
            return `Failed to load ${sectionName}.`;
        }

        return `Failed to load ${sectionName}.`;
    }

    function showRetrySpinner(sectionName) {
        const button = document.querySelector(`button[data-section="${sectionName}"]`);
        if (button) {
            const spinner = button.querySelector('.retry-spinner');
            if (spinner) {
                spinner.classList.remove('hidden');
            }
            button.disabled = true;
        }
    }

    function hideRetrySpinner(sectionName) {
        const button = document.querySelector(`button[data-section="${sectionName}"]`);
        if (button) {
            const spinner = button.querySelector('.retry-spinner');
            if (spinner) {
                spinner.classList.add('hidden');
            }
            button.disabled = false;
        }
    }

    function registerRetryFunction(sectionName, loadFunction) {
        if (!window.retryFunctions) {
            window.retryFunctions = {};
        }

        window.retryFunctions[sectionName] = async () => {
            showRetrySpinner(sectionName);
            try {
                await loadFunction();
            } finally {
                hideRetrySpinner(sectionName);
            }
        };
    }

    function createDataSource(config) {
        const templateHtml = getInnerHtmlById(config.templateId);
        const template = Handlebars.compile(templateHtml);
        const fillerArray = new Array(LIMIT).fill().map(() => config.filler);

        renderSection(config.listId, template, fillerArray);

        const loadFunction = async () => {
            try {
                const data = await fetchData(config.endpoint);
                renderSection(config.listId, template, data);
            } catch (error) {
                handleError(config.sectionName, error, config.listId);
            }
        };

        registerRetryFunction(config.sectionName, loadFunction);

        return loadFunction;
    }

    const dataSources = [
        {
            templateId: 'song-template',
            listId: 'top-tracks-list',
            endpoint: 'top-tracks',
            sectionName: 'Top Tracks',
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
            sectionName: 'Current Contributions',
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
            sectionName: 'Recent Runs',
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
