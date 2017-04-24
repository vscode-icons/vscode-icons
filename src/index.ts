import * as vscode from 'vscode';
import * as fs from 'fs';
import { SettingsManager } from './settings';
import * as init from './init';
import * as commands from './commands';
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

  commands.registerCommands(context);
  init.manageWelcomeMessage(settingsManager);

  init.manageAutoApplyCustomizations(settingsManager.isNewVersion(), config, commands.applyCustomizationCommand);

  init.detectProject(findFiles, config)
    .then(results => {
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
    isNgProject = projectJson && init.isProject(projectJson, 'ng');
    if (isNgProject) {
      break;
    }
  }

  const i18nManager = new LanguageResourceManager(vscode.env.language);
  const toggle = init.checkForAngularProject(
    config.presets.angular,
    init.iconsDisabled('ng'),
    isNgProject,
    i18nManager);

  if (!toggle.apply) {
    return;
  }

  const presetText = 'angular';
  const { defaultValue, workspaceValue } = getConfig().inspect(`vsicons.presets.${presetText}`);

  init.applyDetection(i18nManager, toggle.message, presetText, toggle.value,
    workspaceValue as boolean, defaultValue as boolean,
    config.projectDetection.autoReload, commands.updatePreset,
    commands.applyCustomization, commands.showCustomizationMessage,
    commands.reload, commands.cancel, handleVSCodeDir);
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
  console.info('vscode-icons is active!');
}

// this method is called when your vscode is closed
export function deactivate() {
  // no code here at the moment
}
