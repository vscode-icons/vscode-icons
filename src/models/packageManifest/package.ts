import { IVSCodeManifest } from './vscode';

export interface IPackageManifest extends IVSCodeManifest {
  name: string;
  version: string;
  main: string;
  engines: Record<string, string>;
  icon: string;
  scripts: Record<string, string>;
  dependencies: Record<string, string>;
  devDependencies: Record<string, string>;
}
