import * as fs from 'fs';
import * as path from 'path';
import { IVSIcons, IVSCodeUri, IProjectDetectionResult } from '../models';
import { extensionSettings } from '../settings';
import { messages as msg } from '../messages';
import { parseJSON } from '../utils';

export function detectProject(findFiles: Function, config: IVSIcons): PromiseLike<IVSCodeUri[]> {
  if (config.projectDetection.disableDetect) {
    return Promise.resolve([]) as PromiseLike<IVSCodeUri[]>;
  }

  return findFiles('**/package.json', '**/node_modules/**')
    .then((results) => {
      return results && results.length ? results as IVSCodeUri[] : [];
    },
    (rej) => {
      return [rej];
    });
}

export function checkForAngularProject(
  angularPreset: boolean,
  ngIconsDisabled: boolean,
  isNgProject: boolean): IProjectDetectionResult {

  // We need to mandatory check the following:
  // 1. The 'preset'
  // 2. The project releated icons are present in the manifest file
  // 3. It's a detectable project
  const enableIcons = (!angularPreset || ngIconsDisabled) && isNgProject;
  const disableIcons = (angularPreset || !ngIconsDisabled) && !isNgProject;

  if (enableIcons || disableIcons) {
    const message = enableIcons ? msg.ngDetected : msg.nonNgDetected;
    return { apply: true, message, value: enableIcons || !disableIcons };
  }

  return { apply: false };
}

export function iconsDisabled(name: string): boolean {
  const manifestFilePath = path.join(__dirname, '..', extensionSettings.iconJsonFileName);
  const iconManifest = fs.readFileSync(manifestFilePath, 'utf8');
  const iconsJson = parseJSON(iconManifest);

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

export function isProject(projectJson: any, name: string): boolean {
  switch (name) {
    case 'ng':
      return (projectJson.dependencies && (projectJson.dependencies['@angular/core'] != null)) || false;
    default:
      return false;
  }
}

export function applyDetection(
  message: string,
  presetText: string,
  value: boolean,
  initValue: boolean,
  autoReload: boolean,
  togglePreset: Function,
  applyCustomization: Function,
  reload: Function,
  cancel: Function,
  showCustomizationMessage: Function): Thenable<void> {
  return togglePreset(presetText, value, false, false)
    .then(() => {
      // Add a delay in order for vscode to persist the toggle of the preset
      if (autoReload) {
        setTimeout(() => {
          applyCustomization();
          reload();
        }, 1000);
        return;
      }

      showCustomizationMessage(message,
        [{ title: msg.reload }, { title: msg.autoReload }, { title: msg.disableDetect }],
        applyCustomization, cancel, presetText, !value, initValue, false);
    });
}
