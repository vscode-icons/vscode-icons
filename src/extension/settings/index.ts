import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';
import * as semver from 'semver';
import { vscodePath as getAppPath } from './vscodePath';
import { version as extVersion } from './extVersion';
import { ISettings } from '../../models/ISettings';
import { IState } from '../../models/IState';

let settings: ISettings = null;

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
  status: IExtensionStatus;
}

export const status: IExtensionStatus = {
  enabled: 'enabled',
  disabled: 'disabled',
  notInstalled: 'notInstalled',
};

function getSettings(): ISettings {
  if (settings) { return settings; };
  const isInsiders = /insiders/i.test((<any> vscode.env).appName);
  const version = semver(vscode.version);
  const isGt160 = semver.lt(version.major + '.' + version.minor + '.' + version.patch, '1.6.0');
  const isWin = /^win/.test(process.platform);
  const homeDir = isWin ? 'USERPROFILE' : 'HOME';
  const extensionFolder = path.join(homeDir, isInsiders
    ? '.vscode-insiders'
    : '.vscode', 'extensions');
  const codePath = isInsiders ? '/Code - Insiders' : '/Code';
  const appPath = getAppPath();

  settings = {
    appPath,
    isWin,
    isInsiders,
    extensionFolder,
    settingsPath: path.join(appPath, codePath, 'User', 'vsicons.settings.json'),
    extVersion,
    version,
    isGt160,
  };
  return settings;
}

function getState(): IState {
  const vars = getSettings();
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

function setState(state: IState): void {
  const vars = getSettings();
  fs.writeFileSync(vars.settingsPath, JSON.stringify(state));
}

function setStatus(sts: string): void {
  const state = getState();
  state.version = extVersion;
  state.status = sts;
  state.welcomeShown = true;
  setState(state);
}

function deleteState(): void {
  const vars = getSettings();
  fs.unlinkSync(vars.settingsPath);
}

export const settingsManager: ISettingsManager = {
  getSettings,
  getState,
  setState,
  setStatus,
  deleteState,
  status,
};
