const webpack = require('webpack');
const merge = require('webpack-merge');
const common = require('./webpack.common.js');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');

const config = merge(common, {
    mode: 'production',
    entry: ['../main.js'],
    devtool: "source-map",
    module: {
        rules: [{
            test: /\.less$/,
            use: [
                MiniCssExtractPlugin.loader,
                'css-loader',
                'less-loader',
                {
                    loader: 'postcss-loader',
                    options: { config: { path: './postcss.config.js' } },
                }
            ]
        }]
    },
    plugins: [
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': JSON.stringify('production')
        }),
        new MiniCssExtractPlugin({
            filename: "bundle.css"
        }),
        new OptimizeCssAssetsPlugin()
    ],
    output: {
        publicPath: '/',
        path: __dirname + "../../../template/assets",
        filename: "bundle.js"
    }
});

module.exports = config;