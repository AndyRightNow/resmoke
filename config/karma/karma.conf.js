process.env.CHROME_BIN = require('puppeteer').executablePath();

module.exports = function (config) {
    config.set({
        frameworks: ['jasmine'],
        files: [{
            pattern: '../../**/__tests__/browser/*.spec.ts',
            watched: true
        }],
        reporters: ['mocha'],
        preprocessors: {
            '../../**/__tests__/browser/*.spec.ts': ['webpack']
        },
        webpack: require('./../webpack/webpack.config.test'),
        browsers: ['Chrome'],
        webpackMiddleware: {
            stats: 'error-only'
        },
        plugins: [
            'karma-chrome-launcher',
            'karma-webpack',
            'karma-jasmine',
            'karma-mocha-reporter'
        ],
        autoWatch: true,
        singleRun: false,
        logLevel: config.LOG_DEBUG, 
        mime: {
            'text/x-typescript': ['ts','tsx']
          }
    })
}
