import * as path from 'path';
import * as Mocha from 'mocha';
import * as glob from 'glob';

export const run = (testsRoot: string): Promise<void> => {
  const mocha = new Mocha({
    ui: 'bdd',
    timeout: 15000,
    color: true,
  });
  return new Promise((res, rej) => {
    glob('**/**.test.js', { cwd: testsRoot }, (error, files) => {
      if (error) {
        return rej(error);
      }
      try {
        // Fill into Mocha
        files.forEach((file: string) =>
          mocha.addFile(path.join(testsRoot, file)),
        );
        // Run the tests
        mocha.run((failures: number) => {
          if (failures > 0) {
            rej(new Error(`${failures} tests failed.`));
          } else {
            res();
          }
        });
      } catch (err) {
        return rej(err);
      }
    });
  });
};
