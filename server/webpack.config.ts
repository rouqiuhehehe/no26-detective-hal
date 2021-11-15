import { CleanWebpackPlugin } from 'clean-webpack-plugin';
import CopyWebpackPlugin from 'copy-webpack-plugin';
import fs from 'fs';
import path from 'path';
import * as webpack from 'webpack';
// in case you run into any typescript error when configuring `devServer`

const nodeModules: Record<string, string> = {};
const debug = process.env.NODE_ENV !== 'production';

fs.readdirSync('node_modules')
    .filter((x) => {
        return ['.bin'].indexOf(x) === -1;
    })
    .forEach((mod) => {
        nodeModules[mod] = 'commonjs ' + mod;
    });

const config: webpack.Configuration = {
    mode: process.env.NODE_ENV as 'development' | 'production',
    target: 'node',
    entry: './src/app.ts',
    output: {
        path: path.resolve(__dirname, 'build'),
        // publicPath: __dirname,
        filename: 'app.bundle.js',
        libraryTarget: 'commonjs',
        chunkFilename: '[name].[hash:5].js'
    },
    // devtool: debug ? 'inline-source-map' : false,
    devtool: 'inline-source-map',
    externalsPresets: {
        node: true
    },
    // externals: [
    //     (data, callback) => {
    //         if (
    //             typeof data.request === 'string' &&
    //             (new RegExp('bcrypt').test(data.request) || new RegExp('express').test(data.request))
    //         ) {
    //             return callback(undefined, 'commonjs ' + data.request);
    //         }
    //         callback();
    //     }
    // ],
    externals: nodeModules,
    context: __dirname,
    node: {
        __dirname: false,
        __filename: false
    },
    module: {
        rules: [
            {
                exclude: /.(css|js|html|tsx?)$/,
                loader: 'file-loader'
                // options: {
                //     emitFile: false
                // }
            },
            {
                test: /\.tsx?$/,
                use: [
                    {
                        // 指定加载器
                        loader: 'babel-loader',
                        options: {
                            // 设置预定义的运行环境
                            babelrc: false,
                            presets: [
                                [
                                    // 指定环境的插件
                                    '@babel/preset-env',
                                    // 配置信息
                                    {
                                        // 要兼容的浏览器版本
                                        targets: {
                                            browsers: ['last 2 versions', 'safari >= 7']
                                        },
                                        // 指定corejs的版本
                                        corejs: '3',
                                        // 使用corejs的方式： usage=>按需加载
                                        useBuiltIns: 'usage',
                                        modules: false
                                    }
                                ],
                                '@babel/preset-typescript'
                            ],
                            plugins: [
                                '@babel/plugin-syntax-dynamic-import',
                                '@babel/transform-runtime',
                                ['@babel/plugin-proposal-decorators', { legacy: true }],
                                '@babel/plugin-proposal-class-properties'
                            ],
                            env: {
                                client: {
                                    plugins: ['@babel/plugin-syntax-dynamic-import']
                                }
                            }
                        }
                    },
                    // {
                    //     loader: 'ts-loader',
                    //     options: {
                    //         configFile: path.resolve(__dirname, './tsconfig.json'),
                    //         transpileOnly: true
                    //     }
                    // },
                    {
                        loader: 'tslint-loader',
                        options: {
                            configFile: path.resolve(__dirname, './tslint.json')
                        }
                    }
                ],
                exclude: /node_modules/
            }
        ]
    },
    resolve: {
        extensions: ['.ts', '.js', '.json'],
        fallback: {
            // path: require.resolve('path-browserify'),
            // url: require.resolve('url'),
            // buffer: require.resolve('buffer'),
            // util: require.resolve('util')
            // stream: require.resolve('stream-browserify')
        },
        alias: {
            '@types': path.resolve(__dirname, './src/types/'),
            '@util': path.resolve(__dirname, './src/util/index.ts'),
            '@src': path.resolve(__dirname, './src/')
        }
    },
    plugins: [
        new CleanWebpackPlugin({
            cleanAfterEveryBuildPatterns: ['build']
        }),
        new webpack.DefinePlugin({
            'process.env.NODE_DEBUG': JSON.stringify(false)
            // Buffer: JSON.stringify(require("buffer/").Buffer)
        }),
        new webpack.ProvidePlugin({
            Buffer: ['buffer', 'Buffer']
        }),
        new CopyWebpackPlugin({
            patterns: [
                // {
                //     from: path.join(__dirname, './src/assets'),
                //     to: path.join(__dirname, './build/assets')
                // },
                {
                    from: path.join(__dirname, './src/views'),
                    to: path.join(__dirname, './build/views')
                }
                // {
                //     from: path.join(__dirname, './src/public'),
                //     to: path.join(__dirname, './build/public')
                // },
                // {
                //     from: path.join(__dirname, './src/models/socket/tls/ssl'),
                //     to: path.join(__dirname, './build/ssl')
                // },
                // {
                //     from: path.join(__dirname, './src/models/socket/https/ssl'),
                //     to: path.join(__dirname, './build/ssl')
                // }
            ]
        })
    ],
    optimization: {
        minimize: true //是否压缩代码
    }
};

export default config;
