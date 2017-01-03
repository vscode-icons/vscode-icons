import * as path from 'path';
import * as os from 'os';
import { IVSCode } from '../models';

export const vscode: IVSCode = {
  env: { appName: 'Code' },
  version: '1000.0.0',
};

export function isCodeContext() {
  return process.execPath.indexOf('code.exe') >= 0;
}

export function pathUnixJoin(...paths: string[]) {
  const p = path.join(...paths).replace(/\\/g, '/');
  return p;
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
