/* eslint-disable import/no-internal-modules */
import { resolve } from 'path';
import { CliConfigOptions, Configuration, ProvidePlugin } from 'webpack';
import { constants } from './out/src/constants';

const getConfig = (argv: CliConfigOptions): Configuration => ({
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

const addWebConfig = (config: Configuration): Configuration => {
  config.target = 'webworker';
  config.plugins = [
    new ProvidePlugin({
      process: 'process/browser',
    }),
  ]
  config.resolve = { 
    alias:{
      path: require.resolve('path-browserify') 
    }
  }
  config.node = {
    ...config.node,
    fs: 'empty',
    child_process: 'empty',
    module: 'empty'
  }
  return config;
}

export default [
  (
    _env: string | Record<string, boolean | number | string>,
    argv: CliConfigOptions,
  ): Configuration => {
    const config: Configuration = getConfig(argv);
    config.output.filename = constants.extension.distEntryNodeFilename;
    return config;
  },
  (
    _env: string | Record<string, boolean | number | string>,
    argv: CliConfigOptions,
  ): Configuration => {
    const config: Configuration = getConfig(argv);
    config.entry = './src/uninstall.js';
    config.output.filename = constants.extension.uninstallEntryNodeFilename;
    return config;
  },

  // web versions
  (
    _env: string | Record<string, boolean | number | string>,
    argv: CliConfigOptions,
  ): Configuration => {
    const config: Configuration = addWebConfig(getConfig(argv));
    config.output.filename = constants.extension.distEntryWebFilename;
    return config;
  },
  (
    _env: string | Record<string, boolean | number | string>,
    argv: CliConfigOptions,
  ): Configuration => {
    const config: Configuration = addWebConfig(getConfig(argv));
    config.output.filename = constants.extension.uninstallEntryWebFilename;
    return config;
  },
];
