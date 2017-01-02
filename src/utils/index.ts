import * as path from 'path';
import { IVSCode } from '../models/IVSCode';

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
