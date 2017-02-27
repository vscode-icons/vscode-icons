import * as fs from 'fs';
import * as path from 'path';
import { IVSIcons, IVSCodeUri, IProjectDetectionResult, LangResourceKeys } from '../models';
import { extensionSettings } from '../settings';
import { parseJSON } from '../utils';
import { LanguageResourceManager } from './../i18n';

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
  isNgProject: boolean,
  i18nManager: LanguageResourceManager): IProjectDetectionResult {

  // We need to mandatory check the following:
  // 1. The 'preset'
  // 2. The project releated icons are present in the manifest file
  // 3. It's a detectable project
  const enableIcons = (!angularPreset || ngIconsDisabled) && isNgProject;
  const disableIcons = (angularPreset || !ngIconsDisabled) && !isNgProject;

  if (enableIcons || disableIcons) {
    const message = enableIcons
      ? i18nManager.getMessage(LangResourceKeys.ngDetected)
      : i18nManager.getMessage(LangResourceKeys.nonNgDetected);
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
  i18nManager: LanguageResourceManager,
  message: string,
  presetText: string,
  value: boolean,
  initValue: boolean,
  defaultValue: boolean,
  autoReload: boolean,
  updatePreset: Function,
  applyCustomization: Function,
  showCustomizationMessage: Function,
  reload: Function,
  cancel: Function,
  handleVSCodeDir: Function): Thenable<void> {
  return updatePreset(presetText, value, defaultValue, false)
    .then(() => {
      // Add a delay in order for vscode to persist the toggle of the preset
      if (autoReload) {
        setTimeout(() => {
          applyCustomization();
          reload();
        }, 1000);
        return;
      }

      showCustomizationMessage(
        message,
        [{ title: i18nManager.getMessage(LangResourceKeys.reload) },
        { title: i18nManager.getMessage(LangResourceKeys.autoReload) },
        { title: i18nManager.getMessage(LangResourceKeys.disableDetect) }],
        applyCustomization, cancel, presetText, !value, initValue, false, handleVSCodeDir);
    });
}
