var path = require('path');
var baseConfig = require('./webpack.config.dev');

delete baseConfig.entry;
delete baseConfig.output;

module.exports = baseConfig;