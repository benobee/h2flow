const merge = require('webpack-merge');
const rules = require("./util/rules.js");
const plugins = require("./util/plugins.js")

const config = merge(rules, {
    context: __dirname,
    node: {
        dns: 'mock',
        net: 'mock',
        fs: 'empty'
    },
    resolve: {
        alias: {
            'masonry': 'masonry-layout',
            'isotope': 'isotope-layout',
            'vue': 'vue/dist/vue.min.js'
        }
    },
    plugins
});

module.exports = config;