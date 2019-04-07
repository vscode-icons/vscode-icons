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
    private configManager: models.IConfigManager,
  ) {
    if (!vscodeManager) {
      throw new ReferenceError(`'vscodeManager' not set to an instance`);
    }
    if (!configManager) {
      throw new ReferenceError(`'configManager' not set to an instance`);
    }
  }

  public detectProjects(
    projects: models.Projects[],
  ): Thenable<models.IProjectDetectionResult> {
    if (!projects || !projects.length) {
      return Promise.resolve(null);
    }
    const promise = this.configManager.vsicons.projectDetection.disableDetect
      ? (Promise.resolve(null) as Thenable<models.IVSCodeUri[]>)
      : this.vscodeManager.workspace.findFiles(
          '**/package.json',
          '**/node_modules/**',
        );
    return promise.then(
      results => this.detect(results, projects),
      error => ErrorHandler.logError(error),
    );
  }

  private detect(
    results: models.IVSCodeUri[],
    projects: models.Projects[],
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
    project: models.Projects,
  ): models.IProjectDetectionResult {
    const _getPresetName = (_project: models.Projects): string => {
      switch (_project) {
        case models.Projects.angular:
          return constants.vsicons.presets.angular;
        case models.Projects.nestjs:
          return constants.vsicons.presets.nestjs;
        default:
          break;
      }
    };

    // We need to check only the 'workspaceValue' ('user' setting should be ignored)
    const preset = this.configManager.getPreset<boolean>(
      _getPresetName(project),
    ).workspaceValue;

    const iconsDisabled: boolean = ManifestReader.iconsDisabled(project);

    // NOTE: User setting (preset) bypasses detection in the following cases:
    // 1. Preset is set to 'false' and icons are not present in the manifest file
    // 2. Preset is set to 'true' and icons are present in the manifest file
    // For this cases PAD will not display a message
    let bypass =
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
      project,
    );
    const enableIcons = iconsDisabled && (!!projectInfo || preset === true);
    const disableIcons = !iconsDisabled && (!projectInfo || preset === false);

    // Don't check for conflicting projects if user setting (preset) is explicitly set
    const conflictingProjects = preset
      ? []
      : this.checkForConflictingProjects(results, project, enableIcons);

    // bypass, if user explicitly has any preset of a conficting project set
    // and those icons are enabled
    bypass = conflictingProjects.some(
      cp =>
        this.configManager.getPreset<boolean>(_getPresetName(cp))
          .workspaceValue && !ManifestReader.iconsDisabled(cp),
    );

    if (bypass || (!enableIcons && !disableIcons)) {
      return { apply: false };
    }

    const langResourceKey: models.LangResourceKeys = conflictingProjects.length
      ? models.LangResourceKeys.conflictProjectsDetected
      : this.getDetectionLanguageResourseKey(project, enableIcons, preset);

    return {
      apply: true,
      project,
      conflictingProjects,
      langResourceKey,
      value: enableIcons || !disableIcons,
    };
  }

  private checkForConflictingProjects(
    results: models.IVSCodeUri[],
    project: models.Projects,
    enableIcons: boolean,
  ): models.Projects[] {
    if (!enableIcons) {
      return [];
    }
    const conflictingProjects = (conflictProjects: models.Projects[]) =>
      conflictProjects.filter(
        (cp: models.Projects) => this.getProjectInfo(results, cp) !== null,
      );

    switch (project) {
      case models.Projects.nestjs:
        return conflictingProjects([models.Projects.angular]);
      case models.Projects.angular:
        return conflictingProjects([models.Projects.nestjs]);
      default:
        return [];
    }
  }

  private getDetectionLanguageResourseKey(
    project: models.Projects,
    enableIcons: boolean,
    preset: boolean,
  ): models.LangResourceKeys {
    switch (project) {
      case models.Projects.angular:
        return this.getNgRelatedMessages(enableIcons, preset);
      case models.Projects.nestjs:
        return this.getNestRelatedMessages(enableIcons, preset);
    }
  }

  private getNgRelatedMessages(enableIcons: boolean, preset: boolean) {
    return enableIcons
      ? preset === true
        ? models.LangResourceKeys.nonNgDetectedPresetTrue
        : models.LangResourceKeys.ngDetected
      : preset === false
      ? models.LangResourceKeys.ngDetectedPresetFalse
      : models.LangResourceKeys.nonNgDetected;
  }

  private getNestRelatedMessages(enableIcons: boolean, preset: boolean) {
    return enableIcons
      ? preset === true
        ? models.LangResourceKeys.nonNestDetectedPresetTrue
        : models.LangResourceKeys.nestDetected
      : preset === false
      ? models.LangResourceKeys.nestDetectedPresetFalse
      : models.LangResourceKeys.nonNestDetected;
  }

  private getProjectInfo(
    results: models.IVSCodeUri[],
    project: models.Projects,
  ): models.IProjectInfo {
    let projectInfo: models.IProjectInfo = null;
    for (const result of results) {
      const content: string = readFileSync(result.fsPath, 'utf8');
      const projectJson: { [key: string]: any } = Utils.parseJSON(content);
      projectInfo = this.getInfo(projectJson, project);
      if (!!projectInfo) {
        break;
      }
    }
    return projectInfo;
  }

  private getInfo(
    projectJson: { [key: string]: any },
    name: models.Projects,
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
      case models.Projects.nestjs:
        return _getInfo('@nestjs/core');
      default:
        return null;
    }
  }
}
