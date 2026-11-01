import type { PathLike } from 'node:fs';

import {
  access,
  lstat,
  mkdir,
  readFile,
  readdir,
  rm,
  unlink,
  writeFile,
} from 'node:fs/promises';

export const readdirAsync = readdir;
export const mkdirAsync = mkdir;
export const rmdirAsync = rm;
export const readFileAsync = readFile;
export const writeFileAsync = writeFile;
export const unlinkAsync = unlink;
export const lstatAsync = lstat;
export async function existsAsync(path: PathLike): Promise<boolean> {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}
