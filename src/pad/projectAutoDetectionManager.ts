import type * as types from '../types';
import type { PackageManifest } from '../types/package';

import { basename } from 'path';

import { isEmpty } from 'lodash';

import { ErrorHandler } from '../common/errorHandler';
import { readFileAsync } from '../common/fsAsync';
import { constants } from '../constants';
import { ManifestReader } from '../iconsManifest';
import { extensions } from '../iconsManifest/supportedExtensions';
import * as enums from '../types/enums';
import { Utils } from '../utils';

export class ProjectAutoDetectionManager
  implements types.ProjectAutoDetectionManagerContract
{
  constructor(
    private vscodeManager: types.VSCodeManagerContract,
    private configManager: types.ConfigManagerContract,
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
  ): Promise<types.ProjectDetectionResult[]> {
    if (!projects || !projects.length) {
      return [];
    }

    try {
      if (this.configManager.vsicons.projectDetection.disableDetect) {
        return [];
      }
      const projectsToSearch: enums.Projects[] = [
        ...new Set(
          projects.flatMap((project: enums.Projects): enums.Projects[] => [
            project,
            ...this.getConflictingProjects(project),
          ]),
        ),
      ];
      const projectConfigFiles: string[] = projectsToSearch.flatMap(
        (project: enums.Projects): string[] => this.getConfigFilesOf(project),
      );
      const filesToInclude: string = [
        'package.json',
        ...projectConfigFiles,
      ].join(',');
      const results: types.VSCodeUri[] =
        await this.vscodeManager.workspace.findFiles(
          `**/{${filesToInclude}}`,
          '**/node_modules/**',
        );
      return this.detect(results, projects);
    } catch (error: unknown) {
      ErrorHandler.logError(error);
    }
  }

  private async detect(
    results: types.VSCodeUri[],
    projects: enums.Projects[],
  ): Promise<types.ProjectDetectionResult[]> {
    const detectionResults: types.ProjectDetectionResult[] = [];
    if (!results || !results.length) {
      return detectionResults;
    }
    for (const project of projects) {
      const detectionResult: types.ProjectDetectionResult =
        await this.checkForProject(results, project);
      detectionResults.push(detectionResult);
    }
    return detectionResults;
  }

  private async checkForProject(
    results: types.VSCodeUri[],
    project: enums.Projects,
  ): Promise<types.ProjectDetectionResult> {
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
    const getPreset = (proj: enums.Projects): boolean | undefined =>
      this.configManager.getPreset<boolean>(getPresetName(proj))
        ?.workspaceValue;

    const iconsDisabled: boolean = await ManifestReader.iconsDisabled(project);

    // NOTE: User setting (preset) bypasses detection in the following cases:
    // 1. Preset is set to 'false' and icons are not present in the manifest file
    // 2. Preset is set to 'true' and icons are present in the manifest file
    // For this cases PAD will not display a message
    const preset: boolean | undefined = getPreset(project);
    let bypass =
      preset !== undefined &&
      ((!preset && iconsDisabled) || (preset && !iconsDisabled));

    if (bypass) {
      return { apply: false };
    }

    // We need to mandatory check the following:
    // 1. The project related icons are present in the manifest file
    // 2. It's a detectable project
    // 3. The preset (when it's defined)
    // Use case: User has the preset set but project detection does not detect that project
    const projectInfo: types.ProjectInfo = await this.getProjectInfo(
      results,
      project,
    );
    const hasProjectInfo = !isEmpty(projectInfo);
    const enableIcons = iconsDisabled && (hasProjectInfo || preset === true);
    const disableIcons =
      !iconsDisabled && (!hasProjectInfo || preset === false);

    const conflictingProjects: enums.Projects[] =
      preset || !hasProjectInfo
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
    results: types.VSCodeUri[],
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
      for (const conflictProject of conflictProjects) {
        const info: types.ProjectInfo = await this.getProjectInfo(
          results,
          conflictProject,
        );
        if (!isEmpty(info)) {
          projectInfos.push(conflictProject);
        }
      }
      return projectInfos;
    };

    return conflictingProjects(this.getConflictingProjects(project));
  }

  private getConflictingProjects(project: enums.Projects): enums.Projects[] {
    switch (project) {
      case enums.Projects.nestjs:
        return [enums.Projects.angular];
      case enums.Projects.angular:
        return [enums.Projects.nestjs];
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
    results: types.VSCodeUri[],
    project: enums.Projects,
  ): Promise<types.ProjectInfo> {
    for (const result of results) {
      if (this.isConfigFileOf(project, result.fsPath)) {
        return { name: project };
      }
      if (!result.fsPath.endsWith('package.json')) {
        continue;
      }
      const content: string = await readFileAsync(result.fsPath, 'utf8');
      const projectJson: PackageManifest =
        Utils.parseJSONSafe<PackageManifest>(content);
      const projectInfo = this.getInfo(projectJson, project);
      if (!isEmpty(projectInfo)) {
        return projectInfo;
      }
    }
    return {};
  }

  private getConfigFilesOf(project: enums.Projects): string[] {
    // convert project enum to project key string
    const projectKey: string = Object.keys(enums.Projects).find(
      (key: string): boolean => enums.Projects[key] === project,
    );
    return (
      extensions.supported.find(
        (ext: types.FileExtension): boolean => ext.icon === projectKey,
      )?.extensions ?? []
    );
  }

  private isConfigFileOf(project: enums.Projects, filePath: string): boolean {
    return this.getConfigFilesOf(project).some(
      (configFile: string): boolean => basename(filePath) === configFile,
    );
  }

  private getInfo(
    projectJson: PackageManifest,
    name: enums.Projects,
  ): types.ProjectInfo {
    if (!projectJson) {
      return {};
    }

    const getInfo = (key: string): types.ProjectInfo => {
      if (projectJson.dependencies && !!projectJson.dependencies[key]) {
        return { name, version: projectJson.dependencies[key] };
      }
      if (projectJson.devDependencies && !!projectJson.devDependencies[key]) {
        return { name, version: projectJson.devDependencies[key] };
      }
      return {};
    };

    switch (name) {
      case enums.Projects.angular:
        return getInfo('@angular/core');
      case enums.Projects.nestjs:
        return getInfo('@nestjs/core');
      default:
        return {};
    }
  }
}
