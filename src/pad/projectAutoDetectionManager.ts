import type * as types from '../types';
import type { IPackageManifest } from '../types/package';

import { ErrorHandler } from '../common/errorHandler';
import { readFileAsync } from '../common/fsAsync';
import { constants } from '../constants';
import { ManifestReader } from '../iconsManifest';
import * as enums from '../types/enums';
import { Utils } from '../utils';

export class ProjectAutoDetectionManager
  implements types.IProjectAutoDetectionManager
{
  constructor(
    private vscodeManager: types.IVSCodeManager,
    private configManager: types.IConfigManager,
  ) {
    if (!vscodeManager) {
      throw new ReferenceError(`'vscodeManager' not set to an instance`);
    }
    if (!configManager) {
      throw new ReferenceError(`'configManager' not set to an instance`);
    }
  }

  public async detectProjects(
    projects: enums.Projects[],
  ): Promise<types.IProjectDetectionResult[]> {
    if (!projects || !projects.length) {
      return null;
    }

    try {
      const results = (await (this.configManager.vsicons.projectDetection
        .disableDetect
        ? Promise.resolve(null)
        : this.findProjectFiles(
            '**/node_modules/**',
          ))) as types.IVSCodeUri[];
      return this.detect(results, projects);
    } catch (error: unknown) {
      ErrorHandler.logError(error);
    }
  }

  private async detect(
    results: types.IVSCodeUri[],
    projects: enums.Projects[],
  ): Promise<types.IProjectDetectionResult[]> {
    const detectionResults: types.IProjectDetectionResult[] = [];
    if (!results || !results.length) {
      return detectionResults;
    }
    for (const project of projects) {
      const detectionResult: types.IProjectDetectionResult =
        await this.checkForProject(results, project);
      detectionResults.push(detectionResult);
    }
    return detectionResults;
  }

  private async checkForProject(
    results: types.IVSCodeUri[],
    project: enums.Projects,
  ): Promise<types.IProjectDetectionResult> {
    const getPresetName = (_project: enums.Projects): string => {
      switch (_project) {
        case enums.Projects.angular:
          return constants.vsicons.presets.angular;
        case enums.Projects.nestjs:
          return constants.vsicons.presets.nestjs;
        default:
          break;
      }
    };

    // We need to check only the 'workspaceValue' ('user' setting should be ignored)
    const getPreset = (proj: enums.Projects): boolean =>
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
    const projectInfo: types.IProjectInfo = await this.getProjectInfo(
      results,
      project,
    );
    const enableIcons = iconsDisabled && (!!projectInfo || preset === true);
    const disableIcons = !iconsDisabled && (!projectInfo || preset === false);

    // Don't check for conflicting projects if user setting (preset) is explicitly set
    const conflictingProjects: enums.Projects[] = preset
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

    const langResourceKey: enums.LangResourceKeys = conflictingProjects.length
      ? enums.LangResourceKeys.conflictProjectsDetected
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
    results: types.IVSCodeUri[],
    project: enums.Projects,
    enableIcons: boolean,
  ): Promise<enums.Projects[]> {
    if (!enableIcons) {
      return [];
    }
    const conflictingProjects = async (
      conflictProjects: enums.Projects[],
    ): Promise<enums.Projects[]> => {
      const projectInfos: enums.Projects[] = [];
      for (const cp of conflictProjects) {
        const info = await this.getProjectInfo(results, cp);
        if (info) {
          projectInfos.push(cp);
        }
      }
      return projectInfos;
    };

    switch (project) {
      case enums.Projects.nestjs:
        return conflictingProjects([enums.Projects.angular]);
      case enums.Projects.angular:
        return conflictingProjects([enums.Projects.nestjs]);
      default:
        return [];
    }
  }

  private getDetectionLanguageResourseKey(
    project: enums.Projects,
    enableIcons: boolean,
    preset: boolean,
  ): enums.LangResourceKeys {
    switch (project) {
      case enums.Projects.angular:
        return this.getNgRelatedMessages(enableIcons, preset);
      case enums.Projects.nestjs:
        return this.getNestRelatedMessages(enableIcons, preset);
    }
  }

  private getNgRelatedMessages(enableIcons: boolean, preset: boolean): number {
    return enableIcons
      ? preset === true
        ? enums.LangResourceKeys.nonNgDetectedPresetTrue
        : enums.LangResourceKeys.ngDetected
      : preset === false
        ? enums.LangResourceKeys.ngDetectedPresetFalse
        : enums.LangResourceKeys.nonNgDetected;
  }

  private getNestRelatedMessages(
    enableIcons: boolean,
    preset: boolean,
  ): number {
    return enableIcons
      ? preset === true
        ? enums.LangResourceKeys.nonNestDetectedPresetTrue
        : enums.LangResourceKeys.nestDetected
      : preset === false
        ? enums.LangResourceKeys.nestDetectedPresetFalse
        : enums.LangResourceKeys.nonNestDetected;
  }

  private async getProjectInfo(
    results: types.IVSCodeUri[],
    project: enums.Projects,
  ): Promise<types.IProjectInfo> {
    let projectInfo: types.IProjectInfo = null;
    for (const result of results) {
      const fileName = result.fsPath.split(/[\\/]/).pop();
      if (
        project === enums.Projects.nestjs &&
        this.isNestProjectFile(fileName)
      ) {
        projectInfo = { name: project, version: '' };
        break;
      }
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

  private async findProjectFiles(
    exclude: string,
  ): Promise<types.IVSCodeUri[]> {
    const patterns = [
      '**/package.json',
      '**/nest-cli.json',
      '**/.nest-cli.json',
      '**/nestconfig.json',
      '**/.nestconfig.json',
    ];
    const results = await Promise.all(
      patterns.map(pattern =>
        this.vscodeManager.workspace.findFiles(pattern, exclude),
      ),
    );
    return results.flat();
  }

  private isNestProjectFile(fileName: string): boolean {
    return [
      'nest-cli.json',
      '.nest-cli.json',
      'nestconfig.json',
      '.nestconfig.json',
    ].includes(fileName);
  }

  private getInfo(
    projectJson: IPackageManifest,
    name: enums.Projects,
  ): types.IProjectInfo {
    if (!projectJson) {
      return null;
    }

    const getInfo = (key: string): types.IProjectInfo => {
      if (projectJson.dependencies && !!projectJson.dependencies[key]) {
        return { name, version: projectJson.dependencies[key] };
      }
      if (projectJson.devDependencies && !!projectJson.devDependencies[key]) {
        return { name, version: projectJson.devDependencies[key] };
      }
      return null;
    };

    switch (name) {
      case enums.Projects.angular:
        return getInfo('@angular/core');
      case enums.Projects.nestjs:
        return getInfo('@nestjs/core');
      default:
        return null;
    }
  }
}
