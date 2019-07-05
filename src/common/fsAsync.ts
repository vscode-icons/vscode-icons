import * as fs from 'fs';
import { promisify } from 'util';

export const readdirAsync = promisify(fs.readdir);
export const mkdirAsync = promisify(fs.mkdir);
export const rmdirAsync = promisify(fs.rmdir);
export const readFileAsync = promisify(fs.readFile);
export const writeFileAsync = promisify(fs.writeFile);
export const unlinkAsync = promisify(fs.unlink);
export const lstatAsync = promisify(fs.lstat);
export const existsAsync = promisify(fs.exists);
