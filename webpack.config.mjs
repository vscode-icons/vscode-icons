import { createRequire } from 'node:module';
import { resolve } from 'node:path';

import webpack from 'webpack';

const require = createRequire(import.meta.url);
const { constants } = require('./out/src/constants');

const rootDirectory = import.meta.dirname;

function getConfig(argv) {
  return {
    context: resolve(rootDirectory, 'out'),
    // development mode only
    devtool: argv.mode === 'development' ? 'source-map' : false,
    // add our license notice
    plugins: [
      new webpack.BannerPlugin({
        banner: `vscode-icons <https://vscode-icons.github.io/vscode-icons/>
Copyright The vscode-icons Contributors
Source code released under MIT license <https://raw.githubusercontent.com/vscode-icons/vscode-icons/refs/heads/master/LICENSE>
Icons are licensed under the Creative Commons - ShareAlike (CC BY-SA) license <https://creativecommons.org/licenses/by-sa/4.0/>
Branded icons are licensed under their copyright license`,
      }),
    ],
    externals: {
      // The vscode-module is created on-the-fly and must be excluded.
      // Add other modules that cannot be webpack'ed.
      // 📖 -> https://webpack.js.org/configuration/externals/
      vscode: 'commonjs vscode',
    },
    mode: argv.mode,
    node: {
      __dirname: false,
      __filename: false,
    },
    output: {
      path: resolve(rootDirectory, 'dist/src'),
      libraryTarget: 'commonjs2',
      // development mode only
      devtoolModuleFilenameTemplate:
        argv.mode === 'development' ? '../../out/[resource-path]' : '',
    },
    target: 'node',
  };
}

export default [
  (_env, argv) => {
    const config = getConfig(argv);
    config.output.filename = constants.extension.distEntryFilename;
    return config;
  },
  (_env, argv) => {
    const config = getConfig(argv);
    config.entry = './src/uninstall.js';
    config.output.filename = constants.extension.uninstallEntryFilename;
    return config;
  },
  (_env, argv) => {
    const config = getConfig(argv);
    config.entry = './src/index.web.js';
    config.output.filename = constants.extension.distEntryFilenameWeb;
    return config;
  },
];
