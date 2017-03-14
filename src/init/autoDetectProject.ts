import * as fs from 'fs';
import * as path from 'path';
import * as model from '../models';
import { extensionSettings } from '../settings';
import { parseJSON } from '../utils';
import { LanguageResourceManager } from './../i18n';

export function detectProject(
  findFiles: (include: string,
    exclude: string,
    maxResults?: number,
    token?: model.IVSCodeCancellationToken) => Thenable<model.IVSCodeUri[]>,
  config: model.IVSIcons): PromiseLike<model.IVSCodeUri[]> {
  if (config.projectDetection.disableDetect) {
    return Promise.resolve([]) as PromiseLike<model.IVSCodeUri[]>;
  }

  return findFiles('**/package.json', '**/node_modules/**')
    .then((results) => {
      return results && results.length ? results as model.IVSCodeUri[] : [];
    },
    (rej) => {
      return [rej];
    });
}

export function checkForAngularProject(
  angularPreset: boolean,
  ngIconsDisabled: boolean,
  isNgProject: boolean,
  i18nManager: LanguageResourceManager): model.IProjectDetectionResult {

  // We need to mandatory check the following:
  // 1. The 'preset'
  // 2. The project releated icons are present in the manifest file
  // 3. It's a detectable project
  const enableIcons = (!angularPreset || ngIconsDisabled) && isNgProject;
  const disableIcons = (angularPreset || !ngIconsDisabled) && !isNgProject;

  if (enableIcons || disableIcons) {
    const message = enableIcons
      ? i18nManager.getMessage(model.LangResourceKeys.ngDetected)
      : i18nManager.getMessage(model.LangResourceKeys.nonNgDetected);
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
  updatePreset: (
    preset: string,
    newValue: boolean,
    initValue: boolean,
    global: boolean) => Thenable<void>,
  applyCustomization: () => void,
  showCustomizationMessage: (
    message: string,
    items: model.IVSCodeMessageItem[],
    callback?: () => void,
    cancel?: (...args: any[]) => void,
    ...args: any[]) => void,
  reload: () => void,
  cancel: (
    preset: string,
    value: boolean,
    initValue: boolean,
    global: boolean,
    callback?: () => void) => void,
  handleVSCodeDir: () => void): Thenable<void> {
  return updatePreset(presetText, value, defaultValue, false)
    .then(() => {
      if (autoReload) {
        applyCustomization();
        reload();
        return;
      }

      showCustomizationMessage(
        message,
        [{ title: i18nManager.getMessage(model.LangResourceKeys.reload) },
        { title: i18nManager.getMessage(model.LangResourceKeys.autoReload) },
        { title: i18nManager.getMessage(model.LangResourceKeys.disableDetect) }],
        applyCustomization, cancel, presetText, !value, initValue, false, handleVSCodeDir);
    });
}
