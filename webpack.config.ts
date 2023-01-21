/* eslint-disable import/no-internal-modules */
import { resolve } from 'path';
import { Configuration } from 'webpack';
import { constants } from './out/src/constants';

const getConfig = (argv: any): Configuration => ({
  context: resolve(__dirname, 'out'),
  // development mode only
  devtool: argv.mode === 'development' ? 'source-map' : false,
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
      argv.mode === 'development' ? '../../[resource-path]' : '',
  },
  target: 'node',
});

export default [
  (
    _env: string | Record<string, boolean | number | string>,
    argv: any,
  ): Configuration => {
    const config: Configuration = getConfig(argv);
    config.output!.filename = constants.extension.distEntryFilename;
    return config;
  },
  (
    _env: string | Record<string, boolean | number | string>,
    argv: any,
  ): Configuration => {
    const config: Configuration = getConfig(argv);
    config.entry = './src/uninstall.js';
    config.output!.filename = constants.extension.uninstallEntryFilename;
    return config;
  },
  (
    _env: string | Record<string, boolean | number | string>,
    argv: any,
  ): Configuration => {
    const config: Configuration = getConfig(argv);
    config.entry = './src/index.web.js';
    config.output!.filename = constants.extension.distEntryFilenameWeb;
    return config;
  },
];
