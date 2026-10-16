import { mkdir } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';
import process from 'node:process';

import { rolldown } from 'rolldown';

const require = createRequire(import.meta.url);
const { constants } = require('../out/src/constants');

const rootDirectory = resolve(import.meta.dirname, '..');
const outputDirectory = resolve(rootDirectory, 'dist/src');
const production = process.argv[2] === 'production';

const banner = `/*!
vscode-icons <https://vscode-icons.github.io/vscode-icons/>
Copyright The vscode-icons Contributors
Source code released under MIT license <https://raw.githubusercontent.com/vscode-icons/vscode-icons/refs/heads/master/LICENSE>
Icons are licensed under the Creative Commons - ShareAlike (CC BY-SA) license <https://creativecommons.org/licenses/by-sa/4.0/>
Branded icons are licensed under their copyright license
*/`;

const entries = [
  {
    input: resolve(rootDirectory, 'out/src/index.js'),
    filename: constants.extension.distEntryFilename,
  },
  {
    input: resolve(rootDirectory, 'out/src/uninstall.js'),
    filename: constants.extension.uninstallEntryFilename,
  },
  {
    input: resolve(rootDirectory, 'out/src/index.web.js'),
    filename: constants.extension.distEntryFilenameWeb,
  },
];

await mkdir(outputDirectory, { recursive: true });

for (const { input, filename } of entries) {
  const bundle = await rolldown({
    external: ['vscode'],
    input,
    platform: 'node',
  });

  try {
    await bundle.write({
      banner,
      file: resolve(outputDirectory, filename),
      format: 'cjs',
      minify: production,
      sourcemap: !production,
    });
  } finally {
    await bundle.close();
  }
}
