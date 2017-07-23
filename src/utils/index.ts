import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { IVSCode, FileFormat } from '../models';

export const vscode: IVSCode = {
  env: { appName: 'Code' },
  version: '1000.0.0',
};

export function pathUnixJoin(...paths: string[]): string {
  return path.posix.join(...paths);
}

export function vscodePath(): string {
  switch (process.platform) {
    case 'darwin':
      return `${process.env.HOME}/Library/Application Support`;
    case 'linux':
      return `${os.homedir()}/.config`;
    case 'win32':
      return process.env.APPDATA;
    default:
      return '/var/local';
  }
}

export function tempPath(): string {
  return os.tmpdir();
}

export function fileFormatToString(extension: FileFormat | string): string {
  return `.${typeof extension === 'string' ? extension.trim() : FileFormat[extension]}`;
}

/**
 * Creates a directory and all subdirectories synchronously
 *
 * @param {any} dirPath The directory's path
 */
export function createDirectoryRecursivelySync(dirPath: string): void {
  dirPath.split(path.posix.sep).reduce((parentDir, childDir) => {
    const curDir = path.resolve(parentDir, childDir);
    if (!fs.existsSync(curDir)) { fs.mkdirSync(curDir); }
    return curDir;
  }, path.isAbsolute(dirPath) ? path.posix.sep : '');
}

/**
 * Deletes a directory and all subdirectories synchronously
 *
 * @param {any} dirPath The directory's path
 */
export function deleteDirectoryRecursivelySync(dirPath: string): void {
  if (fs.existsSync(dirPath)) {
    fs.readdirSync(dirPath).forEach(file => {
      const curPath = `${dirPath}/${file}`;
      if (fs.lstatSync(curPath).isDirectory()) { // recurse
        deleteDirectoryRecursivelySync(curPath);
      } else { // delete file
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
export function parseJSON(text: string): any {
  try {
    return JSON.parse(text);
  } catch (err) {
    return null;
  }
}

export function getRelativePath(fromDirPath: string, toDirName: string, checkDirectory: boolean = true): string {
  if (fromDirPath == null) {
    throw new Error('fromDirPath not defined.');
  }

  if (toDirName == null) {
    throw new Error('toDirName not defined.');
  }

  if (checkDirectory && !fs.existsSync(toDirName)) {
    throw new Error(`Directory '${toDirName}' not found.`);
  }

  return path.relative(fromDirPath, toDirName).replace(/\\/g, '/').concat('/');
}

export function removeFirstDot(txt: string): string {
  return txt.indexOf('.') === 0 ? txt.substring(1, txt.length) : txt;
}

export function belongToSameDrive(path1: string, path2: string): boolean {
  const [val1, val2] = this.getDrives(path1, path2);
  return val1 === val2;
}

export function overwriteDrive(sourcePath: string, destPath: string): string {
  const [val1, val2] = this.getDrives(sourcePath, destPath);
  return destPath.replace(val2, val1);
}

export function getDrives(...paths: string[]): string[] {
  const rx = new RegExp('^[a-zA-Z]:');
  return paths.map(x => (rx.exec(x) || [])[0]);
}

export function flatten(obj: object, separator = '.'): object {
  const isValidObject = (value: any): boolean => {
    if (!value) { return false; }
    const isArray = Array.isArray(value);
    const isBuffer = Buffer.isBuffer(value);
    const isΟbject = Object.prototype.toString.call(value) === "[object Object]";
    const hasKeys = !!Object.keys(value).length;
    return !isArray && !isBuffer && isΟbject && hasKeys;
  };
  const _flatten = (child: any, paths = []): object[] => {
    return [].concat(...Object.keys(child)
      .map(key => isValidObject(child[key])
        ? _flatten(child[key], [...paths, key])
        : { [[...paths, key].join(separator)]: child[key] }));
  };
  return Object.assign({}, ..._flatten(obj));
}
