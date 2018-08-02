import * as fs from 'fs';
import * as semver from 'semver';
import { vscodePath as getAppPath, parseJSON, pathUnixJoin } from '../utils';
import {
  ISettings,
  IState,
  IVSCode,
  ISettingsManager,
  ExtensionStatus,
} from '../models';
import { extensionSettings } from './extensionSettings';
import { constants } from '../constants';
import { ErrorHandler } from '../errorHandler';

export class SettingsManager implements ISettingsManager {
  private settings: ISettings;

  constructor(private vscode: IVSCode) {
    this.getSettings();
  }

  public getSettings(): ISettings {
    if (this.settings) {
      return this.settings;
    }
    const isDev = /dev/i.test(this.vscode.env.appName);
    const isOSS = !isDev && /oss/i.test(this.vscode.env.appName);
    const isInsiders = /insiders/i.test(this.vscode.env.appName);
    const vscodeVersion = new semver.SemVer(this.vscode.version).version;
    const isWin = /^win/.test(process.platform);
    const vscodeAppName = process.env.VSCODE_PORTABLE
      ? 'user-data'
      : isInsiders
        ? 'Code - Insiders'
        : isOSS
          ? 'Code - OSS'
          : isDev
            ? 'code-oss-dev'
            : 'Code';
    const appPath = process.env.VSCODE_PORTABLE || getAppPath();
    const vscodeAppUserPath = pathUnixJoin(appPath, vscodeAppName, 'User');
    const workspacePath = this.getWorkspacePath();

    this.settings = {
      vscodeAppUserPath,
      workspacePath,
      isWin,
      isInsiders,
      isOSS,
      isDev,
      settingsFilePath: pathUnixJoin(
        vscodeAppUserPath,
        constants.extensionSettingsFilename,
      ),
      vscodeVersion,
      extensionSettings,
    };
    return this.settings;
  }

  public getWorkspacePath(): string[] {
    if (this.vscode.workspace.workspaceFolders) {
      return this.vscode.workspace.workspaceFolders.reduce<string[]>((a, b) => {
        a.push(b.uri.fsPath);
        return a;
      }, []);
    }

    if (this.vscode.workspace.rootPath) {
      return [this.vscode.workspace.rootPath];
    }
  }

  public getState(): IState {
    const defaultState: IState = {
      version: '0.0.0',
      status: ExtensionStatus.notActivated,
      welcomeShown: false,
    };
    if (!fs.existsSync(this.settings.settingsFilePath)) {
      return defaultState;
    }
    try {
      const state = fs.readFileSync(this.settings.settingsFilePath, 'utf8');
      return (parseJSON(state) as IState) || defaultState;
    } catch (error) {
      ErrorHandler.LogError(error, true);
      return defaultState;
    }
  }

  public setState(state: IState): void {
    try {
      fs.writeFileSync(this.settings.settingsFilePath, JSON.stringify(state));
    } catch (error) {
      ErrorHandler.LogError(error);
    }
  }

  public updateStatus(sts?: ExtensionStatus): IState {
    const state = this.getState();
    state.version = extensionSettings.version;
    state.status = sts == null ? state.status : sts;
    state.welcomeShown = true;
    this.setState(state);
    return state;
  }

  public deleteState() {
    fs.unlinkSync(this.settings.settingsFilePath);
  }

  public isNewVersion(): boolean {
    return semver.lt(
      this.getState().version,
      this.settings.extensionSettings.version,
    );
  }
}
