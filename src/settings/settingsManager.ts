import * as fs from 'fs';
import * as path from 'path';
import * as semver from 'semver';
import { vscodePath as getAppPath } from '../utils';
import { ISettings, IState, IVSCode, ISettingsManager, ExtensionStatus } from '../models';
import { extensionSettings } from './extensionSettings';

export class SettingsManager implements ISettingsManager {
  private settings: ISettings;

  constructor(private vscode: IVSCode) {
    this.getSettings();
   }

  public getSettings(): ISettings {
    if (this.settings) { return this.settings; };
    const isInsiders = /insiders/i.test(this.vscode.env.appName);
    const version = semver(this.vscode.version);
    const isWin = /^win/.test(process.platform);
    const homeDir = isWin ? 'USERPROFILE' : 'HOME';
    const extensionFolder = path.join(homeDir, isInsiders
      ? '.vscode-insiders'
      : '.vscode', 'extensions');
    const codePath = isInsiders ? '/Code - Insiders' : '/Code';
    const appPath = getAppPath();
    const vscodeAppData = path.join(appPath, codePath, 'User');

    this.settings = {
      vscodeAppData,
      isWin,
      isInsiders,
      extensionFolder,
      settingsPath: path.join(vscodeAppData, 'vsicons.settings.json'),
      version,
      extensionSettings,
    };
    return this.settings;
  }

  public getState(): IState {
    try {
      const state = fs.readFileSync(this.settings.settingsPath, 'utf8');
      return JSON.parse(state) as IState;
    } catch (error) {
      return {
        version: '0',
        status: ExtensionStatus.notInstalled,
        welcomeShown: false,
      };
    }
  }

  public setState(state: IState): void {
    fs.writeFileSync(this.settings.settingsPath, JSON.stringify(state));
  }

  public setStatus(sts: ExtensionStatus): void {
    const state = this.getState();
    state.version = extensionSettings.version;
    state.status = sts;
    state.welcomeShown = true;
    this.setState(state);
  }

  public deleteState() {
    fs.unlinkSync(this.settings.settingsPath);
  }

  public isNewVersion(): boolean {
    const state = this.getState();
    return state.version !== this.settings.extensionSettings.version;
  }
}
