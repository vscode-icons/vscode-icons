import { TextDecoder, TextEncoder } from 'util';
import * as vscode from 'vscode';

export const readdirAsync = vscode.workspace.fs.readDirectory;
export const mkdirAsync = vscode.workspace.fs.createDirectory;
export const rmdirAsync = vscode.workspace.fs.delete;
export const readFileAsync = vscode.workspace.fs.readFile;
export const writeFileAsync = vscode.workspace.fs.writeFile;
export const unlinkAsync = vscode.workspace.fs.delete;
export const lstatAsync = vscode.workspace.fs.stat;
export const Uri = vscode.Uri;

export const existsAsync = async function (uri: vscode.Uri): Promise<boolean> {
  try {
    await vscode.workspace.fs.stat(uri);
    return true;
  } catch {
    return false;
  }
};

export const stringToRawData = function (text: string): Uint8Array {
  return new TextEncoder().encode(text);
};

export const rawDataToString = function (data: Uint8Array): string {
  return new TextDecoder().decode(data);
};
