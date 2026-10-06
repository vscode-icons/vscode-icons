import type { Configuration } from 'webpack';

import { resolve } from 'path';

import { BannerPlugin } from 'webpack';

import { constants } from './src/constants';

interface IWebpackArgv {
  [key: string]: unknown;
  mode?: 'development' | 'production' | 'none';
  env?: Record<string, unknown>;
}

const getConfig = (argv: IWebpackArgv): Configuration => ({
  context: resolve(__dirname, 'out'),
  // development mode only
  devtool: argv.mode === 'development' ? 'source-map' : false,
  // add our license notice
  plugins: [
    new BannerPlugin({
      banner: `vscode-icons <https://vscode-icons.github.io/vscode-icons/>
Copyright Roberto Huertas and other contributors
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
    path: resolve(__dirname, 'dist/src'),
    libraryTarget: 'commonjs2',
    // development mode only
    devtoolModuleFilenameTemplate:
      argv.mode === 'development' ? '../../out/[resource-path]' : '',
  },
  target: 'node',
});

export default [
  (
    _env: string | Record<string, boolean | number | string>,
    argv: IWebpackArgv,
  ): Configuration => {
    const config: Configuration = getConfig(argv);
    config.output.filename = constants.extension.distEntryFilename;
    return config;
  },
  (
    _env: string | Record<string, boolean | number | string>,
    argv: IWebpackArgv,
  ): Configuration => {
    const config: Configuration = getConfig(argv);
    config.entry = './src/uninstall.js';
    config.output.filename = constants.extension.uninstallEntryFilename;
    return config;
  },
  (
    _env: string | Record<string, boolean | number | string>,
    argv: IWebpackArgv,
  ): Configuration => {
    const config: Configuration = getConfig(argv);
    config.entry = './src/index.web.js';
    config.output.filename = constants.extension.distEntryFilenameWeb;
    return config;
  },
];
