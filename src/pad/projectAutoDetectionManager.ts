import { readFileSync } from 'fs';
import * as models from '../models';
import { Utils } from '../utils';
import { ManifestReader } from '../iconsManifest';
import { ErrorHandler } from '../errorHandler';
import { constants } from '../constants';

export class ProjectAutoDetectionManager
  implements models.IProjectAutoDetectionManager {
  constructor(
    private vscodeManager: models.IVSCodeManager,
    private configManager: models.IConfigManager
  ) {
    if (!vscodeManager) {
      throw new ReferenceError(`'vscodeManager' not set to an instance`);
    }
    if (!configManager) {
      throw new ReferenceError(`'configManager' not set to an instance`);
    }
  }

  public detectProjects(
    projects: models.Projects[]
  ): Thenable<models.IProjectDetectionResult> {
    if (!projects || !projects.length) {
      return Promise.resolve(null);
    }
    const promise = this.configManager.vsicons.projectDetection.disableDetect
      ? (Promise.resolve(null) as Thenable<models.IVSCodeUri[]>)
      : this.vscodeManager.workspace.findFiles(
          '**/package.json',
          '**/node_modules/**'
        );
    return promise.then(
      results => this.detect(results, projects),
      error => ErrorHandler.logError(error)
    );
  }

  private detect(
    results: models.IVSCodeUri[],
    projects: models.Projects[]
  ): models.IProjectDetectionResult {
    if (!results || !results.length) {
      return;
    }
    let detectionResult: models.IProjectDetectionResult;
    for (const project of projects) {
      detectionResult = this.checkForProject(results, project);
      if (detectionResult.apply) {
        break;
      }
    }
    return detectionResult;
  }

  private checkForProject(
    results: models.IVSCodeUri[],
    project: models.Projects
  ): models.IProjectDetectionResult {
    let presetName: string;
    switch (project) {
      case models.Projects.angular:
        presetName = constants.vsicons.presets.angular;
      default:
        break;
    }

    // NOTE: User setting (preset) bypasses detection in the following cases:
    // 1. Preset is set to 'false' and icons are not present in the manifest file
    // 2. Preset is set to 'true' and icons are present in the manifest file
    // For this cases PAD will not display a message
    // We need to check only the 'workspaceValue' ('user' setting should be ignored)
    const iconsDisabled: boolean = ManifestReader.iconsDisabled(project);
    const preset = this.configManager.getPreset<boolean>(presetName)
      .workspaceValue;
    const bypass =
      preset != null &&
      ((!preset && iconsDisabled) || (preset && !iconsDisabled));

    if (bypass) {
      return { apply: false };
    }

    // We need to mandatory check the following:
    // 1. The project related icons are present in the manifest file
    // 2. It's a detectable project
    // 3. The preset (when it's defined)

    // Use case: User has the preset set but project detection does not detect that project
    const projectInfo: models.IProjectInfo = this.getProjectInfo(
      results,
      project
    );
    const enableIcons = iconsDisabled && (!!projectInfo || preset === true);
    const disableIcons = !iconsDisabled && (!projectInfo || preset === false);

    if (!enableIcons && !disableIcons) {
      return { apply: false };
    }

    const langResourceKey: models.LangResourceKeys = enableIcons
      ? projectInfo
        ? models.LangResourceKeys.ngDetected
        : models.LangResourceKeys.nonNgDetectedPresetTrue
      : projectInfo
        ? models.LangResourceKeys.nonNgDetected
        : models.LangResourceKeys.ngDetectedPresetFalse;

    return {
      apply: true,
      projectName: project,
      langResourceKey,
      value: enableIcons || !disableIcons,
    };
  }

  private getProjectInfo(
    results: models.IVSCodeUri[],
    project: models.Projects
  ): models.IProjectInfo {
    let projectInfo: models.IProjectInfo = null;
    results.some(result => {
      const content: string = readFileSync(result.fsPath, 'utf8');
      const projectJson: { [key: string]: any } = Utils.parseJSON(content);
      projectInfo = this.getInfo(projectJson, project);
      return !!projectInfo;
    });
    return projectInfo;
  }

  private getInfo(
    projectJson: { [key: string]: any },
    name: models.Projects
  ): models.IProjectInfo {
    if (!projectJson) {
      return null;
    }

    const _getInfo = (key: string): models.IProjectInfo => {
      if (projectJson.dependencies && !!projectJson.dependencies[key]) {
        return { name, version: projectJson.dependencies[key] };
      }
      if (projectJson.devDependencies && !!projectJson.devDependencies[key]) {
        return { name, version: projectJson.devDependencies[key] };
      }
      return null;
    };

    switch (name) {
      case models.Projects.angular:
        return _getInfo('@angular/core');
      default:
        return null;
    }
  }
}
