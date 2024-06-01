import { ErrorHandler } from '../common/errorHandler';
import { readFileAsync } from '../common/fsAsync';
import { constants } from '../constants';
import { ManifestReader } from '../iconsManifest';
import * as models from '../models';
import { IPackageManifest } from '../models/packageManifest';
import { Utils } from '../utils';

export class ProjectAutoDetectionManager
  implements models.IProjectAutoDetectionManager
{
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

  public async detectProjects(
    projects: models.Projects[],
  ): Promise<models.IProjectDetectionResult[]> {
    if (!projects || !projects.length) {
      return null;
    }

    try {
      const results = (await (this.configManager.vsicons.projectDetection
        .disableDetect
        ? Promise.resolve(null)
        : this.vscodeManager.workspace.findFiles(
            '**/package.json',
            '**/node_modules/**',
          ))) as models.IVSCodeUri[];
      return this.detect(results, projects);
    } catch (error: unknown) {
      ErrorHandler.logError(error);
    }
  }

  private async detect(
    results: models.IVSCodeUri[],
    projects: models.Projects[],
  ): Promise<models.IProjectDetectionResult[]> {
    const detectionResults: models.IProjectDetectionResult[] = [];
    if (!results || !results.length) {
      return detectionResults;
    }
    for (const project of projects) {
      const detectionResult: models.IProjectDetectionResult =
        await this.checkForProject(results, project);
      detectionResults.push(detectionResult);
    }
    return detectionResults;
  }

  private async checkForProject(
    results: models.IVSCodeUri[],
    project: models.Projects,
  ): Promise<models.IProjectDetectionResult> {
    const getPresetName = (_project: models.Projects): string => {
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
    const getPreset = (proj: models.Projects): boolean =>
      this.configManager.getPreset<boolean>(getPresetName(proj)).workspaceValue;

    const iconsDisabled: boolean = await ManifestReader.iconsDisabled(project);

    // NOTE: User setting (preset) bypasses detection in the following cases:
    // 1. Preset is set to 'false' and icons are not present in the manifest file
    // 2. Preset is set to 'true' and icons are present in the manifest file
    // For this cases PAD will not display a message
    const preset = getPreset(project);
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
    const projectInfo: models.IProjectInfo = await this.getProjectInfo(
      results,
      project,
    );
    const enableIcons = iconsDisabled && (!!projectInfo || preset === true);
    const disableIcons = !iconsDisabled && (!projectInfo || preset === false);

    // Don't check for conflicting projects if user setting (preset) is explicitly set
    const conflictingProjects: models.Projects[] = preset
      ? []
      : await this.checkForConflictingProjects(results, project, enableIcons);

    // bypass, if user explicitly has any preset of a conficting project set
    // and those icons are enabled
    for (const cp of conflictingProjects) {
      bypass = getPreset(cp);
      if (bypass) {
        break;
      }
    }

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

  private async checkForConflictingProjects(
    results: models.IVSCodeUri[],
    project: models.Projects,
    enableIcons: boolean,
  ): Promise<models.Projects[]> {
    if (!enableIcons) {
      return [];
    }
    const conflictingProjects = async (
      conflictProjects: models.Projects[],
    ): Promise<models.Projects[]> => {
      const projectInfos: models.Projects[] = [];
      for (const cp of conflictProjects) {
        const info = await this.getProjectInfo(results, cp);
        if (info) {
          projectInfos.push(cp);
        }
      }
      return projectInfos;
    };

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

  private getNgRelatedMessages(enableIcons: boolean, preset: boolean): number {
    return enableIcons
      ? preset === true
        ? models.LangResourceKeys.nonNgDetectedPresetTrue
        : models.LangResourceKeys.ngDetected
      : preset === false
        ? models.LangResourceKeys.ngDetectedPresetFalse
        : models.LangResourceKeys.nonNgDetected;
  }

  private getNestRelatedMessages(
    enableIcons: boolean,
    preset: boolean,
  ): number {
    return enableIcons
      ? preset === true
        ? models.LangResourceKeys.nonNestDetectedPresetTrue
        : models.LangResourceKeys.nestDetected
      : preset === false
        ? models.LangResourceKeys.nestDetectedPresetFalse
        : models.LangResourceKeys.nonNestDetected;
  }

  private async getProjectInfo(
    results: models.IVSCodeUri[],
    project: models.Projects,
  ): Promise<models.IProjectInfo> {
    let projectInfo: models.IProjectInfo = null;
    for (const result of results) {
      const content: string = await readFileAsync(result.fsPath, 'utf8');
      const projectJson: IPackageManifest =
        Utils.parseJSONSafe<IPackageManifest>(content);
      projectInfo = this.getInfo(projectJson, project);
      if (projectInfo) {
        break;
      }
    }
    return projectInfo;
  }

  private getInfo(
    projectJson: IPackageManifest,
    name: models.Projects,
  ): models.IProjectInfo {
    if (!projectJson) {
      return null;
    }

    const getInfo = (key: string): models.IProjectInfo => {
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
        return getInfo('@angular/core');
      case models.Projects.nestjs:
        return getInfo('@nestjs/core');
      default:
        return null;
    }
  }
}
