import * as vscode from 'vscode';
import { SettingsManager } from './settings';
import * as init from './init';
import { ProjectAutoDetection as pad } from './init/projectAutoDetection';
import { ManifestReader as mr } from './icon-manifest';
import * as commands from './commands';
import { getVsiconsConfig, getConfig, findFiles } from './utils/vscode-extensions';
import { LanguageResourceManager } from './i18n';
import { IVSCodeUri, IVSIcons, Projects } from './models';
import { constants } from './constants';

export let initialized: boolean;

function initialize(context: vscode.ExtensionContext): void {
  const config = getVsiconsConfig();
  const settingsManager = new SettingsManager(vscode);

  commands.registerCommands(context);
  init.manageWelcomeMessage(settingsManager);
  init.manageAutoApplyCustomizations(settingsManager.isNewVersion(), config, commands.applyCustomizationCommand);
  pad.detectProject(findFiles, config).then(results => detectAngular(config, results), err => err);

  // Update the version in settings
  if (settingsManager.isNewVersion()) {
    settingsManager.updateStatus();
  }
}

function detectAngular(config: IVSIcons, results: IVSCodeUri[]): void {
  if (!config || !results) { return; }
  const projectInfo = pad.getProjectInfo(results, Projects.angular);
  const i18nManager = new LanguageResourceManager(vscode.env.language);
  const presetValue = getConfig().inspect(`vsicons.presets.angular`).workspaceValue as boolean;
  const detectionResult = pad.checkForAngularProject(
    presetValue, mr.iconsDisabled(Projects.angular), !!projectInfo, i18nManager);

  if (!detectionResult.apply) {
    return;
  }

  pad.applyDetection(i18nManager, detectionResult, config.projectDetection.autoReload,
    commands.applyCustomization, commands.showCustomizationMessage, commands.reload);
}

export function activate(context: vscode.ExtensionContext): void {
  initialize(context);
  // tslint:disable-next-line no-console
  console.info(`${constants.extensionName} is active!`);
  initialized = true;
}

// this method is called when your vscode is closed
export function deactivate(): void {
  // no code here at the moment
}
