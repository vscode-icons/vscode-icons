import * as vscode from 'vscode';
import { getConfig } from '../utils/vscode-extensions';
import { messages as msg } from '../messages';
import {
  IconGenerator,
  mergeConfig,
  schema,
  toggleAngularPreset,
  toggleOfficialIconsPreset,
  toggleHideFoldersPreset,
} from '../icon-manifest';
import { extensions as files } from '../icon-manifest/supportedExtensions';
import { extensions as folders } from '../icon-manifest/supportedFolders';
import {
  IFileCollection,
  IFolderCollection,
  IVSIcons, IFileDefault,
  IFolderDefault,
} from '../models';
import { extensionSettings } from '../settings';

export function registerCommands(context: vscode.ExtensionContext): void {
  registerCommand(context, 'regenerateIcons', applyCustomizationCommand);
  registerCommand(context, 'restoreIcons', restoreDefaultManifestCommand);
  registerCommand(context, 'ngPreset', toggleAngularPresetCommand);
  registerCommand(context, 'jsPreset', toggleJsPresetCommand);
  registerCommand(context, 'tsPreset', toggleTsPresetCommand);
  registerCommand(context, 'jsonPreset', toggleJsonPresetCommand);
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

export function applyCustomizationCommand() {
  const message = `${msg.iconCustomizationMessage} ${msg.restart}`;
  showCustomizationMessage(message, applyCustomization);
}

function restoreDefaultManifestCommand() {
  const message = `${msg.iconRestoreMessage} ${msg.restart}`;
  showCustomizationMessage(message, restoreManifest);
}

function toggleAngularPresetCommand() {
  const preset = 'angular';
  const value = getToggleValue(preset);
  const message = `${msg.ngPresetMessage} ${value ? msg.enabled : msg.disabled}. ${msg.restart}`;
  togglePreset(preset, value, false);
  showCustomizationMessage(message, applyCustomization, cancel, preset, !value, false);
}

function toggleJsPresetCommand() {
  const preset = 'jsOfficial';
  const value = getToggleValue(preset);
  const message = `${msg.jsOfficialPresetMessage} ${value ? msg.enabled : msg.disabled}. ${msg.restart}`;
  togglePreset(preset, value);
  showCustomizationMessage(message, applyCustomization, cancel, preset, !value);
}

function toggleTsPresetCommand() {
  const preset = 'tsOfficial';
  const value = getToggleValue(preset);
  const message = `${msg.tsOfficialPresetMessage} ${value ? msg.enabled : msg.disabled}. ${msg.restart}`;
  togglePreset(preset, value);
  showCustomizationMessage(message, applyCustomization, cancel, preset, !value);
}

function toggleJsonPresetCommand() {
  const preset = 'jsonOfficial';
  const value = getToggleValue(preset);
  const message = `${msg.jsonOfficialPresetMessage} ${value ? msg.enabled : msg.disabled}. ${msg.restart}`;
  togglePreset(preset, value);
  showCustomizationMessage(message, applyCustomization, cancel, preset, !value);
}

function toggleHideFoldersCommand() {
  const preset = 'hideFolders';
  const value = getToggleValue(preset);
  const message = `${msg.hideFoldersPresetMessage} ${value ? msg.disabled : msg.enabled}. ${msg.restart}`;
  togglePreset(preset, value);
  showCustomizationMessage(message, applyCustomization, cancel, preset, !value);
}

function getToggleValue(preset: string): boolean {
  return !getConfig().vsicons.presets[preset];
}

function togglePreset(preset: string, newvalue: boolean, global: boolean = true): void {
  getConfig().update(`vsicons.presets.${preset}`, newvalue, global);
}

function showCustomizationMessage(
  message: string,
  callback?: Function,
  cancel?: (...args: any[]) => void,
  ...args: any[]) {
  vscode.window.showInformationMessage(message, { title: msg.reload })
    .then(btn => {
      if (!btn) {
        if (cancel) { cancel(...args); }
        return;
      }
      if (callback) { callback(...args); }
      vscode.commands.executeCommand('workbench.action.reloadWindow');
    }, (reason) => {
      // tslint:disable-next-line:no-console
      console.log('Rejected because: ', reason);
      return;
    });
}

function cancel(preset: string, value: boolean, global: boolean = true): void {
  togglePreset(preset, value, global);
}

function applyCustomization() {
  const associations = getConfig().vsicons.associations;
  const customFiles: IFileCollection = {
    default: associations.fileDefault,
    supported: associations.files,
  };
  const customFolders: IFolderCollection = {
    default: associations.folderDefault,
    supported: associations.folders,
  };
  generateManifest(customFiles, customFolders);
}

function generateManifest(
  customFiles: IFileCollection,
  customFolders: IFolderCollection) {
  const iconGenerator = new IconGenerator(vscode, schema);
  const presets = getConfig().vsicons.presets;
  let workingCustomFiles = customFiles;
  let workingCustomFolders = customFolders;
  if (customFiles) {
    // check presets...
    workingCustomFiles = toggleAngularPreset(!presets.angular, customFiles);
    workingCustomFiles = toggleOfficialIconsPreset(!presets.jsOfficial, workingCustomFiles,
      ['js_official'], ['js']);
    workingCustomFiles = toggleOfficialIconsPreset(!presets.tsOfficial, workingCustomFiles,
      ['typescript_official', 'typescriptdef_official'], ['typescript', 'typescriptdef']);
    workingCustomFiles = toggleOfficialIconsPreset(!presets.jsonOfficial, workingCustomFiles,
      ['json_official'], ['json']);
  }
  if (customFolders) {
    workingCustomFolders = toggleHideFoldersPreset(presets.hideFolders, workingCustomFolders);
  }
  // presets affecting default icons
  const workingFiles = toggleAngularPreset(!presets.angular, files);
  const workingFolders = toggleHideFoldersPreset(presets.hideFolders, folders);
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
