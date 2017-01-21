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
  togglePreset,
  cancel,
  showCustomizationMessage,
} from './commands';
import { getConfig, findFiles, asRelativePath } from './utils/vscode-extensions';

function initialize(context: vscode.ExtensionContext) {
  const config = getConfig().vsicons;
  const settingsManager = new SettingsManager(vscode);
  registerCommands(context);
  manageWelcomeMessage(settingsManager);
  detectProject(findFiles, config)
    .then((results) => {
      if (results != null && results.length) {
        const isInRootFolder = asRelativePath(results[0].fsPath).includes('/');
        if (isInRootFolder) {
          const ngIconsDisabled = iconsDisabled('ng');
          let isNgProject: boolean;
          for (const result of results) {
            const project = fs.readFileSync(result.fsPath, "utf8");
            const projectJson = (typeof project === "string") ? JSON.parse(project) : null;
            isNgProject = projectJson && isProject(projectJson, 'ng');
            if (isNgProject) {
              break;
            }
          }
          const toggle = checkForAngularProject(config.presets.angular, ngIconsDisabled, isNgProject);
          if (toggle.apply) {
            applyDetection(toggle.message, 'angular', toggle.value, config.projectDetection.autoReload,
              togglePreset, applyCustomization, reload, cancel, showCustomizationMessage);
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
