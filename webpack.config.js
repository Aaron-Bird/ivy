const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    mode: 'development',
    entry: ['./src/main.js'],
    output: {
        filename: 'main.js',
        path: path.resolve(__dirname, 'dist')
    },
    devServer: {
        contentBase: './dist',
        port: 8000,
    },
    plugins: [
        new HtmlWebpackPlugin({
            title: 'ivy',
            template: './src/index.html',
            inject: 'head'
        })
    ],
    module: {
        rules: [{
            test: /\.css$/,
            use: [
                'style-loader',
                'css-loader'
            ]
        }]
    }
};