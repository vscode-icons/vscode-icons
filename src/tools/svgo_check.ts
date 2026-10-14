import type { Config } from 'svgo' with { 'resolution-mode': 'import' };

import { readFileSync } from 'fs';
import { styleText } from 'node:util';

import { globSync } from 'glob';

async function check_optimized(argv: string[]): Promise<void> {
  const { loadConfig, optimize } = await import('svgo');

  const config: Config = await loadConfig('./svgo.config.mjs');
  const files: string[] = globSync(argv.slice(2), { nodir: true });
  const failed: string[] = [];

  if (!files.length) {
    console.error(
      styleText(
        'red',
        'Error: No SVG files provided. Usage: npm run lint:svgo <file> [<file>...]',
        { stream: process.stderr },
      ),
    );
    process.exit(1);
  }

  for (const file of files) {
    const input = readFileSync(file, 'utf8');
    config.path = file;
    const { data } = optimize(input, config);
    if (data !== input) {
      failed.push(file);
    }
  }

  if (failed.length) {
    console.error(
      styleText(
        'red',
        `Error: Icon not fully optimized (run "npm run optimize-icon <file>"):\n${failed.join('\n')}`,
        { stream: process.stderr },
      ),
    );
    process.exit(1);
  }
}

void check_optimized(process.argv);
