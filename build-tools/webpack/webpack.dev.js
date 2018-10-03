const merge = require('webpack-merge');
const common = require('./webpack.common.js');
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

const config = merge(common, {
    mode: 'development',
    entry: ['../../main.js'],
    devtool: 'inline-source-map',
    devServer: {
        contentBase: './test/'
    },
    module: {
        rules: [{ // @rule: LESS
            test: /\.less$/,
            use: [
                'style-loader',
                'css-loader',
                'less-loader'
            ]
        }, ]
    },
    plugins: [
        new HtmlWebpackPlugin({
            filename: "index.html"
        })
    ],
    output: {
        filename: "bundle.js"
    }
});

module.exports = config;