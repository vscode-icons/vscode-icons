import * as fs from 'fs';
import * as path from 'path';
import { IVSIcons, IProjectDetectionResult } from '../models';
import { extensionSettings } from '../settings';
import { messages as msg } from '../messages';

export function detectProject(findFiles: Function, config: IVSIcons): PromiseLike<IProjectDetectionResult> {

  if (config.projectDetection.disableDetect) {
    return Promise.resolve({ isProject: false }) as PromiseLike<IProjectDetectionResult>;
  }

  return findFiles('package.json', '**/node_modules/**', 1)
    .then((res) => {
      if (!res || !res.length) {
        return { isProject: false };
      }

      const project = fs.readFileSync(res[0].fsPath, "utf8");
      const projectJson = (typeof project === "string") ? JSON.parse(project) : null;

      if (!projectJson) {
        return { isProject: false };
      }

      // TODO: Change return logic to support more projects detection
      return this.checkForAngular2Project(projectJson, config.presets.angular) || { isProject: false };
    },
    (rej) => {
      return rej;
    });
}

function checkForAngularProject(projectJson: any, angularPreset: boolean): IProjectDetectionResult {
  const ng = 'ng';
  const presetText = 'angular';
  const ngIconsDisabled = this.iconsDisabled(ng);
  const isNgProject = this.isProject(projectJson, ng);

  // We need to mandatory check the following:
  // 1. The 'preset'
  // 2. The project releated icons are present in the manifest file
  // 3. It's a detectable project
  const enableIcons = (!angularPreset || ngIconsDisabled) && isNgProject;
  const disableIcons = (angularPreset || !ngIconsDisabled) && !isNgProject;

  if (enableIcons || disableIcons) {
    const message = enableIcons ? msg.ngDetected : msg.nonNgDetected;
    return { isProject: true, message, presetText, value: enableIcons || !disableIcons };
  }

  return { isProject: false };
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
      return (projectJson.dependencies && (projectJson.dependencies['@angular/core'] != null)) || false;
    default:
      return false;
  }
}
