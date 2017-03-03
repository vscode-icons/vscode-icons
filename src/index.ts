import * as vscode from 'vscode';
import * as fs from 'fs';
import { SettingsManager } from './settings';
import {
  manageWelcomeMessage,
  manageAutoApplyCustomizations,
  detectProject,
  checkForAngularProject,
  iconsDisabled,
  isProject,
  applyDetection,
} from './init';
import {
  registerCommands,
  applyCustomizationCommand,
  applyCustomization,
  reload,
  updatePreset,
  cancel,
  showCustomizationMessage,
} from './commands';
import { getConfig, findFiles, asRelativePath } from './utils/vscode-extensions';
import { parseJSON } from './utils';
import { LanguageResourceManager } from './i18n';
import { IVSCodeUri, IVSIcons } from './models';

let vscodeDirExisted: boolean;
let userSettingsExisted: boolean;

function initialize(context: vscode.ExtensionContext) {
  const config = getConfig().vsicons;
  const settingsManager = new SettingsManager(vscode);

  vscodeDirExisted = fs.existsSync(`${vscode.workspace.rootPath}/.vscode`);
  userSettingsExisted = fs.existsSync(`${vscode.workspace.rootPath}/.vscode/settings.json`);

  registerCommands(context);
  manageWelcomeMessage(settingsManager);

  manageAutoApplyCustomizations(settingsManager.isNewVersion(), config, applyCustomizationCommand);

  detectProject(findFiles, config)
    .then((results) => {
      if (results && results.length && !asRelativePath(results[0].fsPath).includes('/')) {
        detectAngular(config, results);
      }
    });
}

function detectAngular(config: IVSIcons, results: IVSCodeUri[]): void {
  let isNgProject: boolean;
  for (const result of results) {
    const content = fs.readFileSync(result.fsPath, "utf8");
    const projectJson = parseJSON(content);
    isNgProject = projectJson && isProject(projectJson, 'ng');
    if (isNgProject) {
      break;
    }
  }

  const i18nManager = new LanguageResourceManager(vscode.env.language);
  const toggle = checkForAngularProject(
    config.presets.angular,
    iconsDisabled('ng'),
    isNgProject,
    i18nManager);

  if (!toggle.apply) {
    return;
  }

  const presetText = 'angular';
  const values = getConfig().inspect(`vsicons.presets.${presetText}`);
  const defaultValue = values.defaultValue as boolean;
  const initValue = values.workspaceValue as boolean;

  applyDetection(i18nManager, toggle.message, presetText, toggle.value, initValue, defaultValue,
    config.projectDetection.autoReload, updatePreset, applyCustomization, showCustomizationMessage,
    reload, cancel, handleVSCodeDir);
}

export function handleVSCodeDir(): void {
  const vscodeDirPath = `${vscode.workspace.rootPath}/.vscode`;
  const userSettingsPath = `${vscodeDirPath}/settings.json`;

  // In case we created the 'settings.json' file remove it
  if (!userSettingsExisted && fs.existsSync(userSettingsPath)) {
    fs.unlinkSync(userSettingsPath);
  }

  // In case we created the '.vscode' directory remove it
  if (!vscodeDirExisted && fs.existsSync(vscodeDirPath)) {
    fs.rmdirSync(vscodeDirPath);
  }
}

export function activate(context: vscode.ExtensionContext) {
  initialize(context);
  // tslint:disable-next-line no-console
  console.log('vscode-icons is active!');
}

// this method is called when your vscode is closed
export function deactivate() {
  // no code here at the moment
}
