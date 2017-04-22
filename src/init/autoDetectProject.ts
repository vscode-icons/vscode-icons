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
  ngIconsDisabled: boolean,
  isNgProject: boolean,
  i18nManager: LanguageResourceManager): models.IProjectDetectionResult {

  // NOTE: We don't rely on the angular preset as it can be manipulated and produce false states
  // We need to mandatory check the following:
  // 1. The project related icons are present in the manifest file
  // 2. It's a detectable project
  const enableIcons = ngIconsDisabled && isNgProject;
  const disableIcons = !ngIconsDisabled && !isNgProject;

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
  autoReload: boolean,
  applyCustomizationFn: () => void,
  showCustomizationMessageFn: (
    message: string,
    items: models.IVSCodeMessageItem[],
    cb?: () => void,
    ...args: any[]) => void,
  reloadFn: () => void): Thenable<void> {
  return new Promise<void>((resolve) => {
    if (autoReload) {
      applyCustomizationFn();
      reloadFn();
    } else {
      showCustomizationMessageFn(
        message,
        [{ title: i18nManager.getMessage(models.LangResourceKeys.reload) },
        { title: i18nManager.getMessage(models.LangResourceKeys.autoReload) },
        { title: i18nManager.getMessage(models.LangResourceKeys.disableDetect) }],
        applyCustomizationFn, presetText, value, false);
    }
    resolve();
  });
}
