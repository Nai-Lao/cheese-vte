const path = require('path')
function resolve(dir){
    return path.join(__dirname, dir)
}
module.exports = {
    publicPath: './',
    runtimeCompiler: true,
    lintOnSave:false,
    assetsDir: 'js',
    outputDir: 'dist',
}
