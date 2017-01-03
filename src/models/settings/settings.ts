import { IExtensionSettings } from './extensionSettings';

export interface ISettings {
  vscodeAppData: string; // path to the vscode app data folder
  isWin: boolean;
  isInsiders: boolean;
  extensionFolder: string; // path to the extension folder
  settingsPath: string; // path to the app's settings file
  version: string; // version number of vscode
  extensionSettings: IExtensionSettings;
}
