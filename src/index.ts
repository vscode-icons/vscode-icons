import * as vscode from 'vscode';
import { SettingsManager } from './settings';
import { manageWelcomeMessage } from './welcome';
import { registerCommands } from './commands';

function Initialize(context: vscode.ExtensionContext) {
  registerCommands(context);
  manageWelcomeMessage(new SettingsManager(vscode));
}

export function activate(context: vscode.ExtensionContext) {
  // tslint:disable-next-line no-console
  console.log('vscode-icons is active!');
  Initialize(context);
}

// this method is called when your vscode is closed
export function deactivate() {
  // no code here at the moment
}
