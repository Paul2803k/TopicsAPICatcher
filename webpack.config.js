const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const LodashModuleReplacementPlugin = require('lodash-webpack-plugin');

const path = require('path');

module.exports = {
    mode: 'development',
    context: path.resolve(__dirname, 'src'),
    entry: {
        proxy: './proxy.js',
        script_injector: './script_injector.js',
        background: './background.js',
        info: './info-tab/info.js',
    },
    output: {
        path: path.join(__dirname, 'dist'),
        filename: '[name].js',
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                loader: 'babel-loader',
            },
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader'],
            },
            {
                test: /\.svg$/,
                use: 'file-loader',
            },
            {
                test: /\.png$/,
                use: [
                    {
                        loader: 'url-loader',
                        options: {
                            mimetype: 'image/png',
                        },
                    },
                ],
            },
        ],
    },
    resolve: {
        modules: ['./src', './node_modules'],
    },
    plugins: [
        new CopyWebpackPlugin({
            patterns: [
                {
                    from: './manifest.json',
                    to: path.join(__dirname, 'dist/manifest.json'),
                },
                {
                    from: './icons',
                    to: path.join(__dirname, 'dist/icons'),
                },
                {
                    from: './material_icons',
                    to: path.join(__dirname, 'dist/material_icons'),
                },
            ],
        }),
        new HtmlWebpackPlugin({
            filename: 'history.html',
            template: 'src/example.html',
            chunks: ['exampleEntry'],
        }),
        new LodashModuleReplacementPlugin(), // Use lodash-webpack-plugin
    ],
};
