import type { ChildProcess } from 'child_process';

import type { Options } from 'open';

import { homedir, tmpdir } from 'os';
import { posix, relative } from 'path';

import { set } from 'lodash';
import open from 'open';

import { existsAsync, readFileAsync, writeFileAsync } from '../common/fsAsync';
import * as enums from '../types/enums';

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

  /**
   * Converts a file format enum or string into a normalized string with a leading dot.
   * Defaults to '.svg' if the format is not recognized.
   */
  public static fileFormatToString(
    extension: enums.FileFormat | string = enums.FileFormat.svg,
  ): string {
    // Normalize the file format string
    // by removing leading dots and trimming whitespace
    const fileFormat: string | undefined =
      typeof extension === 'string'
        ? extension.trim().replace(/^\.+/, '')
        : enums.FileFormat[extension];

    // Fallback to svg if the file format is not recognized
    if (
      !Object.values(enums.FileFormat).some(
        (format: unknown): boolean =>
          typeof format === 'string' && format === fileFormat,
      )
    ) {
      return `.${enums.FileFormat[enums.FileFormat.svg]}`;
    }

    return `.${fileFormat}`;
  }

  /**
   * Converts a JavaScript Object Notation (JSON) string into an object
   * without throwing an exception.
   */
  public static parseJSONSafe<T>(text: string): T {
    try {
      return JSON.parse(text) as T;
    } catch {
      return {} as T;
    }
  }

  public static async getRelativePath(
    fromDirPath: string,
    toDirName: string,
    checkDirectory = true,
    includeDotSlashPrefix = false,
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

    let relativePath = relative(fromDirPath, toDirName).replace(/\\/g, '/');

    if (includeDotSlashPrefix && !/^\.\.?(\/|$)/.test(relativePath)) {
      relativePath = `./${relativePath}`;
    }

    if (!relativePath.endsWith('/')) {
      relativePath += '/';
    }

    return relativePath;
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
    return paths.map((path: string): string => (rx.exec(path) || [])[0]);
  }

  public static combine(array1: string[], array2: string[]): string[] {
    return array1.reduce(
      (previous: string[], current: string): string[] =>
        previous.concat(
          array2.map((value: string): string => [current, value].join('.')),
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
    Reflect.ownKeys(obj).forEach((key: string): object =>
      set(newObj, key, obj[key][lookupKey]),
    );
    return newObj as T;
  }

  public static async open(
    target: string,
    options?: Options,
  ): Promise<ChildProcess> {
    await open(target, options);
    return;
  }
}
