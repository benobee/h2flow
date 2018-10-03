const webpack = require('webpack');
const merge = require('webpack-merge');
const common = require('./webpack.common.js');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');
const optimization = require("./util/optimization.js");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const WebpackBundleAnalyzer = require("webpack-bundle-analyzer").BundleAnalyzerPlugin;

const config = merge(common, optimization, {
    mode: 'production',
    entry: ['../../main.js', '../../main.less'],
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
                    options: { config: { path: './build-tools/postcss.config.js' } },
                }
            ]
        }]
    },
    plugins: [
        // new UglifyJSPlugin(),
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': JSON.stringify('production')
        }),
        new MiniCssExtractPlugin({
            filename: "bundle.css",
            chunkFilename: "[id].css"
        }),
        new WebpackBundleAnalyzer()
    ],
    output: {
        publicPath: '/',
        path: __dirname + "../../../template/assets",
        filename: "bundle.js"
    }
});

module.exports = config;