module.exports = {
    plugins: [
        require('postcss-smart-import')({ /* ...options */ }),
        require('autoprefixer')({
            'browsers': ['> 1%', 'last 2 versions']
        })
    ]
}