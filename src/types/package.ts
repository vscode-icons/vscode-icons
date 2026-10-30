import type { VSCodeCommand } from './vscode';

export interface PackageManifest extends VSCodeManifest {
  name: string;
  version: string;
  main: string;
  engines: Record<string, string>;
  icon: string;
  scripts: Record<string, string>;
  dependencies: Record<string, string>;
  devDependencies: Record<string, string>;
}

export interface VSCodeManifest {
  contributes: VSCodeContributes;
}

export interface VSCodeContributes {
  iconThemes: VSCodeIconTheme[];
  commands: VSCodeCommand[];
  configuration: VSCodeConfiguration;
}

export interface VSCodeIconTheme {
  path: string;
  _watch: boolean;
}

export interface VSCodeConfiguration {
  title: string;
  properties: Record<string, VSCodeProperties>;
}
export interface VSCodeProperties {
  type: string;
  default: boolean | string | unknown[] | null;
  description: string;
}
