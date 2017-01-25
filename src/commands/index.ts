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
  registerCommand(context, 'resetProjectDetectionDefaults', resetProjectDetectionDefaultsCommand);
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
  showCustomizationMessage(message, [{ title: msg.reload }], applyCustomization);
}

function restoreDefaultManifestCommand() {
  const message = `${msg.iconRestoreMessage} ${msg.restart}`;
  showCustomizationMessage(message, [{ title: msg.reload }], restoreManifest);
}

function resetProjectDetectionDefaultsCommand() {
  const message = `${msg.projectDetecticonResetMessage}`;
  showCustomizationMessage(message, [{ title: msg.reload }], resetProjectDetectionDefaults);
}

function toggleAngularPresetCommand() {
  const preset = 'angular';
  const value = getToggleValue(preset);
  const message = `${msg.ngPresetMessage} ${value ? msg.enabled : msg.disabled}. ${msg.restart}`;
  const initValue = getConfig().inspect(`vsicons.presets.${preset}`).defaultValue as boolean;
  togglePreset(preset, value, initValue, false);
  showCustomizationMessage(message, [{ title: msg.reload }],
    applyCustomization, cancel, preset, !value, initValue, false);
}

function toggleJsPresetCommand() {
  const preset = 'jsOfficial';
  const value = getToggleValue(preset);
  const message = `${msg.jsOfficialPresetMessage} ${value ? msg.enabled : msg.disabled}. ${msg.restart}`;
  const initValue = getConfig().inspect(`vsicons.presets.${preset}`).defaultValue as boolean;
  togglePreset(preset, value, initValue);
  showCustomizationMessage(message, [{ title: msg.reload }], applyCustomization, cancel, preset, !value, initValue);
}

function toggleTsPresetCommand() {
  const preset = 'tsOfficial';
  const value = getToggleValue(preset);
  const message = `${msg.tsOfficialPresetMessage} ${value ? msg.enabled : msg.disabled}. ${msg.restart}`;
  const initValue = getConfig().inspect(`vsicons.presets.${preset}`).defaultValue as boolean;
  togglePreset(preset, value, initValue);
  showCustomizationMessage(message, [{ title: msg.reload }], applyCustomization, cancel, preset, !value, initValue);
}

function toggleJsonPresetCommand() {
  const preset = 'jsonOfficial';
  const value = getToggleValue(preset);
  const message = `${msg.jsonOfficialPresetMessage} ${value ? msg.enabled : msg.disabled}. ${msg.restart}`;
  const initValue = getConfig().inspect(`vsicons.presets.${preset}`).defaultValue as boolean;
  togglePreset(preset, value, initValue);
  showCustomizationMessage(message, [{ title: msg.reload }], applyCustomization, cancel, preset, !value, initValue);
}

function toggleHideFoldersCommand() {
  const preset = 'hideFolders';
  const value = getToggleValue(preset);
  const message = `${msg.hideFoldersPresetMessage} ${value ? msg.disabled : msg.enabled}. ${msg.restart}`;
  const initValue = getConfig().inspect(`vsicons.presets.${preset}`).defaultValue as boolean;
  togglePreset(preset, value, initValue);
  showCustomizationMessage(message, [{ title: msg.reload }], applyCustomization, cancel, preset, !value, initValue);
}

function getToggleValue(preset: string): boolean {
  return !getConfig().vsicons.presets[preset];
}

export function togglePreset(
  preset: string,
  newvalue: boolean,
  initValue: boolean,
  global: boolean = true): Thenable<void> {
  return getConfig().update(`vsicons.presets.${preset}`, initValue === undefined ? initValue : newvalue, global);
}

export function showCustomizationMessage(
  message: string,
  items: vscode.MessageItem[],
  callback?: Function,
  cancel?: (...args: any[]) => void,
  ...args: any[]) {
  vscode.window.showInformationMessage(message, ...items)
    .then(btn => {
      if (!btn) {
        if (cancel) { cancel(...args); }
        return;
      }

      if (btn.title === msg.disableDetect) {
        getConfig().update('vsicons.projectDetection.disableDetect', true, true);
        return;
      }

      if (btn.title === msg.autoReload) {
        getConfig().update('vsicons.projectDetection.autoReload', true, true);
      }

      if (callback) { callback(...args); }

      reload();
    }, (reason) => {
      // tslint:disable-next-line:no-console
      console.log('Rejected because: ', reason);
      return;
    });
}

export function reload() {
  vscode.commands.executeCommand('workbench.action.reloadWindow');
}

export function cancel(preset: string, value: boolean, initValue: boolean, global: boolean = true): void {
  togglePreset(preset, value, initValue, global);
}

export function applyCustomization() {
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
  const iconGenerator = new IconGenerator(vscode, schema, true);
  const json = mergeConfig(
    null,
    files,
    null,
    folders,
    iconGenerator);
  iconGenerator.persist(extensionSettings.iconJsonFileName, json);
}

function resetProjectDetectionDefaults() {
  const conf = getConfig();
  if (conf.vsicons.projectDetection.autoReload) {
    conf.update('vsicons.projectDetection.autoReload', false, true);
  }
  if (conf.vsicons.projectDetection.disableDetect) {
    conf.update('vsicons.projectDetection.disableDetect', false, true);
  }
}
