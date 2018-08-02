var githubUsername = 'ljhurst';
var githubConfig = {
    eventUrl: 'https://api.github.com/users/' + githubUsername + '/events',
    userAgent: githubUsername,
    pushType: 'PushEvent'
};

exports.githubConfig = githubConfig;
