import type * as types from '../types';

import { cloneDeep, remove } from 'lodash';

import { ManifestReader } from './manifestReader';
import * as enums from '../types/enums';

export class CustomsMerger {
  public static async merge(
    customFiles: types.IFileCollection,
    extFiles: types.IFileCollection,
    customFolders: types.IFolderCollection,
    extFolders: types.IFolderCollection,
    presets: types.IPresets,
    projectDetectionResults?: types.IProjectDetectionResult[],
    affectedPresets?: types.IPresets,
  ): Promise<types.IMergedCollection> {
    const projectPresets = await this.getProjectPresets(
      [enums.PresetNames.angular, enums.PresetNames.nestjs],
      presets,
      projectDetectionResults,
      affectedPresets,
    );

    let { files, folders } = this.mergeCustoms(
      customFiles || { default: {}, supported: [] },
      extFiles,
      customFolders || { default: {}, supported: [] },
      extFolders,
    );

    files = this.toggleProjectPreset(projectPresets, files, extFiles);

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

    folders = this.toggleFoldersAllDefaultIconPreset(
      presets.foldersAllDefaultIcon,
      folders,
      extFolders,
    );
    folders = this.toggleHideFoldersPreset(presets.hideFolders, folders);

    return { files, folders };
  }

  private static async getProjectPresets(
    presetNames: enums.PresetNames[],
    presets: types.IPresets,
    projectDetectionResults?: types.IProjectDetectionResult[],
    affectedPresets?: types.IPresets,
  ): Promise<Array<Record<string, boolean>>> {
    const projectPresets: Array<Record<string, boolean>> = [];
    for (const presetName of presetNames) {
      const name: string = enums.PresetNames[presetName];
      const project: string = enums.Projects[name] as string;
      const projectDetectionResult: types.IProjectDetectionResult | undefined =
        (
          (Array.isArray(projectDetectionResults) && projectDetectionResults) ||
          []
        ).find(
          (pdr: types.IProjectDetectionResult): boolean =>
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
    presets: types.IPresets,
    projectDetectionResult?: types.IProjectDetectionResult,
    affectedPresets?: types.IPresets,
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
    customFiles: types.IFileCollection,
    defaultFiles: types.IFileCollection,
  ): types.IFileCollection {
    let files = customFiles;
    for (const preset of projectPresets) {
      const key: string = Object.keys(preset)[0];
      const disable: boolean = preset[key];
      const regex = new RegExp(
        `^${enums.IconNames[enums.PresetNames[key] as keyof typeof enums.IconNames]}_.*\\D$`,
      );
      const icons = files.supported
        .filter((file: types.IFileExtension): boolean => regex.test(file.icon))
        .map((file: types.IFileExtension): string => file.icon);
      const defaultIcons = defaultFiles.supported
        .filter((file: types.IFileExtension): boolean => regex.test(file.icon))
        .map((file: types.IFileExtension): string => file.icon);
      const temp = this.togglePreset(disable, icons, files);
      files = this.togglePreset(disable, defaultIcons, temp);
    }
    return files;
  }

  private static toggleOfficialIconsPreset(
    disable: boolean,
    customFiles: types.IFileCollection,
    officialIcons: string[],
    defaultIcons: string[],
  ): types.IFileCollection {
    const temp = this.togglePreset(disable, officialIcons, customFiles);
    return this.togglePreset(!disable, defaultIcons, temp);
  }

  private static toggleFoldersAllDefaultIconPreset(
    disable: boolean,
    customFolders: types.IFolderCollection,
    defaultFolders: types.IFolderCollection,
  ): types.IFolderCollection {
    const folderIcons = this.getNonDisabledIcons(customFolders);
    const defaultFolderIcons = defaultFolders.supported
      .filter((folder: types.IFolderExtension): boolean => !folder.disabled)
      .filter((folder: types.IFolderExtension): boolean =>
        // Exclude overrides
        customFolders.supported.every(
          (cFolder: types.IFolderExtension): boolean =>
            cFolder.overrides !== folder.icon,
        ),
      )
      .filter((folder: types.IFolderExtension): boolean =>
        // Exclude disabled by custom
        customFolders.supported
          .filter(
            (cFolder: types.IFolderExtension): boolean =>
              folder.icon === cFolder.icon,
          )
          .every(
            (cFolder: types.IFolderExtension): boolean => !cFolder.disabled,
          ),
      )
      .map((folder: types.IFolderExtension): string => folder.icon);
    const temp = this.togglePreset<types.IFolderCollection>(
      disable,
      folderIcons,
      customFolders,
    );
    const collection = this.togglePreset<types.IFolderCollection>(
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
    customFolders: types.IFolderCollection,
  ): types.IFolderCollection {
    const folderIcons = this.getNonDisabledIcons(customFolders);
    const collection = this.togglePreset<types.IFolderCollection>(
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
    customFolders: types.IFolderCollection,
  ): string[] {
    return customFolders.supported
      .filter((cFolder: types.IFolderExtension): boolean => !cFolder.disabled)
      .map((cFolder: types.IFolderExtension): string => cFolder.icon);
  }

  private static mergeCustoms(
    customFiles: types.IFileCollection,
    supportedFiles: types.IFileCollection,
    customFolders: types.IFolderCollection,
    supportedFolders: types.IFolderCollection,
  ): types.IMergedCollection {
    const files: types.IFileCollection = {
      default: this.mergeDefaultFiles(
        customFiles.default,
        supportedFiles.default,
      ),
      supported: this.mergeSupported(
        customFiles.supported,
        supportedFiles.supported,
      ),
    };

    const folders: types.IFolderCollection = {
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
    custom: types.IFileDefault,
    supported: types.IFileDefault,
  ): types.IFileDefault {
    return {
      file: custom.file || supported.file,
      file_light: custom.file_light || supported.file_light,
    };
  }

  private static mergeDefaultFolders(
    custom: types.IFolderDefault,
    supported: types.IFolderDefault,
  ): types.IFolderDefault {
    return {
      folder: custom.folder || supported.folder,
      folder_light: custom.folder_light || supported.folder_light,
      root_folder: custom.root_folder || supported.root_folder,
      root_folder_light:
        custom.root_folder_light || supported.root_folder_light,
    };
  }

  private static mergeSupported(
    custom: types.IExtension[],
    supported: types.IExtension[],
  ): types.IExtension[] {
    if (!custom || !custom.length) {
      return supported;
    }
    // start the merge operation
    let final: types.IExtension[] = cloneDeep(supported);
    custom.forEach((file: types.IFileExtension): void => {
      const officialFiles = final.filter(
        (extension: types.IExtension): boolean => extension.icon === file.icon,
      );
      if (officialFiles.length) {
        // existing icon
        // checking if the icon is disabled
        if (file.disabled != null) {
          officialFiles.forEach((extension: types.IExtension): void => {
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
            (extension: types.IExtension): boolean =>
              extension.icon === file.extends,
          )
          .forEach((extension: types.IExtension): void => {
            extension.icon = file.icon;
          });
      }
      // remove overrides
      final = final.filter(
        (extension: types.IExtension): boolean =>
          extension.icon !== file.overrides,
      );
      // check if file extensions are already in use and remove them
      file.extensions ??= [];
      file.extensions.forEach((ext: string): void =>
        final
          .filter((extension: types.IExtension): string =>
            extension.extensions?.find((el: string): boolean => el === ext),
          )
          .forEach((extension: types.IExtension): string[] =>
            remove(extension.extensions, (el: string): boolean => el === ext),
          ),
      );
      final.push(file);
    });
    return final;
  }

  // Note: generics and union types don't work very well :(
  // that's why we had to use IExtensionCollection<> instead of T
  private static togglePreset<
    T extends types.IFileCollection | types.IFolderCollection,
  >(
    disable: boolean,
    icons: string[],
    customItems: types.IExtensionCollection<types.IExtension>,
  ): T {
    const workingCopy = cloneDeep(customItems);
    icons.forEach((icon: string): void => {
      const existing = workingCopy.supported.filter(
        (extension: types.IExtension): boolean => extension.icon === icon,
      );
      if (!existing.length) {
        workingCopy.supported.push({
          icon,
          disabled: disable,
        });
      } else {
        existing.forEach((extension: types.IExtension): void => {
          extension.disabled = disable;
        });
      }
    });
    return workingCopy as T;
  }
}
