const rules = {
    module: {
        rules: [{
            enforce: 'pre',
            test: /\.js$/,
            exclude: /node_modules/,
            use: [
                "babel-loader",
                {
                    loader: "eslint-loader",
                    options: {
                        emitWarning: true,
                        fix: true
                    }
                },
            ]
        }, {
            test: /\.css$/,
            use: [
                'style-loader',
                'css-loader'
            ]
        }, {
            test: /\.json$/,
            use: "json-loader"
        }]
    }
}

module.exports = rules;