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
import { getConfig, findFiles } from './utils/vscode-extensions';

function initialize(context: vscode.ExtensionContext) {
  const config = getConfig().vsicons;
  const settingsManager = new SettingsManager(vscode);
  registerCommands(context);
  manageWelcomeMessage(settingsManager);
  detectProject(findFiles, config)
    .then((path) => {
      if (path != null) {
        const project = fs.readFileSync(path, "utf8");
        const projectJson = (typeof project === "string") ? JSON.parse(project) : null;
        if (projectJson) {
          const ngIconsDisabled = iconsDisabled('ng');
          const isNgProject = isProject(projectJson, 'ng');
          const toggle = checkForAngularProject(projectJson, config.presets.angular, ngIconsDisabled, isNgProject);
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
