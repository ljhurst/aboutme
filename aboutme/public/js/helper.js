/*global Handlebars*/

(() => {
    const NO_DURATION = '--:--';

    const MILES_PER_METER = 0.000621371;
    const METERS_PER_SEC_TO_MIN_PER_MILE = 26.8224;

    const SECONDS_PER_HOUR = 3600;
    const SECONDS_PER_MINUTE = 60;

    const FEET_PER_METER = 3.28084;

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

    Handlebars.registerHelper('format_distance', function (meters) {
        if (!meters) {
            return '-.-';
        }

        const miles = meters * MILES_PER_METER;

        return miles.toFixed(1) + ' mi';
    });

    Handlebars.registerHelper('format_pace', function (metersPerSec) {
        if (!metersPerSec || metersPerSec === 0) {
            return NO_DURATION;
        }

        const minPerMile = METERS_PER_SEC_TO_MIN_PER_MILE / metersPerSec;
        const mins = Math.floor(minPerMile);
        const secs = Math.round((minPerMile - mins) * SECONDS_PER_MINUTE);

        return `${mins}:${secs.toString().padStart(2, '0')}`;
    });

    Handlebars.registerHelper('format_duration', function (seconds) {
        if (!seconds) {
            return NO_DURATION;
        }

        const hours = Math.floor(seconds / SECONDS_PER_HOUR);
        const mins = Math.floor((seconds % SECONDS_PER_HOUR) / SECONDS_PER_MINUTE);
        const secs = Math.round(seconds % SECONDS_PER_MINUTE);

        if (hours > 0) {
            return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    });

    Handlebars.registerHelper('format_elevation', function (meters) {
        if (!meters) {
            return '-';
        }

        const feet = meters * FEET_PER_METER;
        return Math.round(feet) + ' ft';
    });
})();
