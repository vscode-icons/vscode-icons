import * as vscode from 'vscode';
import { getConfig, getVsiconsConfig } from '../utils/vscode-extensions';
import { LanguageResourceManager } from '../i18n/languageResourceManager';
import * as iconManifest from '../icon-manifest';
import { extensions as files } from '../icon-manifest/supportedExtensions';
import { extensions as folders } from '../icon-manifest/supportedFolders';
import { ManifestReader as mr } from '../icon-manifest/manifestReader';
import * as models from '../models';
import { SettingsManager, extensionSettings } from '../settings';
import { manageApplyCustomizations } from '../init';
import * as helper from './helper';
import { initialized } from '../';
import { constants } from '../constants';

const i18nManager = new LanguageResourceManager(vscode.env.language);
const settingsManager = new SettingsManager(vscode);
const initVSIconsConfig: models.IVSIcons = getVsiconsConfig();

let doReload: boolean;
let customMsgShown: boolean;
let cb: (...args: any[]) => void;
let argms: any[];

vscode.workspace.onDidChangeConfiguration(didChangeConfigurationListener);

function didChangeConfigurationListener(): void {
  if (!initialized) {
    return;
  }

  // Update the status in settings
  const status =
    getConfig().inspect(constants.vscode.iconThemeSetting).globalValue ===
    constants.extensionName
      ? models.ExtensionStatus.enabled
      : models.ExtensionStatus.notActivated;
  if (settingsManager.getState().status !== status) {
    settingsManager.updateStatus(status);
  }

  if (doReload) {
    doReload = false;
    // 'vscode' team still hasn't fixed this: In case the 'user settings' file has just been created
    // a delay needs to be introduced in order for the preset change to get persisted on disk.
    setTimeout(() => {
      executeAndReload(cb, ...argms);
    }, 500);
  } else if (!customMsgShown) {
    manageApplyCustomizations(
      initVSIconsConfig,
      getVsiconsConfig(),
      applyCustomizationCommand,
      [{ title: i18nManager.getMessage(models.LangResourceKeys.dontShowThis) }],
    );
  }
}

export function registerCommands(context: vscode.ExtensionContext): void {
  registerCommand(context, 'activateIcons', activationCommand);
  registerCommand(context, 'regenerateIcons', applyCustomizationCommand);
  registerCommand(context, 'restoreIcons', restoreDefaultManifestCommand);
  registerCommand(
    context,
    'resetProjectDetectionDefaults',
    resetProjectDetectionDefaultsCommand,
  );
  registerCommand(context, 'ngPreset', toggleAngularPresetCommand);
  registerCommand(context, 'jsPreset', toggleJsPresetCommand);
  registerCommand(context, 'tsPreset', toggleTsPresetCommand);
  registerCommand(context, 'jsonPreset', toggleJsonPresetCommand);
  registerCommand(context, 'hideFoldersPreset', toggleHideFoldersPresetCommand);
  registerCommand(
    context,
    'foldersAllDefaultIconPreset',
    toggleFoldersAllDefaultIconPresetCommand,
  );
  registerCommand(
    context,
    'hideExplorerArrowsPreset',
    toggleHideExplorerArrowsPresetCommand,
  );
}

function registerCommand(
  context: vscode.ExtensionContext,
  name: string,
  callback: (...args: any[]) => any,
): vscode.Disposable {
  const command = vscode.commands.registerCommand(
    `${constants.extensionName}.${name}`,
    callback,
  );
  context.subscriptions.push(command);
  return command;
}

export function activationCommand(): void {
  getConfig().update(
    constants.vscode.iconThemeSetting,
    constants.extensionName,
    true,
  );
}

export function applyCustomizationCommand(
  additionalTitles: models.IVSCodeMessageItem[] = [],
): void {
  const message = i18nManager.getMessage(
    models.LangResourceKeys.iconCustomization,
    ' ',
    models.LangResourceKeys.restart,
  );
  showCustomizationMessage(
    message,
    [
      { title: i18nManager.getMessage(models.LangResourceKeys.reload) },
      ...additionalTitles,
    ],
    applyCustomization,
  );
}

function restoreDefaultManifestCommand(): void {
  const message = i18nManager.getMessage(
    models.LangResourceKeys.iconRestore,
    ' ',
    models.LangResourceKeys.restart,
  );
  showCustomizationMessage(
    message,
    [{ title: i18nManager.getMessage(models.LangResourceKeys.reload) }],
    restoreManifest,
  );
}

function resetProjectDetectionDefaultsCommand(): void {
  const message = i18nManager.getMessage(
    models.LangResourceKeys.projectDetectionReset,
    ' ',
    models.LangResourceKeys.restart,
  );
  showCustomizationMessage(
    message,
    [{ title: i18nManager.getMessage(models.LangResourceKeys.reload) }],
    resetProjectDetectionDefaults,
  );
}

function toggleAngularPresetCommand(): void {
  togglePreset(models.PresetNames.angular, 'ngPreset', false, false);
}

function toggleJsPresetCommand(): void {
  togglePreset(models.PresetNames.jsOfficial, 'jsOfficialPreset');
}

function toggleTsPresetCommand(): void {
  togglePreset(models.PresetNames.tsOfficial, 'tsOfficialPreset');
}

function toggleJsonPresetCommand(): void {
  togglePreset(models.PresetNames.jsonOfficial, 'jsonOfficialPreset');
}

function toggleHideFoldersPresetCommand(): void {
  togglePreset(models.PresetNames.hideFolders, 'hideFoldersPreset', true);
}

function toggleFoldersAllDefaultIconPresetCommand(): void {
  togglePreset(
    models.PresetNames.foldersAllDefaultIcon,
    'foldersAllDefaultIconPreset',
    true,
  );
}

function toggleHideExplorerArrowsPresetCommand(): void {
  togglePreset(
    models.PresetNames.hideExplorerArrows,
    'hideExplorerArrowsPreset',
    true,
  );
}

function togglePreset(
  presetName: models.PresetNames,
  presetKey: string,
  reverseAction: boolean = false,
  global: boolean = true,
): void {
  const preset = models.PresetNames[presetName];
  const toggledValue = helper.isNonIconsRelatedPreset(presetName)
    ? !getVsiconsConfig().presets[preset]
    : helper.isFoldersRelated(presetName)
      ? mr.folderIconsDisabled(helper.getFunc(preset))
      : mr.iconsDisabled(helper.getIconName(preset));
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
    models.LangResourceKeys[`${presetKey}${action}`],
    ' ',
    models.LangResourceKeys.restart,
  )}`;

  showCustomizationMessage(
    message,
    [{ title: i18nManager.getMessage(models.LangResourceKeys.reload) }],
    applyCustomization,
    preset,
    toggledValue,
    global,
  );
}

export function updatePreset(
  preset: string,
  toggledValue: boolean,
  global: boolean = true,
): Thenable<void> {
  const removePreset =
    getConfig().inspect(`vsicons.presets.${preset}`).defaultValue ===
    toggledValue;
  return getConfig().update(
    `vsicons.presets.${preset}`,
    removePreset ? undefined : toggledValue,
    global,
  );
}

export function showCustomizationMessage(
  message: string,
  items: models.IVSCodeMessageItem[],
  callback?: (...args: any[]) => void,
  ...args: any[]
): Thenable<void> {
  customMsgShown = true;
  return vscode.window.showInformationMessage(message, ...items).then(
    btn => handleAction(btn, callback, ...args),
    // tslint:disable-next-line:no-console
    reason => console.info('Rejected because: ', reason),
  );
}

function executeAndReload(callback: any, ...args: any[]): void {
  if (callback) {
    callback(...args);
  }
  reload();
}

function handleAction(
  btn: models.IVSCodeMessageItem,
  callback?: (...args: any[]) => void,
  ...args: any[]
): void {
  if (!btn) {
    customMsgShown = false;
    return;
  }

  cb = callback;
  argms = args;

  const handlePreset = (): void => {
    // If the preset is the same as the toggle value then trigger an explicit reload
    // Note: This condition works also for auto-reload handling
    if (getConfig().vsicons.presets[args[0]] === args[1]) {
      executeAndReload(callback, ...args);
    } else {
      if (args.length !== 3) {
        throw new Error('Arguments mismatch');
      }
      doReload = true;
      updatePreset(args[0], args[1], args[2]);
    }
  };

  switch (btn.title) {
    case i18nManager.getMessage(models.LangResourceKeys.dontShowThis):
      {
        doReload = false;
        if (!callback) {
          break;
        }
        switch (callback.name) {
          case 'applyCustomization':
            {
              customMsgShown = false;
              getConfig().update(
                constants.vsicons.dontShowConfigManuallyChangedMessageSetting,
                true,
                true,
              );
            }
            break;
          default:
            break;
        }
      }
      break;
    case i18nManager.getMessage(models.LangResourceKeys.disableDetect):
      {
        doReload = false;
        getConfig().update(
          constants.vsicons.projectDetectionDisableDetectSetting,
          true,
          true,
        );
      }
      break;
    case i18nManager.getMessage(models.LangResourceKeys.autoReload):
      {
        getConfig()
          .update(
            constants.vsicons.projectDetectionAutoReloadSetting,
            true,
            true,
          )
          .then(() => handlePreset());
      }
      break;
    case i18nManager.getMessage(models.LangResourceKeys.reload):
      {
        if (!args || args.length !== 3) {
          executeAndReload(callback, ...args);
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
  vscode.commands.executeCommand(constants.vscode.reloadWindowActionSetting);
}

export function applyCustomization(
  projectDetectionResult: models.IProjectDetectionResult = null,
): void {
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
  projectDetectionResult: models.IProjectDetectionResult = null,
): void {
  const vsicons = getVsiconsConfig();
  const iconGenerator = new iconManifest.IconGenerator(
    vscode,
    iconManifest.schema,
    vsicons.customIconFolderPath,
  );
  const hasProjectDetectionResult =
    projectDetectionResult &&
    typeof projectDetectionResult === 'object' &&
    'value' in projectDetectionResult;
  const angularPreset = hasProjectDetectionResult
    ? projectDetectionResult.value
    : vsicons.presets.angular;
  let workingCustomFiles = customFiles;
  let workingCustomFolders = customFolders;
  if (customFiles) {
    // check presets...
    workingCustomFiles = iconManifest.toggleAngularPreset(
      !angularPreset,
      customFiles,
    );
    workingCustomFiles = iconManifest.toggleOfficialIconsPreset(
      !vsicons.presets.jsOfficial,
      workingCustomFiles,
      [models.IconNames.jsOfficial],
      [models.IconNames.js],
    );
    workingCustomFiles = iconManifest.toggleOfficialIconsPreset(
      !vsicons.presets.tsOfficial,
      workingCustomFiles,
      [models.IconNames.tsOfficial, models.IconNames.tsDefOfficial],
      [models.IconNames.ts, models.IconNames.tsDef],
    );
    workingCustomFiles = iconManifest.toggleOfficialIconsPreset(
      !vsicons.presets.jsonOfficial,
      workingCustomFiles,
      [models.IconNames.jsonOfficial],
      [models.IconNames.json],
    );
  }
  if (customFolders) {
    workingCustomFolders = iconManifest.toggleFoldersAllDefaultIconPreset(
      vsicons.presets.foldersAllDefaultIcon,
      customFolders,
    );
    workingCustomFolders = iconManifest.toggleHideFoldersPreset(
      vsicons.presets.hideFolders,
      workingCustomFolders,
    );
  }
  // presets affecting default icons
  const workingFiles = iconManifest.toggleAngularPreset(!angularPreset, files);
  let workingFolders = iconManifest.toggleFoldersAllDefaultIconPreset(
    vsicons.presets.foldersAllDefaultIcon,
    folders,
  );
  workingFolders = iconManifest.toggleHideFoldersPreset(
    vsicons.presets.hideFolders,
    workingFolders,
  );

  const json = iconManifest.mergeConfig(
    workingCustomFiles,
    workingFiles,
    workingCustomFolders,
    workingFolders,
    iconGenerator,
  );

  // apply non icons related config settings
  json.hidesExplorerArrows = vsicons.presets.hideExplorerArrows;

  iconGenerator.persist(extensionSettings.iconJsonFileName, json);
}

function restoreManifest(): void {
  const iconGenerator = new iconManifest.IconGenerator(
    vscode,
    iconManifest.schema,
    '',
    /*avoidCustomDetection*/ true,
  );
  const json = iconGenerator.generateJson(files, folders);
  iconGenerator.persist(extensionSettings.iconJsonFileName, json);
}

function resetProjectDetectionDefaults(): void {
  const conf = getConfig();
  if (conf.vsicons.projectDetection.autoReload) {
    conf.update(
      constants.vsicons.projectDetectionAutoReloadSetting,
      false,
      true,
    );
  }
  if (conf.vsicons.projectDetection.disableDetect) {
    conf.update(
      constants.vsicons.projectDetectionDisableDetectSetting,
      false,
      true,
    );
  }
}
