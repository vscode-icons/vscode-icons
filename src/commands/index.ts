import * as vscode from 'vscode';
import { getConfig } from '../utils/vscode-extensions';
import {
  mergeConfig,
  toggleAngular2Preset,
  toggleJavascriptOfficialPreset,
  toggleTypescriptOfficialPreset,
} from '../merger';
import { extensions as files } from '../icon-manifest/supportedExtensions';
import { extensions as folders } from '../icon-manifest/supportedFolders';
import { IconGenerator } from '../icon-manifest/iconGenerator';
import { IExtensionCollection, IFileExtension, IFolderExtension } from '../models/IExtension';

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
  const conf = getConfig().vsicons;
  const customFiles = { supported: conf.associations.files };
  const customFolders = { supported: conf.associations.folders };
  generateManifest(customFiles, customFolders);
  vscode.window.showInformationMessage('Customization applied. Restart the app.');
}

function restoreDefaultManifestCommand() {
  generateManifest(null, null);
  vscode.window.showInformationMessage('Icons restored to its factory state. Restart the app.');
}

function toggleAngular2PresetCommand() {
  togglePreset('angular2', false);
  vscode.window.showInformationMessage('toggleAngular2PresetCommand');
}

function toggleJsPresetCommand() {
  togglePreset('jsOfficial');
  vscode.window.showInformationMessage('toggleJsPresetCommand');
}

function toggleTsPresetCommand() {
  togglePreset('tsOfficial');
  vscode.window.showInformationMessage('toggleTsPresetCommand');
}

function togglePreset(preset: string, global: boolean = true) {
  const conf = getConfig();
  const currentValue = conf.vsicons.presets[preset];
  conf.update(`vsicons.presets.${preset}`, !currentValue, global);
}

function generateManifest(
  customFiles: IExtensionCollection<IFileExtension>,
  customFolders: IExtensionCollection<IFolderExtension>) {
  const iconGenerator = new IconGenerator(vscode);
  let workingCustomFiles = customFiles;
  if (customFiles && customFolders) {
    // check presets...
    const conf = getConfig().vsicons;
    workingCustomFiles = toggleAngular2Preset(!conf.presets.angular2, customFiles);
    workingCustomFiles = toggleJavascriptOfficialPreset(!conf.presets.jsOfficial, workingCustomFiles);
    workingCustomFiles = toggleTypescriptOfficialPreset(!conf.presets.tsOfficial, workingCustomFiles);
  }
  const json = mergeConfig(workingCustomFiles, files, customFolders, folders, iconGenerator);
  iconGenerator.persist('icons.json', json);
}
