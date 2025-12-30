/*global Handlebars*/

(() => {
    Handlebars.registerHelper('if_plural', function (arg, options) {
        if (arg !== 1) {
            return options.fn(this);
        }
        return options.inverse(this);
    });

    Handlebars.registerHelper('time_ago', function (timestamp) {
        const now = new Date();
        const past = new Date(timestamp);

        const elapsedSeconds = Math.floor((now - past) / 1000);

        const intervalsInSeconds = {
            year: 31536000,
            month: 2592000,
            week: 604800,
            day: 86400,
            hour: 3600,
            minute: 60,
        };

        for (let [unit, secondsInUnit] of Object.entries(intervalsInSeconds)) {
            const unitRatio = Math.floor(elapsedSeconds / secondsInUnit);

            if (unitRatio === 1) {
                return `1 ${unit} ago`;
            } else if (unitRatio > 1) {
                return `${unitRatio} ${unit}s ago`;
            }
        }

        return 'just now';
    });

    Handlebars.registerHelper('truncate', function (str, len) {
        if (str && str.length > len) {
            return str.substring(0, len);
        }

        return str;
    });
})();
