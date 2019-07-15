import { join } from 'path';
import { readdirAsync, readFileAsync, writeFileAsync } from '../common/fsAsync';
import { constants } from '../constants';

export class Bundler {
  public static async bundleLangResources(
    sourceDirPath: string,
    targetFilePath: string,
  ): Promise<void> {
    const iterator = async (filename: string, bundleObj: {}): Promise<void> => {
      const match = filename.match(/lang\.nls\.([a-zA-Z-]+)\.json/);
      const locale =
        filename === 'lang.nls.json'
          ? 'en'
          : match && match.length > 1
          ? match[1]
          : undefined;
      if (!locale) {
        throw new Error(`No locale found for: ${filename}`);
      }
      const content = await readFileAsync(join(sourceDirPath, filename));
      const translations = JSON.parse(content.toString());
      bundleObj[locale] = Reflect.ownKeys(translations).map(
        (key: string) => translations[key],
      );
    };
    const bundleJson = {};
    const promises: Array<Promise<void>> = [];
    const resourseFiles = await readdirAsync(sourceDirPath);
    resourseFiles.forEach((filename: string) =>
      promises.push(iterator(filename, bundleJson)),
    );
    await Promise.all(promises);

    if (!Reflect.ownKeys(bundleJson).length) {
      throw new Error('Bundling language resources failed');
    }

    await writeFileAsync(
      targetFilePath,
      JSON.stringify(
        bundleJson,
        null,
        constants.environment.production ? 0 : 2,
      ),
    );
  }

  public static async copyPackageResources(
    sourceDirPath: string,
    targetDirPath: string,
  ): Promise<void> {
    const iterator = async (filename: string): Promise<void> => {
      const content = await readFileAsync(join(sourceDirPath, filename));
      const bundleJson = JSON.parse(content.toString());
      await writeFileAsync(
        join(targetDirPath, filename),
        JSON.stringify(
          bundleJson,
          null,
          constants.environment.production ? 0 : 2,
        ),
      );
    };
    const promises = [];
    const resourseFiles = await readdirAsync(sourceDirPath);
    resourseFiles.forEach((filename: string) =>
      promises.push(iterator(filename)),
    );
    await Promise.all(promises);
  }
}
