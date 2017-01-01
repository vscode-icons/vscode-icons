import * as vscode from 'vscode';

export function registerCommands(context: vscode.ExtensionContext): void {
  registerCommand(context, 'regenerateIcons', applyCustomizationCommand);
  registerCommand(context, 'restoreIcons', restoreDefaultManifestCommand);
  registerCommand(context, 'ng2Preset', toggleAngular2PresetCommand);
  registerCommand(context, 'jsPreset', toggleJsPresetCommand);
  registerCommand(context, 'tsPreset', toggleTsPresetCommand);
}

function registerCommand(
  context: vscode.ExtensionContext,
  name: string,
  callback: (...args: any[]) => any,
  thisArg?: any): vscode.Disposable {
  const command = vscode.commands.registerCommand(`extension.${name}`, callback);
  context.subscriptions.push(command);
  return command;
}

function applyCustomizationCommand() {
  vscode.window.showInformationMessage('applyCustomizationCommand');
}

function restoreDefaultManifestCommand() {
  vscode.window.showInformationMessage('restoreDefaultManifestCommand');
}

function toggleAngular2PresetCommand() {
  vscode.window.showInformationMessage('toggleAngular2PresetCommand');
}

function toggleJsPresetCommand() {
  vscode.window.showInformationMessage('toggleJsPresetCommand');
}

function toggleTsPresetCommand() {
  vscode.window.showInformationMessage('toggleTsPresetCommand');
}
