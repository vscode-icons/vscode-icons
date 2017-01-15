import * as fs from 'fs';
import * as path from 'path';
import { findFiles } from '../utils/vscode-extensions';
import { IVSIcons } from './../models/contributions';
import {
  showCustomizationMessage,
  reload,
  applyCustomization,
  togglePreset,
  cancel,
} from '../commands';
import { extensionSettings } from '../settings';
import { messages as msg } from '../messages';
import { getConfig } from '../utils/vscode-extensions';

export function detectProject(vsicons: IVSIcons): PromiseLike<boolean> {
  if (vsicons.projectDetection.disableDetect) {
    return Promise.resolve(false) as PromiseLike<boolean>;
  }

  return findFiles('package.json', '**/node_modules/**', 1)
    .then((res) => {
      if (!res || !res.length) {
        return false;
      }

      const project = fs.readFileSync(res[0].fsPath, "utf8");
      const projectJson = (typeof project === "string") ? JSON.parse(project) : null;

      if (!projectJson) {
        return false;
      }

      return checkForAngular2Project(projectJson, vsicons.presets.angular) || false;
    });
}

export function checkForAngular2Project(projectJson: any, angularPreset: boolean): boolean {
  const ng = 'ng';
  const presetText = 'angular';
  const ngIconsDisabled = iconsDisabled(ng);
  const isNgProject = isProject(projectJson, ng);

  // We need to mandatory check the following:
  // 1. The 'preset'
  // 2. The project releated icons are present in the manifest file
  // 3. It's a detectable project
  const enableIcons = (!angularPreset || ngIconsDisabled) && isNgProject;
  const disableIcons = (angularPreset || !ngIconsDisabled) && !isNgProject;

  if (enableIcons || disableIcons) {
    const message = enableIcons ? msg.ng2Detected : msg.nonNg2Detected;
    apply(message, presetText, enableIcons || !disableIcons)
      .then(() => {
        return true;
      });
  }

  return false;
}

function apply(message: string, presetText: string, value: boolean) {
  return togglePreset(presetText, value, false)
    .then(() => {
      // Add a delay in order for vscode to persist the toggle of the preset
      setTimeout(() => {
        if (getConfig().vsicons.projectDetection.autoReload) {
          applyCustomization();
          reload();
          return;
        }

        showCustomizationMessage(message,
          [{ title: msg.reload }, { title: msg.autoReload }, { title: msg.disableDetect }],
          applyCustomization, cancel, presetText, !value, false);
      }, 500);
    });
}

function iconsDisabled(name: string): boolean {
  const manifestFilePath = path.join(__dirname, '..', extensionSettings.iconJsonFileName);
  const iconManifest = fs.readFileSync(manifestFilePath, 'utf8');
  const iconsJson = (typeof iconManifest === "string") ? JSON.parse(iconManifest) : null;

  if (!iconsJson) {
    return true;
  }

  for (const key in iconsJson.iconDefinitions) {
    if (key.startsWith(`_f_${name}_`)) {
      return false;
    }
  }

  return true;
}

function isProject(projectJson: any, name: string): boolean {
  switch (name) {
    case 'ng':
    case 'ng2':
    case 'angular2':
      return (projectJson.dependencies && (projectJson.dependencies['@angular/core'] != null)) || false;
    default:
      return false;
  }
}
