import * as fs from 'fs';
import * as models from '../models';
import { parseJSON } from '../utils';
import { LanguageResourceManager } from '../i18n';

export class ProjectAutoDetection {
  public static detectProject(
    findFilesFn: (
      include: string,
      exclude: string,
      maxResults?: number,
      token?: models.IVSCodeCancellationToken) => Thenable<models.IVSCodeUri[]>,
    config: models.IVSIcons): PromiseLike<models.IVSCodeUri[]> {
    if (config.projectDetection.disableDetect) {
      return Promise.resolve(null) as PromiseLike<models.IVSCodeUri[]>;
    }

    return findFilesFn('**/package.json', '**/node_modules/**');
  }

  public static checkForAngularProject(
    preset: boolean,
    ngIconsDisabled: boolean,
    isNgProject: boolean,
    i18nManager: LanguageResourceManager): models.IProjectDetectionResult {

    // NOTE: User setting (preset) bypasses detection in the following cases:
    // 1. Preset is set to 'false' and icons are not present in the manifest file
    // 2. Preset is set to 'true' and icons are present in the manifest file
    // For this cases PAD will not display a message

    const bypass = (preset != null) && ((!preset && ngIconsDisabled) || (preset && !ngIconsDisabled));

    // We need to mandatory check the following:
    // 1. The project related icons are present in the manifest file
    // 2. It's a detectable project
    // 3. The preset (when it's defined)

    const enableIcons = ngIconsDisabled && (isNgProject || (preset === true));
    const disableIcons = !ngIconsDisabled && (!isNgProject || (preset === false));

    if (bypass || (!enableIcons && !disableIcons)) {
      return { apply: false };
    }

    const langResourceKey = enableIcons
      ? models.LangResourceKeys.ngDetected
      : models.LangResourceKeys.nonNgDetected;
    const message = i18nManager.getMessage(langResourceKey);

    return { apply: true, message, value: enableIcons || !disableIcons };
  }

  public static getProjectInfo(results: models.IVSCodeUri[], name: models.Projects): models.IProjectInfo {
    let projectInfo: models.IProjectInfo = null;
    results.some(result => {
      const content = fs.readFileSync(result.fsPath, 'utf8');
      const projectJson = parseJSON(content);
      projectInfo = this.getInfo(projectJson, name);
      return !!projectInfo;
    });
    return projectInfo;
  }

  public static applyDetection(
    i18nManager: LanguageResourceManager,
    projectDetectionResult: models.IProjectDetectionResult,
    autoReload: boolean,
    applyCustomizationFn: (projectDetectionResult?: models.IProjectDetectionResult) => void,
    showCustomizationMessageFn: (
      message: string,
      items: models.IVSCodeMessageItem[],
      callback?: (...args: any[]) => void,
      ...args: any[]) => void,
    reloadFn: () => void): Thenable<void> {
    return new Promise<void>(resolve => {
      if (autoReload) {
        applyCustomizationFn(projectDetectionResult);
        reloadFn();
      } else {
        showCustomizationMessageFn(
          projectDetectionResult.message,
          [{ title: i18nManager.getMessage(models.LangResourceKeys.reload) },
          { title: i18nManager.getMessage(models.LangResourceKeys.autoReload) },
          { title: i18nManager.getMessage(models.LangResourceKeys.disableDetect) }],
          applyCustomizationFn, projectDetectionResult);
      }
      resolve();
    });
  }

  public static getInfo(projectJson: any, name: models.Projects): models.IProjectInfo {
    if (!projectJson) { return null; }

    const getInfoFn = (key: string): models.IProjectInfo => {
      const depExists = projectJson.dependencies && !!projectJson.dependencies[key];
      if (depExists) {
        return { name, version: projectJson.dependencies[key] };
      }
      const devDepExists = projectJson.devDependencies && !!projectJson.devDependencies[key];
      if (devDepExists) {
        return { name, version: projectJson.devDependencies[key] };
      }
      return null;
    };

    switch (name) {
      case models.Projects.angular:
        return getInfoFn('@angular/core');
      default:
        return null;
    }
  }
}
