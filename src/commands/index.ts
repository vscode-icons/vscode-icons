import * as vscode from 'vscode';
import { getConfig } from '../utils/vscode-extensions';
import { LanguageResourceManager } from '../i18n';
import * as iconManifest from '../icon-manifest';
import { extensions as files } from '../icon-manifest/supportedExtensions';
import { extensions as folders } from '../icon-manifest/supportedFolders';
import * as models from '../models';
import { extensionSettings } from '../settings';
import { folderIconsDisabled, iconsDisabled } from '../init';

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
  cb: (...args: any[]) => any): vscode.Disposable {

  const command = vscode.commands.registerCommand(`vscode-icons.${name}`, cb);
  context.subscriptions.push(command);
  return command;
}

export function applyCustomizationCommand(): void {
  const message = i18nManager.getMessage(
    models.LangResourceKeys.iconCustomization, ' ', models.LangResourceKeys.restart);
  showCustomizationMessage(message,
    [{ title: i18nManager.getMessage(models.LangResourceKeys.reload) }],
    applyCustomization);
}

function restoreDefaultManifestCommand(): void {
  const message = i18nManager.getMessage(
    models.LangResourceKeys.iconRestore, ' ', models.LangResourceKeys.restart);
  showCustomizationMessage(message,
    [{ title: i18nManager.getMessage(models.LangResourceKeys.reload) }],
    restoreManifest);
}

function resetProjectDetectionDefaultsCommand(): void {
  const message = i18nManager.getMessage(
    models.LangResourceKeys.projectDetecticonReset, ' ', models.LangResourceKeys.restart);
  showCustomizationMessage(
    message,
    [{ title: i18nManager.getMessage(models.LangResourceKeys.reload) }],
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

  const toggledValue = isFolders(preset)
    ? folderIconsDisabled(getFunc(preset))
    : iconsDisabled(getIconName(preset));
  const action = reverseAction
    ? toggledValue
      ? 'Disabled'
      : 'Enabled'
    : toggledValue
      ? 'Enabled'
      : 'Disabled';

  if (!Reflect.has(models.LangResourceKeys, `${presetKey}${action}`)) {
    throw Error(`${presetKey}${action} is not valid`);
  }

  const message = `${i18nManager.getMessage(
    models.LangResourceKeys[`${presetKey}${action}`], ' ', models.LangResourceKeys.restart)}`;

  showCustomizationMessage(message,
    [{ title: i18nManager.getMessage(models.LangResourceKeys.reload) }],
    applyCustomization, preset, toggledValue, global);
}

function isFolders(preset: string): boolean {
  return preset.toLowerCase().includes('folders');
}

function getFunc(preset: string): (iconsJson: models.IIconSchema) => boolean {
  switch (preset) {
    case 'hideFolders':
      return (iconsJson: models.IIconSchema) =>
        Object.keys(iconsJson.folderNames).length === 0 &&
        iconsJson.iconDefinitions._folder.iconPath === '';
    case 'foldersAllDefaultIcon':
      return (iconsJson: models.IIconSchema) =>
        Object.keys(iconsJson.folderNames).length === 0 &&
        iconsJson.iconDefinitions._folder.iconPath !== '';
    default:
      throw new Error('Not implemented');
  }
}

function getIconName(preset: string): string {
  switch (preset) {
    case 'angular':
      return 'ng';
    case 'jsOfficial':
      return 'js_official';
    case 'tsOfficial':
      return 'typescript_official';
    case 'jsonOfficial':
      return 'json_official';
    default:
      throw new Error('Not implemented');
  }
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
  items: models.IVSCodeMessageItem[],
  cb?: () => void,
  ...args: any[]): Thenable<void> {

  return vscode.window.showInformationMessage(message, ...items)
    .then((btn) => handleAction(btn, cb, ...args),
    // tslint:disable-next-line:no-console
    (reason) => console.info('Rejected because: ', reason));
}

let doReload: boolean;
let callback: () => void;

vscode.workspace.onDidChangeConfiguration(() => {
  if (doReload) {
    doReload = false;
    executeAndReload(callback);
  }
});

function handleAction(btn: models.IVSCodeMessageItem, cb?: () => void, ...args: any[]): void {
  callback = cb;

  if (!btn) {
    return;
  }

  switch (btn.title) {
    case i18nManager.getMessage(models.LangResourceKeys.disableDetect):
      {
        doReload = false;
        getConfig().update('vsicons.projectDetection.disableDetect', true, true);
      }
      break;
    case i18nManager.getMessage(models.LangResourceKeys.autoReload):
      {
        getConfig().update('vsicons.projectDetection.autoReload', true, true)
          .then(() => handleReload(args, cb));
      }
      break;
    case i18nManager.getMessage(models.LangResourceKeys.reload):
      {
        if (!args || !args.length) {
          executeAndReload(cb);
          break;
        }
        handleReload(args, cb);
      }
      break;
    default:
      break;
  }
}

function handleReload(args: any[], cb: () => any): void {
  if (args.length !== 3) {
    throw new Error('Arguments mismatch');
  }
  // If the preset is the same as the toggle value then trigger an explicit reload
  if (getConfig().vsicons.presets[args[0]] === args[1]) {
    executeAndReload(cb);
  } else {
    doReload = true;
    updatePreset(args[0], args[1], args[2]);
  }
}

function executeAndReload(cb?: () => void) {
  if (cb) {
    cb();
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
  cb?: () => void): void {
  updatePreset(preset, value, global)
    .then(() => {
      if (cb) {
        cb();
      }
    });
}

export function applyCustomization(): void {
  const associations = getConfig().vsicons.associations;
  const customFiles: models.IFileCollection = {
    default: associations.fileDefault,
    supported: associations.files,
  };
  const customFolders: models.IFolderCollection = {
    default: associations.folderDefault,
    supported: associations.folders,
  };
  generateManifest(customFiles, customFolders);
}

function generateManifest(
  customFiles: models.IFileCollection,
  customFolders: models.IFolderCollection): void {
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
