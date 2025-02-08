import { join } from 'path';
import { readdirAsync, readFileAsync, writeFileAsync } from '../common/fsAsync';
import { constants } from '../constants';
import { Utils } from '../utils';

export class Bundler {
  public static async bundleLangResources(
    sourceDirPath: string,
    targetFilePath: string,
  ): Promise<void> {
    const iterator = async (
      filename: string,
      bundleObj: Record<string, unknown>,
    ): Promise<void> => {
      const match = /lang\.nls\.([a-zA-Z-]+)\.json/.exec(filename);
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
      const translations: Record<string, string> = Utils.parseJSONSafe<
        Record<string, string>
      >(content.toString());
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
      const bundleJson = Utils.parseJSONSafe<Record<string, unknown>>(
        content.toString(),
      );
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
