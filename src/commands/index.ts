import * as vscode from 'vscode';
import { getConfig } from '../utils/vscode-extensions';
import { messages as msg } from '../messages';
import {
  IconGenerator,
  mergeConfig,
  toggleAngularPreset,
  toggleJavascriptOfficialPreset,
  toggleTypescriptOfficialPreset,
} from '../icon-manifest';
import { extensions as files } from '../icon-manifest/supportedExtensions';
import { extensions as folders } from '../icon-manifest/supportedFolders';
import { IFileCollection, IFolderCollection, IVSIcons, IFileDefault, IFolderDefault } from '../models/';
import { schema } from '../icon-manifest';
import { toggleHideFoldersPreset } from '../icon-manifest/manifestMerger';

export function registerCommands(context: vscode.ExtensionContext): void {
  registerCommand(context, 'regenerateIcons', applyCustomizationCommand);
  registerCommand(context, 'restoreIcons', restoreDefaultManifestCommand);
  registerCommand(context, 'ngPreset', toggleAngularPresetCommand);
  registerCommand(context, 'jsPreset', toggleJsPresetCommand);
  registerCommand(context, 'tsPreset', toggleTsPresetCommand);
  registerCommand(context, 'hideFoldersPreset', toggleHideFoldersCommand);
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

function applyCustomization() {
  const conf = getConfig().vsicons;
  const customFiles: IFileCollection = {
    default: conf.associations.fileDefault,
    supported: conf.associations.files,
  };
  const customFolders: IFolderCollection = {
    default: conf.associations.folderDefault,
    supported: conf.associations.folders,
  };
  generateManifest(customFiles, customFolders);
}

function applyCustomizationCommand() {
  applyCustomization();
  showCustomizationMessage(msg.iconCustomizationMessage);
}

function restoreDefaultManifestCommand() {
  restorManifest();
  showCustomizationMessage(msg.iconRestoreMessage);
}

function toggleAngularPresetCommand() {
  const val = togglePreset('angular', false);
  showCustomizationMessage(`${msg.ngPresetMessage} ${val}`, applyCustomization);
}

function toggleJsPresetCommand() {
  const val = togglePreset('jsOfficial');
  showCustomizationMessage(`${msg.jsOfficialPresetMessage} ${val}`, applyCustomization);
}

function toggleTsPresetCommand() {
  const val = togglePreset('tsOfficial');
  showCustomizationMessage(`${msg.tsOfficialPresetMessage} ${val}`, applyCustomization);
}

function toggleHideFoldersCommand() {
  const val = togglePreset('hideFolders');
  showCustomizationMessage(`${msg.hideFoldersPresetMessage} ${!val}`, applyCustomization);
}

function togglePreset(preset: string, global: boolean = true): boolean {
  const conf = getConfig();
  const currentValue = conf.vsicons.presets[preset];
  conf.update(`vsicons.presets.${preset}`, !currentValue, global);
  return !currentValue;
}

function showCustomizationMessage(message: string, callback: Function = null) {
  vscode.window.showInformationMessage(message,
    { title: msg.reload })
    .then(btn => {
      if (callback) { callback(); }
      vscode.commands.executeCommand('workbench.action.reloadWindow');
    });
}

function generateManifest(
  customFiles: IFileCollection,
  customFolders: IFolderCollection) {
  const iconGenerator = new IconGenerator(vscode, schema);
  const conf = getConfig().vsicons;
  let workingCustomFiles = customFiles;
  let workingCustomFolders = customFolders;
  if (customFiles) {
    // check presets...
    workingCustomFiles = toggleAngularPreset(!conf.presets.angular, customFiles);
    workingCustomFiles = toggleJavascriptOfficialPreset(!conf.presets.jsOfficial, workingCustomFiles);
    workingCustomFiles = toggleTypescriptOfficialPreset(!conf.presets.tsOfficial, workingCustomFiles);
  }
  if (customFolders) {
     workingCustomFolders = toggleHideFoldersPreset(conf.presets.hideFolders, workingCustomFolders);
  }
  // presets affecting  default icons
  const workingFolders = toggleHideFoldersPreset(conf.presets.hideFolders, folders);
  const workingFiles = toggleAngularPreset(!conf.presets.angular, files);
  const json = mergeConfig(
    workingCustomFiles,
    workingFiles,
    workingCustomFolders,
    workingFolders,
    iconGenerator);
  iconGenerator.persist('icons.json', json);
}

function restorManifest() {
  const iconGenerator = new IconGenerator(vscode, schema);
  const json = mergeConfig(
    null,
    files,
    null,
    folders,
    iconGenerator);
  iconGenerator.persist('icons.json', json);
}
