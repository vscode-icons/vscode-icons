import * as fs from 'fs';
import * as path from 'path';
import * as models from '../models';
import { extensionSettings } from '../settings';
import { parseJSON } from '../utils';
import { LanguageResourceManager } from '../i18n';
import { IIconSchema } from '../models/iconSchema/iconSchema';

export function detectProject(
  findFiles: (
    include: string,
    exclude: string,
    maxResults?: number,
    token?: models.IVSCodeCancellationToken) => Thenable<models.IVSCodeUri[]>,
  config: models.IVSIcons): PromiseLike<models.IVSCodeUri[]> {
  if (config.projectDetection.disableDetect) {
    return Promise.resolve([]) as PromiseLike<models.IVSCodeUri[]>;
  }

  return findFiles('**/package.json', '**/node_modules/**')
    .then(results => results, rej => [rej]);
}

export function checkForAngularProject(
  angularPreset: boolean,
  ngIconsDisabled: boolean,
  isNgProject: boolean,
  i18nManager: LanguageResourceManager): models.IProjectDetectionResult {

  // We need to mandatory check the following:
  // 1. The 'preset'
  // 2. The project releated icons are present in the manifest file
  // 3. It's a detectable project
  const enableIcons = (!angularPreset || ngIconsDisabled) && isNgProject;
  const disableIcons = (angularPreset || !ngIconsDisabled) && !isNgProject;

  if (enableIcons || disableIcons) {
    const langResourceKey = enableIcons
      ? models.LangResourceKeys.ngDetected
      : models.LangResourceKeys.nonNgDetected;
    const message = i18nManager.getMessage(langResourceKey);

    return { apply: true, message, value: enableIcons || !disableIcons };
  }

  return { apply: false };
}

export function iconsDisabled(name: string, isFile = true): boolean {
  const iconManifest = getIconManifest();
  const iconsJson = iconManifest && parseJSON(iconManifest) as IIconSchema;
  return !iconsJson || !Reflect.ownKeys(iconsJson.iconDefinitions)
    .filter((key) => key.toString().startsWith(`_${isFile ? 'f' : 'fd'}_${name}`)).length;
}

export function folderIconsDisabled(func: (iconsJson: IIconSchema) => boolean): boolean {
  const iconManifest = getIconManifest();
  const iconsJson = iconManifest && parseJSON(iconManifest) as IIconSchema;
  return !iconsJson || !func(iconsJson);
}

function getIconManifest(): string {
  const manifestFilePath = path.join(__dirname, '..', extensionSettings.iconJsonFileName);
  try {
    return fs.readFileSync(manifestFilePath, 'utf8');
  } catch (err) {
    console.error(err);
    return null;
  }
}

export function isProject(projectJson: any, name: string): boolean {
  switch (name) {
    case 'ng':
      return (projectJson.dependencies && (projectJson.dependencies['@angular/core'] != null)) ||
        (projectJson.devDependencies && (projectJson.devDependencies['@angular/core'] != null)) ||
        false;
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
    items: models.IVSCodeMessageItem[],
    callback?: () => void,
    cancel?: (...args: any[]) => void,
    ...args: any[]) => void,
  reload: () => void,
  cancel: (
    preset: string,
    value: boolean,
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
        [{ title: i18nManager.getMessage(models.LangResourceKeys.reload) },
        { title: i18nManager.getMessage(models.LangResourceKeys.autoReload) },
        { title: i18nManager.getMessage(models.LangResourceKeys.disableDetect) }],
        applyCustomization, cancel, presetText, !value, initValue, false, handleVSCodeDir);
    });
}
