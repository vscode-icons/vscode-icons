import * as path from 'path';
import * as os from 'os';
import { IVSCode, FileFormat } from '../models';

export const vscode: IVSCode = {
  env: { appName: 'Code' },
  version: '1000.0.0',
};

export function isCodeContext() {
  return process.execPath.indexOf('code.exe') >= 0;
}

export function pathUnixJoin(...paths: string[]) {
  return path.posix.join(...paths);
}

export function vscodePath () {
  let appPath = process.env.APPDATA;
  if (!appPath) {
    if (process.platform === 'darwin') {
      appPath = process.env.HOME + '/Library/Application Support';
    } else if (process.platform === 'linux') {
      appPath = os.homedir() + '/.config';
    } else {
      appPath = '/var/local';
    }
  }
  return appPath;
};

export function fileFormatToString(extension: FileFormat | string): string {
  return `.${typeof extension === 'string' ? extension.trim() : FileFormat[extension]}`;
}
