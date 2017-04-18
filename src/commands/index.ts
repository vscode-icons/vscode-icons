import * as vscode from 'vscode';
import { getConfig } from '../utils/vscode-extensions';
import { LanguageResourceManager } from '../i18n';
import * as iconManifest from '../icon-manifest';
import { extensions as files } from '../icon-manifest/supportedExtensions';
import { extensions as folders } from '../icon-manifest/supportedFolders';
import { IFileCollection, IFolderCollection, LangResourceKeys } from '../models';
import { extensionSettings } from '../settings';

const i18nManager = new LanguageResourceManager(vscode.env.language);

export function registerCommands(context: vscode.ExtensionContext): void {
  registerCommand(context, 'regenerateIcons', applyCustomizationCommand);
  registerCommand(context, 'restoreIcons', restoreDefaultManifestCommand);
  registerCommand(context, 'resetProjectDetectionDefaults', resetProjectDetectionDefaultsCommand);
  registerCommand(context, 'ngPreset', toggleAngularPresetCommand);
  registerCommand(context, 'jsPreset', toggleJsPresetCommand);
  registerCommand(context, 'tsPreset', toggleTsPresetCommand);
  registerCommand(context, 'jsonPreset', toggleJsonPresetCommand);
  registerCommand(context, 'hideFoldersPreset', toggleHideFoldersPresetCommand);
  registerCommand(context, 'foldersAllDefaultIconPreset', toggleFoldersAllDefaultIconPresetCommand);
}

function registerCommand(
  context: vscode.ExtensionContext,
  name: string,
  callback: (...args: any[]) => any): vscode.Disposable {

  const command = vscode.commands.registerCommand(`vscode-icons.${name}`, callback);
  context.subscriptions.push(command);
  return command;
}

export function applyCustomizationCommand(): void {
  const message = i18nManager.getMessage(LangResourceKeys.iconCustomization, ' ', LangResourceKeys.restart);
  showCustomizationMessage(message,
    [{ title: i18nManager.getMessage(LangResourceKeys.reload) }],
    applyCustomization);
}

function restoreDefaultManifestCommand(): void {
  const message = i18nManager.getMessage(LangResourceKeys.iconRestore, ' ', LangResourceKeys.restart);
  showCustomizationMessage(message,
    [{ title: i18nManager.getMessage(LangResourceKeys.reload) }],
    restoreManifest);
}

function resetProjectDetectionDefaultsCommand(): void {
  const message = i18nManager.getMessage(LangResourceKeys.projectDetecticonReset, ' ', LangResourceKeys.restart);
  showCustomizationMessage(
    message,
    [{ title: i18nManager.getMessage(LangResourceKeys.reload) }],
    resetProjectDetectionDefaults);
}

function toggleAngularPresetCommand(): void {
  togglePreset('angular', 'ngPreset', false, false);
}

function toggleJsPresetCommand(): void {
  togglePreset('jsOfficial', 'jsOfficialPreset');
}

function toggleTsPresetCommand(): void {
  togglePreset('tsOfficial', 'tsOfficialPreset');
}

function toggleJsonPresetCommand(): void {
  togglePreset('jsonOfficial', 'jsonOfficialPreset');
}

function toggleHideFoldersPresetCommand(): void {
  togglePreset('hideFolders', 'hideFoldersPreset', true);
}

function toggleFoldersAllDefaultIconPresetCommand(): void {
  togglePreset('foldersAllDefaultIcon', 'foldersAllDefaultIconPreset', true);
}

function togglePreset(
  preset: string,
  presetKey: string,
  reverseAction: boolean = false,
  global: boolean = true): void {

  // Actually here we should detect the present of the icons references in the icon-manifest
  // instead of the preset, as it can be manipulatedby the user resulting in showing the wrong action message
  const toggledValue = !getConfig().vsicons.presets[preset];
  const action = reverseAction
    ? toggledValue
      ? 'Disabled'
      : 'Enabled'
    : toggledValue
      ? 'Enabled'
      : 'Disabled';

  if (!Reflect.has(LangResourceKeys, `${presetKey}${action}`)) {
    throw Error(`${presetKey}${action} is not valid`);
  }

  const message = `${i18nManager.getMessage(LangResourceKeys[`${presetKey}${action}`], ' ', LangResourceKeys.restart)}`;

  showCustomizationMessage(message,
    [{ title: i18nManager.getMessage(LangResourceKeys.reload) }],
    applyCustomization, preset, toggledValue, global);
}

export function updatePreset(
  preset: string,
  toggledValue: boolean,
  global: boolean = true): Thenable<void> {

  const removePreset = getConfig().inspect(`vsicons.presets.${preset}`).defaultValue === toggledValue;
  return getConfig().update(`vsicons.presets.${preset}`, removePreset ? undefined : toggledValue, global);
}

export function showCustomizationMessage(
  message: string,
  items: vscode.MessageItem[],
  callback?: () => void,
  ...args: any[]): Thenable<void> {

  return vscode.window.showInformationMessage(message, ...items)
    .then((btn) => handleAction(btn, callback, ...args),
    // tslint:disable-next-line:no-console
    (reason) => console.info('Rejected because: ', reason));
}

function handleAction(btn: vscode.MessageItem, callback?: () => void, ...args: any[]): void {
  let doReload: boolean;

  vscode.workspace.onDidChangeConfiguration(() => {
    if (doReload) {
      executeAndReload(callback);
    }
  });

  if (!btn) {
    return;
  }

  switch (btn.title) {
    case i18nManager.getMessage(LangResourceKeys.disableDetect):
      {
        doReload = false;
        getConfig().update('vsicons.projectDetection.disableDetect', true, true);
      }
      break;
    case i18nManager.getMessage(LangResourceKeys.autoReload):
      {
        getConfig().update('vsicons.projectDetection.autoReload', true, true)
          .then(() => {
            if (args.length !== 3) {
              throw new Error('Arguments mismatch');
            }
            doReload = true;
            updatePreset(args[0], args[1], args[2]);
          });
      }
      break;
    case i18nManager.getMessage(LangResourceKeys.reload):
      {
        if (!args || !args.length) {
          executeAndReload(callback);
          break;
        }
        if (args.length !== 3) {
          throw new Error('Arguments mismatch');
        }
        doReload = true;
        updatePreset(args[0], args[1], args[2]);
      }
      break;
    default:
      break;
  }
}

function executeAndReload(callback?: () => void) {
  if (callback) {
    callback();
  }
  reload();
}

export function reload(): void {
  vscode.commands.executeCommand('workbench.action.reloadWindow');
}

export function cancel(
  preset: string,
  value: boolean,
  global: boolean = true,
  callback?: () => void): void {
  updatePreset(preset, value, global)
    .then(() => {
      if (callback) {
        callback();
      }
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
  const iconGenerator = new iconManifest.IconGenerator(vscode, iconManifest.schema);
  const presets = getConfig().vsicons.presets;
  let workingCustomFiles = customFiles;
  let workingCustomFolders = customFolders;
  if (customFiles) {
    // check presets...
    workingCustomFiles = iconManifest.toggleAngularPreset(!presets.angular, customFiles);
    workingCustomFiles = iconManifest.toggleOfficialIconsPreset(!presets.jsOfficial, workingCustomFiles,
      ['js_official'], ['js']);
    workingCustomFiles = iconManifest.toggleOfficialIconsPreset(!presets.tsOfficial, workingCustomFiles,
      ['typescript_official', 'typescriptdef_official'], ['typescript', 'typescriptdef']);
    workingCustomFiles = iconManifest.toggleOfficialIconsPreset(!presets.jsonOfficial, workingCustomFiles,
      ['json_official'], ['json']);
  }
  if (customFolders) {
    workingCustomFolders = iconManifest.toggleFoldersAllDefaultIconPreset(
      presets.foldersAllDefaultIcon, customFolders);
    workingCustomFolders = iconManifest.toggleHideFoldersPreset(presets.hideFolders, workingCustomFolders);
  }
  // presets affecting default icons
  const workingFiles = iconManifest.toggleAngularPreset(!presets.angular, files);
  let workingFolders = iconManifest.toggleFoldersAllDefaultIconPreset(presets.foldersAllDefaultIcon, folders);
  workingFolders = iconManifest.toggleHideFoldersPreset(presets.hideFolders, workingFolders);

  const json = iconManifest.mergeConfig(
    workingCustomFiles,
    workingFiles,
    workingCustomFolders,
    workingFolders,
    iconGenerator);
  iconGenerator.persist(extensionSettings.iconJsonFileName, json);
}

function restoreManifest(): void {
  const iconGenerator = new iconManifest.IconGenerator(vscode, iconManifest.schema, true);
  const json = iconManifest.mergeConfig(
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
