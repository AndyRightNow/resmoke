var path = require('path');
var baseConfig = require('./webpack.config.base');
var webpack = require('webpack');

module.exports = Object.assign(baseConfig, {
    plugins: [
        new webpack.DefinePlugin({
            PRODUCTION: JSON.stringify(false)
        })
    ]
});
