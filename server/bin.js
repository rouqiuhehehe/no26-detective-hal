require('ts-node').register({
    files: true,
    logError: true
});
const tsConfig = require('./tsconfig.json');

const baseUrl = './';
require('tsconfig-paths').register({
    baseUrl,
    paths: tsConfig.compilerOptions.paths
});

// cleanup();
