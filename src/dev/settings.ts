import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';
import * as semver from 'semver';
import { vscodePath as getAppPath } from './vscodePath';
import { version as extVersion } from './extVersion';

let settings = null;

export const status = {
  enabled: 'enabled',
  disabled: 'disabled',
  notInstalled: 'notInstalled',
};

export function getSettings() {
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

export function getState() {
  const vars = getSettings();
  try {
    const state = fs.readFileSync(vars.settingsPath, 'utf8');
    return JSON.parse(state);
  } catch (error) {
    return {
      version: '0',
      status: status.notInstalled,
      welcomeShown: false,
    };
  }
}

export function setState(state) {
  const vars = getSettings();
  fs.writeFileSync(vars.settingsPath, JSON.stringify(state));
}

export function setStatus(sts) {
  const state = getState();
  state.version = extVersion;
  state.status = sts;
  state.welcomeShown = true;
  setState(state);
}

export function deleteState() {
  const vars = getSettings();
  fs.unlinkSync(vars.settingsPath);
}
