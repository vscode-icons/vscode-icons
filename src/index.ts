import * as vscode from 'vscode';
import { SettingsManager } from './settings';
import * as init from './init';
import * as commands from './commands';
import { getVsiconsConfig, getConfig, findFiles, asRelativePath } from './utils/vscode-extensions';
import { LanguageResourceManager } from './i18n';
import { IVSCodeUri, IVSIcons } from './models';
import { constants } from './constants';

export let initialized: boolean;

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

  // Update the version in settings
  if (settingsManager.isNewVersion()) {
    settingsManager.updateStatus(settingsManager.getState().status);
  }
}

function detectAngular(config: IVSIcons, results: IVSCodeUri[]): void {
  const projectInfo = init.getProjectInfo(results, 'ng');
  const i18nManager = new LanguageResourceManager(vscode.env.language);
  const presetValue = getConfig().inspect(`vsicons.presets.angular`).workspaceValue as boolean;
  const detectionResult = init.checkForAngularProject(
    presetValue, init.iconsDisabled('ng'), !!projectInfo, i18nManager);

  if (!detectionResult.apply) {
    return;
  }

  init.applyDetection(i18nManager, detectionResult, config.projectDetection.autoReload,
    commands.applyCustomization, commands.showCustomizationMessage, commands.reload);
}

export function activate(context: vscode.ExtensionContext) {
  initialize(context);
  // tslint:disable-next-line no-console
  console.info(`${constants.extensionName} is active!`);
  initialized = true;
}

// this method is called when your vscode is closed
export function deactivate() {
  // no code here at the moment
}
