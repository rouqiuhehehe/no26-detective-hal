// eslint-disable-next-line @typescript-eslint/no-var-requires
const path = require('path')

module.exports = {
    runtimeCompiler: true,
    publicPath: './',
    outputDir: path.join(__dirname, '../server/src/public'),
    assetsDir: 'assets',
    devServer: {
        // outputDir: 'dist',
        host: '127.0.0.1',
        port: 9999,
        proxy: {
            // '/files':{
            //     target: 'https://imgkr.com/api',//代理地址，这里设置的地址会代替axios中设置的baseURL
            //     changeOrigin: true,// 如果接口跨域，需要进行这个参数配置
            //     //ws: true, // proxy websockets
            //     //pathRewrite方法重写url
            // //     pathRewrite: {
            // //         '^/smms': '/'
            // //         //pathRewrite: {'^/api': '/'} 重写之后url为 http://192.168.1.16:8085/xxxx
            // //         //pathRewrite: {'^/api': '/api'} 重写之后url为 http://192.168.1.16:8085/api/xxxx
            // //    }
            // },
            '/': {
                target: 'http://127.0.0.1:1337', //代理地址，这里设置的地址会代替axios中设置的baseURL
                changeOrigin: true
            }
        },
        disableHostCheck: true
    },
    // configureWebpack: {
    //     // provide the app's title in webpack's name field, so that
    //     // it can be accessed in index.html to inject the correct title.
    //     name: '狗蛋',
    //     resolve: {
    //       alias: {
    //         '@': resolve('src')
    //       }
    //     }
    // },
};
// https://sm.ms/api/v2/
