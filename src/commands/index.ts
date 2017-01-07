import * as vscode from 'vscode';
import { getConfig } from '../utils/vscode-extensions';
import { messages as msg } from '../messages';
import {
  IconGenerator,
  mergeConfig,
  schema,
  toggleAngularPreset,
  toggleJavascriptOfficialPreset,
  toggleTypescriptOfficialPreset,
  toggleHideFoldersPreset,
} from '../icon-manifest';
import { extensions as files } from '../icon-manifest/supportedExtensions';
import { extensions as folders } from '../icon-manifest/supportedFolders';
import { IFileCollection, IFolderCollection, IVSIcons, IFileDefault, IFolderDefault } from '../models/';
import { extensionSettings } from '../settings';

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
  const conf = getConfig().vsicons.associations;
  const customFiles: IFileCollection = {
    default: conf.fileDefault,
    supported: conf.files,
  };
  const customFolders: IFolderCollection = {
    default: conf.folderDefault,
    supported: conf.folders,
  };
  generateManifest(customFiles, customFolders);
}

function applyCustomizationCommand() {
  const message = `${msg.iconCustomizationMessage} ${msg.restart}`;
  showCustomizationMessage(message, applyCustomization);
}

function restoreDefaultManifestCommand() {
  const message = `${msg.iconRestoreMessage} ${msg.restart}`;
  showCustomizationMessage(message, restoreManifest);
}

function toggleAngularPresetCommand() {
  const preset = 'angular';
  const value = getToggleValue('angular');
  const message = `${msg.ngPresetMessage} ${value ? msg.enabled : msg.disabled}. ${msg.restart}`;
  showCustomizationMessage(message, togglePreset, preset, value, false);
}

function toggleJsPresetCommand() {
  const preset = 'jsOfficial';
  const value = getToggleValue(preset);
  const message = `${msg.jsOfficialPresetMessage} ${value ? msg.enabled : msg.disabled}. ${msg.restart}`;
  showCustomizationMessage(message, togglePreset, preset, value);
}

function toggleTsPresetCommand() {
  const preset = 'tsOfficial';
  const value = getToggleValue(preset);
  const message = `${msg.tsOfficialPresetMessage} ${value ? msg.enabled : msg.disabled}. ${msg.restart}`;
  showCustomizationMessage(message, togglePreset, preset, value);
}

function toggleHideFoldersCommand() {
  const preset = 'hideFolders';
  const value = getToggleValue(preset);
  const message = `${msg.hideFoldersPresetMessage} ${value ? msg.disabled : msg.enabled}. ${msg.restart}`;
  showCustomizationMessage(message, togglePreset, preset, value);
}

function getToggleValue(preset: string): boolean {
  return !getConfig().vsicons.presets[preset];
}

function togglePreset(preset: string, newvalue: boolean, global: boolean = true): void {
  const conf = getConfig();
  // configuration updates doesn't get presisted until the app restarts
  conf.update(`vsicons.presets.${preset}`, newvalue, global);
  applyCustomization();
}

function showCustomizationMessage(message: string, callback?: (...args: any[]) => void, ...args: any[]) {
  vscode.window.showInformationMessage(message, { title: msg.reload })
    .then(value => {
      if (!value) { return; }
      if (callback) { callback(...args); }
      vscode.commands.executeCommand('workbench.action.reloadWindow');
    }, (reason) => {
      return;
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
    workingCustomFolders = toggleHideFoldersPreset(!conf.presets.hideFolders, workingCustomFolders);
  }
  // presets affecting default icons
  const workingFiles = toggleAngularPreset(!conf.presets.angular, files);
  const workingFolders = toggleHideFoldersPreset(!conf.presets.hideFolders, folders);
  const json = mergeConfig(
    workingCustomFiles,
    workingFiles,
    workingCustomFolders,
    workingFolders,
    iconGenerator);
  iconGenerator.persist(extensionSettings.iconJsonFileName, json);
}

function restoreManifest() {
  const iconGenerator = new IconGenerator(vscode, schema);
  const json = mergeConfig(
    null,
    files,
    null,
    folders,
    iconGenerator);
  iconGenerator.persist(extensionSettings.iconJsonFileName, json);
}
