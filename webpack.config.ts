import webpack from 'webpack';
import { resolve } from 'path';
import { constants } from './out/src/constants';

const config: webpack.Configuration = {
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
}

/**
 * @param {any} env
 * @param {{mode: string}} argv
 */
export = (_env: any, argv: { mode: string }) => {
  // development mode only
  if (argv && argv.mode === 'development') {
    config.devtool = 'source-map';
    config.output.devtoolModuleFilenameTemplate = '../../[resource-path]'
    return config;
  }
  return config;
};
