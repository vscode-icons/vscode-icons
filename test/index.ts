import path from 'path';

import * as glob from 'glob';
import Mocha from 'mocha';

export const run = async (testsRoot: string): Promise<void> => {
  const mocha = new Mocha({
    ui: 'bdd',
    timeout: 15000,
    color: true,
  });
  try {
    // Add files into Mocha
    const files: string[] = await glob.glob('**/**.test.js', {
      cwd: testsRoot,
    });
    files.forEach((file: string) => mocha.addFile(path.join(testsRoot, file)));
    // Run the tests
    await new Promise<void>((resolve, reject) => {
      mocha.run((failures: number) => {
        mocha.dispose();
        if (failures > 0) {
          return reject(new Error(`${failures} tests failed.`));
        }
        resolve();
      });
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      error.stack = error.message;
      throw error;
    }
    throw new Error('Failed to run tests', { cause: error });
  }
};
