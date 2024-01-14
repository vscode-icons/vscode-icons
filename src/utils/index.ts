import open = require('open');
import { ChildProcess } from 'child_process';
import { Stats } from 'fs';
import { set } from 'lodash';
import { homedir, tmpdir } from 'os';
import { isAbsolute, posix, relative, resolve, sep } from 'path';
import {
  existsAsync,
  lstatAsync,
  mkdirAsync,
  readdirAsync,
  readFileAsync,
  rmdirAsync,
  unlinkAsync,
  writeFileAsync,
} from '../common/fsAsync';
import { FileFormat } from '../models';

export class Utils {
  public static getAppDataDirPath(): string {
    switch (process.platform) {
      case 'darwin':
        return `${homedir()}/Library/Application Support`;
      case 'linux':
        return `${homedir()}/.config`;
      case 'win32':
        return process.env.APPDATA;
      default:
        return '/var/local';
    }
  }

  public static pathUnixJoin(...paths: string[]): string {
    return posix.join(...paths);
  }

  public static tempPath(): string {
    return tmpdir();
  }

  public static fileFormatToString(extension: FileFormat | string): string {
    return `.${
      typeof extension === 'string' ? extension.trim() : FileFormat[extension]
    }`;
  }

  /**
   * Creates a directory and all subdirectories asynchronously
   */
  public static async createDirectoryRecursively(
    dirPath: string,
  ): Promise<void> {
    const callbackFn = async (
      parentDir: Promise<string>,
      childDir: string,
    ): Promise<string> => {
      const curDir = resolve(await parentDir, childDir);
      const dirExists: boolean = await existsAsync(curDir);
      if (!dirExists) {
        await mkdirAsync(curDir);
      }
      return curDir;
    };
    await dirPath
      .split(sep)
      .reduce(callbackFn, Promise.resolve(isAbsolute(dirPath) ? sep : ''));
  }

  /**
   * Deletes a directory and all subdirectories asynchronously
   */
  public static async deleteDirectoryRecursively(
    dirPath: string,
  ): Promise<void> {
    const dirExists: boolean = await existsAsync(dirPath);
    if (!dirExists) {
      return;
    }
    const iterator = async (file: string): Promise<void> => {
      const curPath = `${dirPath}/${file}`;
      const stats: Stats = await lstatAsync(curPath);
      if (stats.isDirectory()) {
        // recurse
        await this.deleteDirectoryRecursively(curPath);
      } else {
        // delete file
        await unlinkAsync(curPath);
      }
    };
    const promises: Array<Promise<void>> = [];
    const files: string[] = await readdirAsync(dirPath);
    files.forEach((file: string) => promises.push(iterator(file)));
    await Promise.all(promises);
    await rmdirAsync(dirPath);
  }

  /**
   * Converts a JavaScript Object Notation (JSON) string into an object
   * without throwing an exception.
   */
  public static parseJSONSafe<T>(text: string): T {
    try {
      return JSON.parse(text) as T;
    } catch (err) {
      return {} as T;
    }
  }

  public static async getRelativePath(
    fromDirPath: string,
    toDirName: string,
    checkDirectory = true,
  ): Promise<string> {
    if (fromDirPath == null) {
      throw new Error('fromDirPath not defined.');
    }

    if (toDirName == null) {
      throw new Error('toDirName not defined.');
    }

    const dirExists: boolean = await existsAsync(toDirName);
    if (checkDirectory && !dirExists) {
      throw new Error(`Directory '${toDirName}' not found.`);
    }

    return relative(fromDirPath, toDirName).replace(/\\/g, '/').concat('/');
  }

  public static removeFirstDot(txt: string): string {
    return txt.replace(/^\./, '');
  }

  public static belongToSameDrive(path1: string, path2: string): boolean {
    const [val1, val2] = this.getDrives(path1, path2);
    return val1 === val2;
  }

  public static overwriteDrive(sourcePath: string, destPath: string): string {
    const [val1, val2] = this.getDrives(sourcePath, destPath);
    return destPath.replace(val2, val1);
  }

  public static getDrives(...paths: string[]): string[] {
    const rx = new RegExp('^[a-zA-Z]:');
    return paths.map((path: string) => (rx.exec(path) || [])[0]);
  }

  public static combine(array1: string[], array2: string[]): string[] {
    return array1.reduce(
      (previous: string[], current: string) =>
        previous.concat(
          array2.map((value: string) => [current, value].join('.')),
        ),
      [],
    );
  }

  public static async updateFile(
    filePath: string,
    replaceFn: (rawText: string[]) => string[],
  ): Promise<void> {
    const raw = await readFileAsync(filePath, 'utf8');
    const lineBreak: string = raw.endsWith('\r\n') ? '\r\n' : '\n';
    const allLines: string[] = raw.split(lineBreak);
    const data: string = replaceFn(allLines).join(lineBreak);
    await writeFileAsync(filePath, data);
  }

  public static unflattenProperties<T>(
    obj: Record<string, unknown>,
    lookupKey: string,
  ): T {
    const newObj = {};
    Reflect.ownKeys(obj).forEach((key: string) =>
      set(newObj, key, obj[key][lookupKey]),
    );
    return newObj as T;
  }

  public static async open(
    target: string,
    options?: open.Options,
  ): Promise<ChildProcess> {
    await open(target, options);
    return;
  }
}
