import type * as types from '../types';

import { cloneDeep, remove } from 'lodash';

import { ManifestReader } from './manifestReader';
import * as enums from '../types/enums';

export class CustomsMerger {
  public static async merge(
    customFiles: types.FileCollection,
    extFiles: types.FileCollection,
    customFolders: types.FolderCollection,
    extFolders: types.FolderCollection,
    presets: types.Presets,
    projectDetectionResults?: types.ProjectDetectionResult[],
    affectedPresets?: types.Presets,
  ): Promise<types.MergedCollection> {
    const projectPresets = await this.getProjectPresets(
      [enums.PresetNames.angular, enums.PresetNames.nestjs],
      presets,
      projectDetectionResults,
      affectedPresets,
    );

    let files: types.FileCollection = this.toggleProjectPreset(
      projectPresets,
      extFiles,
    );

    files = this.toggleOfficialIconsPreset(
      !presets.jsOfficial,
      files,
      [enums.IconNames.jsOfficial],
      [enums.IconNames.js],
    );

    files = this.toggleOfficialIconsPreset(
      !presets.tsOfficial,
      files,
      [
        enums.IconNames.tsOfficial,
        enums.IconNames.tsConfigOfficial,
        enums.IconNames.tsDefOfficial,
      ],
      [enums.IconNames.ts, enums.IconNames.tsConfig, enums.IconNames.tsDef],
    );

    files = this.toggleOfficialIconsPreset(
      !presets.jsonOfficial,
      files,
      [enums.IconNames.jsonOfficial],
      [enums.IconNames.json],
    );

    files = this.toggleOfficialIconsPreset(
      !presets.yamlOfficial,
      files,
      [enums.IconNames.yamlOfficial],
      [enums.IconNames.yaml],
    );

    let folders: types.FolderCollection =
      this.toggleFoldersAllDefaultIconPreset(
        presets.foldersAllDefaultIcon,
        extFolders,
        extFolders,
      );
    folders = this.toggleHideFoldersPreset(presets.hideFolders, folders);

    return this.mergeCustoms(
      customFiles || { default: {}, supported: [] },
      files,
      customFolders || { default: {}, supported: [] },
      folders,
    );
  }

  private static async getProjectPresets(
    presetNames: enums.PresetNames[],
    presets: types.Presets,
    projectDetectionResults?: types.ProjectDetectionResult[],
    affectedPresets?: types.Presets,
  ): Promise<Array<Record<string, boolean>>> {
    const projectPresets: Array<Record<string, boolean>> = [];
    for (const presetName of presetNames) {
      const name: string = enums.PresetNames[presetName];
      const project: string = enums.Projects[name] as string;
      const projectDetectionResult: types.ProjectDetectionResult | undefined = (
        (Array.isArray(projectDetectionResults) && projectDetectionResults) ||
        []
      ).find(
        (pdr: types.ProjectDetectionResult): boolean =>
          pdr.project?.toString() === project,
      );
      const preset: boolean = await this.getPreset(
        name,
        project,
        presets,
        projectDetectionResult,
        affectedPresets,
      );
      projectPresets.push({ [presetName]: !preset });
    }
    return projectPresets;
  }

  private static async getPreset(
    name: string,
    project: string,
    presets: types.Presets,
    projectDetectionResult?: types.ProjectDetectionResult,
    affectedPresets?: types.Presets,
  ): Promise<boolean> {
    const hasProjectDetectionResult: boolean =
      !!projectDetectionResult &&
      typeof projectDetectionResult === 'object' &&
      'value' in projectDetectionResult;
    return hasProjectDetectionResult &&
      projectDetectionResult.project.toString() === project
      ? projectDetectionResult.value
      : (presets[name] as boolean) ||
          (!!affectedPresets &&
            !affectedPresets[name] &&
            !(await ManifestReader.iconsDisabled(project)));
  }

  private static toggleProjectPreset(
    projectPresets: Array<Record<string, boolean>>,
    files: types.FileCollection,
  ): types.FileCollection {
    let updatedFiles = files;
    for (const preset of projectPresets) {
      const key: string = Object.keys(preset)[0];
      const disable: boolean = preset[key];
      const regex = new RegExp(
        `^${enums.IconNames[enums.PresetNames[key] as keyof typeof enums.IconNames]}_.*\\D$`,
      );
      const icons = updatedFiles.supported
        .filter((file: types.FileExtension): boolean => regex.test(file.icon))
        .map((file: types.FileExtension): string => file.icon);
      const defaultIcons = files.supported
        .filter((file: types.FileExtension): boolean => regex.test(file.icon))
        .map((file: types.FileExtension): string => file.icon);
      const temp = this.togglePreset(disable, icons, updatedFiles);
      updatedFiles = this.togglePreset(disable, defaultIcons, temp);
    }
    return updatedFiles;
  }

  private static toggleOfficialIconsPreset(
    disable: boolean,
    customFiles: types.FileCollection,
    officialIcons: string[],
    defaultIcons: string[],
  ): types.FileCollection {
    const temp = this.togglePreset(disable, officialIcons, customFiles);
    return this.togglePreset(!disable, defaultIcons, temp);
  }

  private static toggleFoldersAllDefaultIconPreset(
    disable: boolean,
    customFolders: types.FolderCollection,
    defaultFolders: types.FolderCollection,
  ): types.FolderCollection {
    const folderIcons = this.getNonDisabledIcons(customFolders);
    const defaultFolderIcons = defaultFolders.supported
      .filter((folder: types.FolderExtension): boolean => !folder.disabled)
      .filter((folder: types.FolderExtension): boolean =>
        // Exclude overrides
        customFolders.supported.every(
          (cFolder: types.FolderExtension): boolean =>
            cFolder.overrides !== folder.icon,
        ),
      )
      .filter((folder: types.FolderExtension): boolean =>
        // Exclude disabled by custom
        customFolders.supported
          .filter(
            (cFolder: types.FolderExtension): boolean =>
              folder.icon === cFolder.icon,
          )
          .every(
            (cFolder: types.FolderExtension): boolean => !cFolder.disabled,
          ),
      )
      .map((folder: types.FolderExtension): string => folder.icon);
    const temp = this.togglePreset<types.FolderCollection>(
      disable,
      folderIcons,
      customFolders,
    );
    const collection = this.togglePreset<types.FolderCollection>(
      disable,
      defaultFolderIcons,
      temp,
    );
    collection.default.folder.disabled = customFolders.default.folder.disabled;
    if (customFolders.default.folder_light) {
      collection.default.folder_light.disabled =
        customFolders.default.folder_light.disabled;
    }
    collection.default.root_folder.disabled =
      customFolders.default.root_folder.disabled;
    if (customFolders.default.root_folder_light) {
      collection.default.root_folder_light.disabled =
        customFolders.default.root_folder_light.disabled;
    }
    return collection;
  }

  private static toggleHideFoldersPreset(
    disable: boolean,
    customFolders: types.FolderCollection,
  ): types.FolderCollection {
    const folderIcons = this.getNonDisabledIcons(customFolders);
    const collection = this.togglePreset<types.FolderCollection>(
      disable,
      folderIcons,
      customFolders,
    );
    collection.default.folder.disabled =
      customFolders.default.folder.disabled || disable;
    if (customFolders.default.folder_light) {
      collection.default.folder_light.disabled =
        customFolders.default.folder_light.disabled || disable;
    }
    collection.default.root_folder.disabled =
      customFolders.default.root_folder.disabled || disable;
    if (customFolders.default.root_folder_light) {
      collection.default.root_folder_light.disabled =
        customFolders.default.root_folder_light.disabled || disable;
    }
    return collection;
  }

  private static getNonDisabledIcons(
    customFolders: types.FolderCollection,
  ): string[] {
    return customFolders.supported
      .filter((cFolder: types.FolderExtension): boolean => !cFolder.disabled)
      .map((cFolder: types.FolderExtension): string => cFolder.icon);
  }

  private static mergeCustoms(
    customFiles: types.FileCollection,
    supportedFiles: types.FileCollection,
    customFolders: types.FolderCollection,
    supportedFolders: types.FolderCollection,
  ): types.MergedCollection {
    const files: types.FileCollection = {
      default: this.mergeDefaultFiles(
        customFiles.default,
        supportedFiles.default,
      ),
      supported: this.mergeSupported(
        customFiles.supported,
        supportedFiles.supported,
      ),
    };

    const folders: types.FolderCollection = {
      default: this.mergeDefaultFolders(
        customFolders.default,
        supportedFolders.default,
      ),
      supported: this.mergeSupported(
        customFolders.supported,
        supportedFolders.supported,
      ),
    };

    return { files, folders };
  }

  private static mergeDefaultFiles(
    custom: types.FileDefault,
    supported: types.FileDefault,
  ): types.FileDefault {
    return {
      file: custom.file || supported.file,
      file_light: custom.file_light || supported.file_light,
    };
  }

  private static mergeDefaultFolders(
    custom: types.FolderDefault,
    supported: types.FolderDefault,
  ): types.FolderDefault {
    return {
      folder: custom.folder || supported.folder,
      folder_light: custom.folder_light || supported.folder_light,
      root_folder: custom.root_folder || supported.root_folder,
      root_folder_light:
        custom.root_folder_light || supported.root_folder_light,
    };
  }

  private static mergeSupported(
    custom: types.Extension[],
    supported: types.Extension[],
  ): types.Extension[] {
    if (!custom || !custom.length) {
      return supported;
    }
    // start the merge operation
    let final: types.Extension[] = cloneDeep(supported);
    custom.forEach((file: types.FileExtension): void => {
      const officialFiles = final.filter(
        (extension: types.Extension): boolean => extension.icon === file.icon,
      );
      if (officialFiles.length) {
        // existing icon
        // checking if the icon is disabled
        if (file.disabled != null) {
          officialFiles.forEach((extension: types.Extension): void => {
            extension.disabled = file.disabled;
          });
          if (file.disabled) {
            return;
          }
        }
        file.format = officialFiles[0].format;
      }
      // extends? => copy the icon name to the existing ones.
      // override? => remove overriden extension.
      // check for exentensions in use.
      // we'll add a new node
      if (file.extends) {
        final
          .filter(
            (extension: types.Extension): boolean =>
              extension.icon === file.extends,
          )
          .forEach((extension: types.Extension): void => {
            extension.icon = file.icon;
          });
      }
      // remove overrides
      final = final.filter(
        (extension: types.Extension): boolean =>
          extension.icon !== file.overrides,
      );
      // check if file extensions are already in use and remove them
      file.extensions ??= [];
      file.extensions.forEach((ext: string): void =>
        final
          .filter((extension: types.Extension): string =>
            extension.extensions?.find((el: string): boolean => el === ext),
          )
          .forEach((extension: types.Extension): string[] =>
            remove(extension.extensions, (el: string): boolean => el === ext),
          ),
      );
      final.push(file);
    });
    return final;
  }

  // Note: generics and union types don't work very well :(
  // that's why we had to use ExtensionCollection<> instead of T
  private static togglePreset<
    T extends types.FileCollection | types.FolderCollection,
  >(
    disable: boolean,
    icons: string[],
    customItems: types.ExtensionCollection<types.Extension>,
  ): T {
    const workingCopy = cloneDeep(customItems);
    icons.forEach((icon: string): void => {
      const existing = workingCopy.supported.filter(
        (extension: types.Extension): boolean => extension.icon === icon,
      );
      if (!existing.length) {
        workingCopy.supported.push({
          icon,
          disabled: disable,
        });
      } else {
        existing.forEach((extension: types.Extension): void => {
          extension.disabled = disable;
        });
      }
    });
    return workingCopy as T;
  }
}
