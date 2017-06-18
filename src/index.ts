import * as vscode from 'vscode';
import * as fs from 'fs';
import { SettingsManager } from './settings';
import * as init from './init';
import * as commands from './commands';
import { getVsiconsConfig, getConfig, findFiles, asRelativePath } from './utils/vscode-extensions';
import { parseJSON } from './utils';
import { LanguageResourceManager } from './i18n';
import { IVSCodeUri, IVSIcons } from './models';

function initialize(context: vscode.ExtensionContext) {
  const config = getVsiconsConfig();
  const settingsManager = new SettingsManager(vscode);

  commands.registerCommands(context);
  init.manageWelcomeMessage(settingsManager);
  init.manageAutoApplyCustomizations(settingsManager.isNewVersion(), config, commands.applyCustomizationCommand);
  init.detectProject(findFiles, config)
    .then(results => {
      if (results && results.length && !asRelativePath(results[0].fsPath).includes('/')) {
        detectAngular(config, results);
      }
    });

  if (settingsManager.isNewVersion()) {
    settingsManager.updateStatus(settingsManager.getState().status);
  }
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
  const presetValue = getConfig().inspect(`vsicons.presets.angular`).workspaceValue as boolean;
  const result = init.checkForAngularProject(
    presetValue, init.iconsDisabled('ng'), isNgProject, i18nManager);

  if (!result.apply) {
    return;
  }

  init.applyDetection(i18nManager, result, config.projectDetection.autoReload,
    commands.applyCustomization, commands.showCustomizationMessage, commands.reload);
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
