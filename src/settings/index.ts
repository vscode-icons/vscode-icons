import * as fs from 'fs';
import * as path from 'path';
import * as semver from 'semver';
import { vscodePath as getAppPath } from './vscodePath';
import { version as extVersion } from './extVersion';
import { ISettings } from '../models/ISettings';
import { IState } from '../models/IState';
import { IVSCode } from '../models/IVSCode';

export interface IExtensionStatus {
  enabled: string;
  disabled: string;
  notInstalled: string;
}

export interface ISettingsManager {
  getSettings: () => ISettings;
  getState: () => IState;
  setState: (state: IState) => void;
  setStatus: (sts: string) => void;
  deleteState: () => void;
}

export const status: IExtensionStatus = {
  enabled: 'enabled',
  disabled: 'disabled',
  notInstalled: 'notInstalled',
};

export class SettingsManager {
  private settings: ISettings;

  constructor(private vscode: IVSCode) { }

  public getSettings(): ISettings {
    if (this.settings) { return this.settings; };
    const isInsiders = /insiders/i.test(this.vscode.env.appName);
    const version = semver(this.vscode.version);
    const isGt160 = semver.lt(version.major + '.' + version.minor + '.' + version.patch, '1.6.0');
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
      extVersion,
      version,
      isGt160,
    };
    return this.settings;
  }

  public getState(): IState {
    const vars = this.getSettings();
    try {
      const state = fs.readFileSync(vars.settingsPath, 'utf8');
      return <IState> JSON.parse(state);
    } catch (error) {
      return {
        version: '0',
        status: status.notInstalled,
        welcomeShown: false,
      };
    }
  }

  public setState(state: IState): void {
    const vars = this.getSettings();
    fs.writeFileSync(vars.settingsPath, JSON.stringify(state));
  }

  public setStatus(sts: string): void {
    const state = this.getState();
    state.version = extVersion;
    state.status = sts;
    state.welcomeShown = true;
    this.setState(state);
  }

  public deleteState() {
    const vars = this.getSettings();
    fs.unlinkSync(vars.settingsPath);
  }
}
