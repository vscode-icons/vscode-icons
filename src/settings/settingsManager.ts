import * as fs from 'fs';
import * as path from 'path';
import * as semver from 'semver';
import { vscodePath as getAppPath, parseJSON } from '../utils';
import { ISettings, IState, IVSCode, ISettingsManager, ExtensionStatus } from '../models';
import { extensionSettings } from './extensionSettings';

export class SettingsManager implements ISettingsManager {
  private settings: ISettings;

  constructor(private vscode: IVSCode) {
    this.getSettings();
  }

  public getSettings(): ISettings {
    if (this.settings) { return this.settings; }
    const isInsiders = /insiders/i.test(this.vscode.env.appName);
    const vscodeVersion = new semver.SemVer(this.vscode.version).version;
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
      vscodeVersion,
      extensionSettings,
    };
    return this.settings;
  }

  public getState(): IState {
    const defaultState: IState = {
      version: '0.0.0',
      status: ExtensionStatus.notActivated,
      welcomeShown: false,
    };
    if (!fs.existsSync(this.settings.settingsPath)) {
      return defaultState;
    }
    try {
      const state = fs.readFileSync(this.settings.settingsPath, 'utf8');
      return (parseJSON(state) as IState) || defaultState;
    } catch (error) {
      console.error(error);
      return defaultState;
    }
  }

  public setState(state: IState): void {
    fs.writeFileSync(this.settings.settingsPath, JSON.stringify(state));
  }

  public updateStatus(sts: ExtensionStatus): IState {
    const state = this.getState();
    state.version = extensionSettings.version;
    state.status = sts;
    state.welcomeShown = true;
    this.setState(state);
    return state;
  }

  public deleteState() {
    fs.unlinkSync(this.settings.settingsPath);
  }

  public isNewVersion(): boolean {
    return semver.lt(this.getState().version, this.settings.extensionSettings.version);
  }
}
