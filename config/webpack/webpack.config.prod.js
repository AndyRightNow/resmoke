var path = require('path');
var baseConfig = require('./webpack.config.base');
var UglifyJsPlugin = require('uglifyjs-webpack-plugin');
var webpack = require('webpack');

module.exports = Object.assign(baseConfig, {
    plugins: [
        new webpack.DefinePlugin({
            PRODUCTION: JSON.stringify(true)
        }),
        new UglifyJsPlugin({
            uglifyOptions: {
                mangle: true,
                compress: true,
            }
        })
    ]
});
