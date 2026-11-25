import type { Config } from 'svgo' with { 'resolution-mode': 'import' };

import { glob, readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { styleText } from 'node:util';

async function checkOptimized(argv: string[]): Promise<void> {
  const { loadConfig, optimize } = await import('svgo');

  const projectRoot: string = resolve(__dirname, '../../..');
  const config: Config | null = await loadConfig(undefined, projectRoot);
  const files: string[] = [];
  for await (const file of glob(argv.slice(2))) {
    files.push(file);
  }

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

  const inputs: string[] = await Promise.all(
    files.map((file: string): Promise<string> => readFile(file, 'utf8')),
  );
  const failed: string[] = files.filter(
    (file: string, index: number): boolean =>
      optimize(inputs[index], { ...config, path: file }).data !== inputs[index],
  );

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
