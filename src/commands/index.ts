import * as vscode from 'vscode';
import { getConfig } from '../utils/vscode-extensions';
import { LanguageResourceManager } from '../i18n';
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
  LangResourceKeys,
} from '../models';
import { extensionSettings } from '../settings';
import { handleVSCodeDir } from '../';

const i18nManager = new LanguageResourceManager(vscode.env.language);

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
  callback: (...args: any[]) => any): vscode.Disposable {

  const command = vscode.commands.registerCommand(`extension.${name}`, callback);
  context.subscriptions.push(command);
  return command;
}

export function applyCustomizationCommand(): void {
  const message = i18nManager.getMessage(LangResourceKeys.iconCustomizationMessage, LangResourceKeys.restart);
  showCustomizationMessage(message,
    [{ title: i18nManager.getMessage(LangResourceKeys.reload) }],
    applyCustomization);
}

function restoreDefaultManifestCommand(): void {
  const message = i18nManager.getMessage(LangResourceKeys.iconRestoreMessage, LangResourceKeys.restart);
  showCustomizationMessage(message,
    [{ title: i18nManager.getMessage(LangResourceKeys.reload) }],
    restoreManifest);
}

function resetProjectDetectionDefaultsCommand(): void {
  const message = i18nManager.getMessage(LangResourceKeys.projectDetecticonResetMessage, LangResourceKeys.restart);
  showCustomizationMessage(
    message,
    [{ title: i18nManager.getMessage(LangResourceKeys.reload) }],
    resetProjectDetectionDefaults);
}

function togglePreset(
  preset: string,
  presetMessage: string,
  reverseAction: boolean = false,
  global: boolean = true): void {

  const value = getToggleValue(preset);

  let actionMessage: string;
  if (reverseAction) {
    actionMessage = value
      ? i18nManager.getMessage(LangResourceKeys.disabled)
      : i18nManager.getMessage(LangResourceKeys.enabled);
  } else {
    actionMessage = value
      ? i18nManager.getMessage(LangResourceKeys.enabled)
      : i18nManager.getMessage(LangResourceKeys.disabled);
  }

  const message =
    `${presetMessage} ${actionMessage}. ${i18nManager.getMessage(LangResourceKeys.restart)}`;
  const { defaultValue, globalValue, workspaceValue } = getConfig().inspect(`vsicons.presets.${preset}`);
  const initValue = (global ? globalValue : workspaceValue) as boolean;

  updatePreset(preset, value, defaultValue as boolean, global);
  showCustomizationMessage(message,
    [{ title: i18nManager.getMessage(LangResourceKeys.reload) }],
    applyCustomization, cancel, preset, !value, initValue, global, handleVSCodeDir);
}

function toggleAngularPresetCommand(): void {
  togglePreset('angular', i18nManager.getMessage(LangResourceKeys.ngPresetMessage), false, false);
}

function toggleJsPresetCommand(): void {
  togglePreset('jsOfficial', i18nManager.getMessage(LangResourceKeys.jsOfficialPresetMessage));
}

function toggleTsPresetCommand(): void {
  togglePreset('tsOfficial', i18nManager.getMessage(LangResourceKeys.tsOfficialPresetMessage));
}

function toggleJsonPresetCommand(): void {
  togglePreset('jsonOfficial', i18nManager.getMessage(LangResourceKeys.jsonOfficialPresetMessage));
}

function toggleHideFoldersCommand(): void {
  togglePreset('hideFolders', i18nManager.getMessage(LangResourceKeys.hideFoldersPresetMessage), true);
}

function getToggleValue(preset: string): boolean {
  return !getConfig().vsicons.presets[preset];
}

export function updatePreset(
  preset: string,
  newValue: boolean,
  initValue: boolean,
  global: boolean = true): Thenable<void> {

  return getConfig().update(`vsicons.presets.${preset}`, initValue === undefined ? initValue : newValue, global);
}

export function showCustomizationMessage(
  message: string,
  items: vscode.MessageItem[],
  callback?: Function,
  cancel?: (...args: any[]) => void,
  ...args: any[]): void {

  vscode.window.showInformationMessage(message, ...items)
    .then(btn => {
      if (!btn) {
        if (cancel) { cancel(...args); }
        return;
      }

      if (btn.title === i18nManager.getMessage(LangResourceKeys.disableDetect)) {
        getConfig().update('vsicons.projectDetection.disableDetect', true, true);
        return;
      }

      if (btn.title === i18nManager.getMessage(LangResourceKeys.autoReload)) {
        getConfig().update('vsicons.projectDetection.autoReload', true, true);
      }

      if (callback) { callback(); }

      reload();
    }, (reason) => {
      // tslint:disable-next-line:no-console
      console.log('Rejected because: ', reason);
      return;
    });
}

export function reload(): void {
  vscode.commands.executeCommand('workbench.action.reloadWindow');
}

export function cancel(
  preset: string,
  value: boolean,
  initValue: boolean,
  global: boolean = true,
  callback?: Function): void {
  updatePreset(preset, value, initValue, global)
    .then(() => {
      setTimeout(() => {
        if (callback) {
          callback();
        }
      }, 1000);
    });
}

export function applyCustomization(): void {
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
  customFolders: IFolderCollection): void {

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

function restoreManifest(): void {
  const iconGenerator = new IconGenerator(vscode, schema, true);
  const json = mergeConfig(
    null,
    files,
    null,
    folders,
    iconGenerator);
  iconGenerator.persist(extensionSettings.iconJsonFileName, json);
}

function resetProjectDetectionDefaults(): void {
  const conf = getConfig();
  if (conf.vsicons.projectDetection.autoReload) {
    conf.update('vsicons.projectDetection.autoReload', false, true);
  }
  if (conf.vsicons.projectDetection.disableDetect) {
    conf.update('vsicons.projectDetection.disableDetect', false, true);
  }
}
