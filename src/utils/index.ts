import opn = require('opn');
import * as fs from 'fs';
import { ChildProcess } from 'child_process';
import { homedir, tmpdir } from 'os';
import { isAbsolute, resolve, relative, posix } from 'path';
import { set } from 'lodash';
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
   * Creates a directory and all subdirectories synchronously
   *
   * @param {any} dirPath The directory's path
   */
  public static createDirectoryRecursively(dirPath: string): void {
    dirPath.split(posix.sep).reduce((parentDir, childDir) => {
      const curDir = resolve(parentDir, childDir);
      if (!fs.existsSync(curDir)) {
        fs.mkdirSync(curDir);
      }
      return curDir;
    }, isAbsolute(dirPath) ? posix.sep : '');
  }

  /**
   * Deletes a directory and all subdirectories synchronously
   *
   * @param {any} dirPath The directory's path
   */
  public static deleteDirectoryRecursively(dirPath: string): void {
    if (fs.existsSync(dirPath)) {
      fs.readdirSync(dirPath).forEach(file => {
        const curPath = `${dirPath}/${file}`;
        if (fs.lstatSync(curPath).isDirectory()) {
          // recurse
          this.deleteDirectoryRecursively(curPath);
        } else {
          // delete file
          fs.unlinkSync(curPath);
        }
      });
      fs.rmdirSync(dirPath);
    }
  }

  /**
   * Converts a JavaScript Object Notation (JSON) string into an object
   * without throwing an exception.
   *
   * @param {string} text A valid JSON string.
   */
  public static parseJSON(text: string): any {
    try {
      return JSON.parse(text);
    } catch (err) {
      return null;
    }
  }

  public static getRelativePath(
    fromDirPath: string,
    toDirName: string,
    checkDirectory: boolean = true
  ): string {
    if (fromDirPath == null) {
      throw new Error('fromDirPath not defined.');
    }

    if (toDirName == null) {
      throw new Error('toDirName not defined.');
    }

    if (checkDirectory && !fs.existsSync(toDirName)) {
      throw new Error(`Directory '${toDirName}' not found.`);
    }

    return relative(fromDirPath, toDirName)
      .replace(/\\/g, '/')
      .concat('/');
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
    return paths.map(x => (rx.exec(x) || [])[0]);
  }

  public static combine(array1: any[], array2: any[]): any[] {
    return array1.reduce(
      (previous: string[], current: string) =>
        previous.concat(array2.map(value => [current, value].join('.'))),
      []
    );
  }

  public static updateFile(
    filePath: string,
    replaceFn: (rawText: string[]) => string[]
  ): Thenable<void> {
    return new Promise((res, rej) => {
      fs.readFile(filePath, 'utf8', (error: Error, raw: string) => {
        if (error) {
          return rej(error);
        }
        const lineBreak: string = /\r\n$/.test(raw) ? '\r\n' : '\n';
        const allLines: string[] = raw.split(lineBreak);
        const data: string = replaceFn(allLines).join(lineBreak);
        fs.writeFile(filePath, data, (err: Error) => {
          if (err) {
            return rej(err);
          }
          res();
        });
      });
    });
  }

  public static unflattenProperties<T>(
    obj: { [key: string]: any },
    lookupKey: string
  ): T {
    const newObj = {};
    Reflect.ownKeys(obj).forEach((key: string) =>
      set(newObj, key, obj[key][lookupKey])
    );
    return newObj as T;
  }

  public static open(target: string, options?: any): Promise<ChildProcess> {
    return opn(target, options);
  }
}
