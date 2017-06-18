import * as vscode from 'vscode';
import { getConfig, getVsiconsConfig } from '../utils/vscode-extensions';
import { LanguageResourceManager } from '../i18n';
import * as iconManifest from '../icon-manifest';
import { extensions as files } from '../icon-manifest/supportedExtensions';
import { extensions as folders } from '../icon-manifest/supportedFolders';
import * as models from '../models';
import { extensionSettings } from '../settings';
import { folderIconsDisabled, iconsDisabled } from '../init';
import * as helper from './helper';

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
    models.LangResourceKeys.projectDetectionReset, ' ', models.LangResourceKeys.restart);
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

  const toggledValue = helper.isFolders(preset)
    ? folderIconsDisabled(helper.getFunc(preset))
    : iconsDisabled(helper.getIconName(preset));
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
  callback?: (...args: any[]) => void,
  ...args: any[]): Thenable<void> {

  return vscode.window.showInformationMessage(message, ...items)
    .then(btn => handleAction(btn, callback, ...args),
    // tslint:disable-next-line:no-console
    reason => console.info('Rejected because: ', reason));
}

function handleAction(btn: models.IVSCodeMessageItem, callback?: (...args: any[]) => void, ...args: any[]): void {
  if (!btn) {
    return;
  }

  let doReload: boolean;

  const executeAndReload = (): void => {
    if (callback) {
      callback(...args);
    }
    reload();
  };

  const handlePreset = (): void => {
    // If the preset is the same as the toggle value then trigger an explicit reload
    // Note: This condition works also for auto-reload handling
    if (getConfig().vsicons.presets[args[0]] === args[1]) {
      executeAndReload();
    } else {
      if (args.length !== 3) {
        throw new Error('Arguments mismatch');
      }
      doReload = true;
      updatePreset(args[0], args[1], args[2]);
    }
  };

  vscode.workspace.onDidChangeConfiguration(() => {
    if (doReload) {
      // 'vscode' team still hasn't fixed this: In case the 'user settings' file has just been created
      // a delay needs to be introduced in order for the preset change to get updated.
      setTimeout(() => {
        doReload = false;
        executeAndReload();
      }, 500);
    }
  });

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
          .then(() => handlePreset());
      }
      break;
    case i18nManager.getMessage(models.LangResourceKeys.reload):
      {
        if (!args || args.length !== 3) {
          executeAndReload();
          break;
        }
        handlePreset();
      }
      break;
    default:
      break;
  }
}

export function reload(): void {
  vscode.commands.executeCommand('workbench.action.reloadWindow');
}

export function applyCustomization(projectDetectionResult: models.IProjectDetectionResult = null): void {
  const associations = getVsiconsConfig().associations;
  const customFiles: models.IFileCollection = {
    default: associations.fileDefault,
    supported: associations.files,
  };
  const customFolders: models.IFolderCollection = {
    default: associations.folderDefault,
    supported: associations.folders,
  };
  generateManifest(customFiles, customFolders, projectDetectionResult);
}

function generateManifest(
  customFiles: models.IFileCollection,
  customFolders: models.IFolderCollection,
  projectDetectionResult: models.IProjectDetectionResult = null): void {
  const iconGenerator = new iconManifest.IconGenerator(vscode, iconManifest.schema);
  const vsicons = getVsiconsConfig();
  const hasProjectDetectionResult = projectDetectionResult &&
    typeof projectDetectionResult === 'object' &&
    'value' in projectDetectionResult;
  const angularPreset = hasProjectDetectionResult
    ? projectDetectionResult.value
    : vsicons.presets.angular;
  let workingCustomFiles = customFiles;
  let workingCustomFolders = customFolders;
  if (customFiles) {
    // check presets...
    workingCustomFiles = iconManifest.toggleAngularPreset(!angularPreset, customFiles);
    workingCustomFiles = iconManifest.toggleOfficialIconsPreset(!vsicons.presets.jsOfficial, workingCustomFiles,
      ['js_official'], ['js']);
    workingCustomFiles = iconManifest.toggleOfficialIconsPreset(!vsicons.presets.tsOfficial, workingCustomFiles,
      ['typescript_official', 'typescriptdef_official'], ['typescript', 'typescriptdef']);
    workingCustomFiles = iconManifest.toggleOfficialIconsPreset(!vsicons.presets.jsonOfficial, workingCustomFiles,
      ['json_official'], ['json']);
  }
  if (customFolders) {
    workingCustomFolders = iconManifest.toggleFoldersAllDefaultIconPreset(
      vsicons.presets.foldersAllDefaultIcon, customFolders);
    workingCustomFolders = iconManifest.toggleHideFoldersPreset(vsicons.presets.hideFolders, workingCustomFolders);
  }
  // presets affecting default icons
  const workingFiles = iconManifest.toggleAngularPreset(!angularPreset, files);
  let workingFolders = iconManifest.toggleFoldersAllDefaultIconPreset(vsicons.presets.foldersAllDefaultIcon, folders);
  workingFolders = iconManifest.toggleHideFoldersPreset(vsicons.presets.hideFolders, workingFolders);

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
