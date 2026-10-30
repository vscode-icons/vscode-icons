import type { Config, Output } from 'svgo' with { 'resolution-mode': 'import' };

import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { styleText } from 'node:util';

import { globSync } from 'glob';

async function checkOptimized(argv: string[]): Promise<void> {
  const { loadConfig, optimize } = await import('svgo');

  const projectRoot: string = resolve(__dirname, '../../..');
  const config: Config | null = await loadConfig(undefined, projectRoot);
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
    process.exitCode = 1;
    return;
  }

  for (const file of files) {
    const input: string = await readFile(file, 'utf8');
    const output: Output = optimize(input, { ...config, path: file });
    if (output.data !== input) {
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
    process.exitCode = 1;
    return;
  }
}

void checkOptimized(process.argv);
