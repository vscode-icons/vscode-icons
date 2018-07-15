import { IExtensionSettings } from './extensionSettings';

export interface ISettings {
  vscodeAppUserPath: string; // path to the vscode app user directory
  workspacePath: string[]; // path to the workspace or root directory
  isWin: boolean;
  isInsiders: boolean;
  isOSS: boolean;
  isDev: boolean;
  settingsFilePath: string; // path to the app's settings file
  vscodeVersion: string; // version number of vscode
  extensionSettings: IExtensionSettings;
}
