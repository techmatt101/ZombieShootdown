module.exports = function(config) {
    config.set({
        basePath: '',
        frameworks: ['jasmine'],
        browsers : ['PhantomJS'],
        files: [
            'test/*/*.spec.js',
            'test/*/*/*.spec.js',
            'src/build/*.js'
        ]
    });
};