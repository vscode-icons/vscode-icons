import * as vscode from 'vscode';
import { getConfig } from '../utils/vscode-extensions';
import { messages as msg } from '../messages';
import {
  IconGenerator,
  mergeConfig,
  toggleAngular2Preset,
  toggleJavascriptOfficialPreset,
  toggleTypescriptOfficialPreset,
} from '../icon-manifest';
import { extensions as files } from '../icon-manifest/supportedExtensions';
import { extensions as folders } from '../icon-manifest/supportedFolders';
import { IFileCollection, IFolderCollection, IVSIcons, IFileDefault, IFolderDefault } from '../models/';
import { schema } from '../icon-manifest';

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
  generateManifest(null, null);
  showCustomizationMessage(msg.iconRestoreMessage);
}

function toggleAngular2PresetCommand() {
  const val = togglePreset('angular2', false);
  showCustomizationMessage(`${msg.ng2PresetMessage} ${val}`, applyCustomization);
}

function toggleJsPresetCommand() {
  const val = togglePreset('jsOfficial');
  showCustomizationMessage(`${msg.jsOfficialPresetMessage} ${val}`, applyCustomization);
}

function toggleTsPresetCommand() {
  const val = togglePreset('tsOfficial');
  showCustomizationMessage(`${msg.tsOfficialPresetMessage} ${val}`, applyCustomization);
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
