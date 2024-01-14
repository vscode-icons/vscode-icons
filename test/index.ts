import * as path from 'path';
import * as Mocha from 'mocha';
import * as glob from 'glob';

export const run = async (testsRoot: string): Promise<void | Error> => {
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
    mocha.run((failures: number) => {
      if (failures > 0) {
        throw new Error(`${failures} tests failed.`);
      }
      mocha.dispose();
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      return error;
    }
    throw new Error(`Failed to run tests: ${error as string}`);
  }
};
