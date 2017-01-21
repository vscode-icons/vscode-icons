import * as vscode from 'vscode';
import { SettingsManager } from './settings';
import { manageWelcomeMessage, manageAutoApplyCustomizations, detectProject } from './init';
import { registerCommands, applyCustomizationCommand, applyDetection } from './commands';
import { getConfig, findFiles } from './utils/vscode-extensions';

function initialize(context: vscode.ExtensionContext) {
  const conf = getConfig().vsicons;
  const settingsManager = new SettingsManager(vscode);
  registerCommands(context);
  manageWelcomeMessage(settingsManager);
  detectProject(findFiles, conf)
    .then((res) => {
      if (res.isProject) {
        applyDetection(res.message, res.presetText, res.value);
        return;
      }
      manageAutoApplyCustomizations(settingsManager.isNewVersion(), conf, applyCustomizationCommand);
    });
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
