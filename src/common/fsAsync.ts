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

export {
  readdir as readdirAsync,
  mkdir as mkdirAsync,
  rm as rmdirAsync,
  readFile as readFileAsync,
  writeFile as writeFileAsync,
  unlink as unlinkAsync,
  lstat as lstatAsync,
};
export async function existsAsync(path: PathLike): Promise<boolean> {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}
