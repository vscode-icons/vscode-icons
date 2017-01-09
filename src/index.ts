import * as vscode from 'vscode';
import { SettingsManager } from './settings';
import { manageWelcomeMessage, manageAutoApplyCustomizations } from './init';
import { registerCommands, applyCustomizationCommand } from './commands';
import { getConfig } from './utils/vscode-extensions';

function Initialize(context: vscode.ExtensionContext) {
  registerCommands(context);
  const settingsManager = new SettingsManager(vscode);
  manageWelcomeMessage(settingsManager);
  manageAutoApplyCustomizations(settingsManager.isNewVersion(), getConfig().vsicons, applyCustomizationCommand);
}

export function activate(context: vscode.ExtensionContext) {
  Initialize(context);
  // tslint:disable-next-line no-console
  console.log('vscode-icons is active!');
}

// this method is called when your vscode is closed
export function deactivate() {
  // no code here at the moment
}
