import { IExtensionSettings } from './extensionSettings';

export interface ISettings {
  vscodeAppData: string; // path to the vscode app data folder
  workspacePath: string[]; // path to the workspace folders or root folder
  isWin: boolean;
  isInsiders: boolean;
  isOSS: boolean;
  isDev: boolean;
  extensionFolder: string; // path to the extension folder
  settingsPath: string; // path to the app's settings file
  vscodeVersion: string; // version number of vscode
  extensionSettings: IExtensionSettings;
}
