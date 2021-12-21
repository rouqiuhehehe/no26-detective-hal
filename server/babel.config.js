const path = require('path');

module.exports = {
    // extensions: ['.ts', '.js'],
    presets: [
        [
            '@babel/preset-env',
            {
                targets: {
                    node: 'current'
                }
            }
        ],
        '@babel/preset-typescript'
    ],
    plugins: [
        [
            'module-resolver',
            {
                root: [path.resolve('./')],
                alias: {
                    '@util': './src/util/index',
                    '@src': './src'
                },
                extensions: ['.js', '.ts']
            }
        ],
        [
            // @babel/plugin-proposal-decorators 需要在 @babel/plugin-proposal-class-properties 之前
            '@babel/plugin-proposal-decorators',
            {
                legacy: true // 推荐
            }
        ],
        ['@babel/plugin-proposal-class-properties']
    ]
};
