import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { IVSCode, FileFormat } from '../models';

export const vscode: IVSCode = {
  env: { appName: 'Code' },
  version: '1000.0.0',
};

export function isCodeContext(): boolean {
  return process.execPath.indexOf('code.exe') >= 0;
}

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
};

export function tempPath(): string {
  return os.tmpdir();
};

export function fileFormatToString(extension: FileFormat | string): string {
  return `.${typeof extension === 'string' ? extension.trim() : FileFormat[extension]}`;
}

/**
 * Deletes a directory and all subdirectories
 *
 * @param {any} path The directory's path
 */
export function deleteDirectoryRecursively(path): void {
  if (fs.existsSync(path)) {
    fs.readdirSync(path).forEach(file => {
      const curPath = `${path}/${file}`;
      if (fs.lstatSync(curPath).isDirectory()) { // recurse
        deleteDirectoryRecursively(curPath);
      } else { // delete file
        fs.unlinkSync(curPath);
      }
    });
    fs.rmdirSync(path);
  }
}
