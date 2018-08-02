$(function () {
    Handlebars.registerHelper('if_plural', function(arg, options) {
        if (arg !== 1) {
            return options.fn(this);
        }
        return options.inverse(this);
    });
});
