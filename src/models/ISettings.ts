export interface ISettings {
  vscodeAppData: string; // path to the vscode app data folder
  isWin: boolean;
  isInsiders: boolean;
  extensionFolder: string; // path to the extension folder
  settingsPath: string; // path to the app's settings file
  extVersion: string; // version number of the extension
  version: string; // version number of vscode
  isGt160: boolean; // true if vscode version is greater than 1.6.0
}
