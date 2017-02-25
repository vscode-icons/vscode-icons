import * as vscode from 'vscode';
import * as fs from 'fs';
import { SettingsManager } from './settings';
import {
  manageWelcomeMessage,
  manageAutoApplyCustomizations,
  detectProject,
  checkForAngularProject,
  iconsDisabled,
  isProject,
  applyDetection,
} from './init';
import {
  registerCommands,
  applyCustomizationCommand,
  applyCustomization,
  reload,
  updatePreset,
  cancel,
  showCustomizationMessage,
} from './commands';
import { getConfig, findFiles, asRelativePath } from './utils/vscode-extensions';
import { parseJSON } from './utils';
import { LanguageResourceManager } from './i18n';

function initialize(context: vscode.ExtensionContext) {
  const config = getConfig().vsicons;
  const settingsManager = new SettingsManager(vscode);
  const i18nManager = new LanguageResourceManager(vscode.env.language);

  registerCommands(context);
  manageWelcomeMessage(settingsManager);
  detectProject(findFiles, config)
    .then((results) => {
      if (results != null && results.length) {
        const isInRootFolder = !asRelativePath(results[0].fsPath).includes('/');
        if (isInRootFolder) {
          const ngIconsDisabled = iconsDisabled('ng');
          let isNgProject: boolean;
          for (const result of results) {
            const content = fs.readFileSync(result.fsPath, "utf8");
            const projectJson = parseJSON(content);
            isNgProject = projectJson && isProject(projectJson, 'ng');
            if (isNgProject) {
              break;
            }
          }

          const toggle = checkForAngularProject(
            config.presets.angular,
            ngIconsDisabled,
            isNgProject,
            i18nManager);

          if (toggle.apply) {
            const presetText = 'angular';
            const values = getConfig().inspect(`vsicons.presets.${presetText}`);
            const defaultValue = values.defaultValue as boolean;
            const initValue = values.workspaceValue as boolean;
            applyDetection(toggle.message, presetText, toggle.value, initValue, defaultValue,
              config.projectDetection.autoReload, updatePreset, applyCustomization,
              reload, cancel, showCustomizationMessage, i18nManager);
          }
          return;
        }
      }

      manageAutoApplyCustomizations(settingsManager.isNewVersion(), config, applyCustomizationCommand);
    });
}

export function activate(context: vscode.ExtensionContext) {
  initialize(context);
  // tslint:disable-next-line no-console
  console.log('vscode-icons is active!');
}

// this method is called when your vscode is closed
export function deactivate() {
  // no code here at the moment
}
