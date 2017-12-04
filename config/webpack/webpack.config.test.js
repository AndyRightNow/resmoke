var path = require('path');
var baseConfig = require('./webpack.config.dev');

delete baseConfig.entry;
delete baseConfig.output;

module.exports = Object.assign(baseConfig, {
    module: {
        rules: [{
            test: /\.ts$/,
            use: [{
                loader: 'awesome-typescript-loader',
                options: {
                    configFileName: './tsconfig.test.json'
                }
            }]
        }]
    },
});