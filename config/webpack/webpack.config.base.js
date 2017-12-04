var path = require('path');

module.exports = {
    entry: path.resolve(__dirname, '../../src/index.ts'),
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, '../../dist'),
        libraryTarget: 'umd',
        library: 'Resmoke'
    },
    module: {
        rules: [{
            test: /\.ts$/,
            use: [{
                loader: 'babel-loader'
            },{
                loader: 'awesome-typescript-loader',
                options: {
                    configFileName: './tsconfig.json'
                }
            }]
        }]
    },
    resolve: {
        extensions: [
            '.ts',
            '.js',
            '.json'
        ]
    }
};
