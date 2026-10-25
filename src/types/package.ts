import type { IVSCodeCommand } from './vscode';

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

export interface IVSCodeManifest {
  contributes: IVSCodeContributes;
}

export interface IVSCodeContributes {
  iconThemes: IVSCodeIconTheme[];
  commands: IVSCodeCommand[];
  configuration: IVSCodeConfiguration;
}

export interface IVSCodeIconTheme {
  path: string;
  _watch: boolean;
}

export interface IVSCodeConfiguration {
  title: string;
  properties: Record<string, IVSCodeProperties>;
}
export interface IVSCodeProperties {
  type: string;
  default: boolean | string | unknown[] | null;
  description: string;
}
