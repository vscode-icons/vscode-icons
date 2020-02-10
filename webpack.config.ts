/* eslint-disable import/no-internal-modules */
import { resolve } from 'path';
import { CliConfigOptions, Configuration } from 'webpack';
import { constants } from './out/src/constants';

export default (
  _env: string | Record<string, boolean | number | string>,
  argv: CliConfigOptions,
): Configuration => {
  const config: Configuration = {
    mode: argv.mode,
    target: 'node',
    context: resolve(__dirname, 'out'),
    output: {
      path: resolve(__dirname, 'dist/src'),
      filename: constants.extension.distEntryFilename,
      libraryTarget: 'commonjs2',
    },
    node: {
      __dirname: false,
      __filename: false,
    },
    externals: {
      // The vscode-module is created on-the-fly and must be excluded.
      // Add other modules that cannot be webpack'ed.
      // 📖 -> https://webpack.js.org/configuration/externals/
      vscode: 'commonjs vscode',
    },
  };

  // development mode only
  if (config.mode === 'development') {
    config.devtool = 'source-map';
    config.output.devtoolModuleFilenameTemplate = '../../[resource-path]';
    return config;
  }
  return config;
};
