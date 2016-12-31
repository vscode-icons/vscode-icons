import * as vscode from 'vscode';
import { SettingsManager } from './settings';
import { manageWelcomeMessage } from './welcome';

function Initialize() {
  manageWelcomeMessage(new SettingsManager(vscode));
}

export function activate() {
  // tslint:disable-next-line no-console
  console.log('vscode-icons is active!');
  Initialize();
}

// this method is called when your vscode is closed
export function deactivate() {
  // no code here at the moment
}
