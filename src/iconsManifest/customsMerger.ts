import { cloneDeep, remove } from 'lodash';
import * as models from '../models';
import { ManifestReader } from './manifestReader';

export class CustomsMerger {
  public static async merge(
    customFiles: models.IFileCollection,
    extFiles: models.IFileCollection,
    customFolders: models.IFolderCollection,
    extFolders: models.IFolderCollection,
    presets: models.IPresets,
    projectDetectionResults?: models.IProjectDetectionResult[],
    affectedPresets?: models.IPresets,
  ): Promise<models.IMergedCollection> {
    const projectPresets = await this.getProjectPresets(
      [models.PresetNames.angular, models.PresetNames.nestjs],
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
      [models.IconNames.jsOfficial],
      [models.IconNames.js],
    );

    files = this.toggleOfficialIconsPreset(
      !presets.tsOfficial,
      files,
      [
        models.IconNames.tsOfficial,
        models.IconNames.tsConfigOfficial,
        models.IconNames.tsDefOfficial,
      ],
      [models.IconNames.ts, models.IconNames.tsConfig, models.IconNames.tsDef],
    );

    files = this.toggleOfficialIconsPreset(
      !presets.jsonOfficial,
      files,
      [models.IconNames.jsonOfficial],
      [models.IconNames.json],
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
    presetNames: models.PresetNames[],
    presets: models.IPresets,
    projectDetectionResults?: models.IProjectDetectionResult[],
    affectedPresets?: models.IPresets,
  ): Promise<Array<Record<string, boolean>>> {
    const projectPresets: Array<Record<string, boolean>> = [];
    for (const presetName of presetNames) {
      const name: string = models.PresetNames[presetName];
      const project: string = models.Projects[name] as string;
      const projectDetectionResult: models.IProjectDetectionResult | undefined =
        (
          (Array.isArray(projectDetectionResults) && projectDetectionResults) ||
          []
        ).find(
          (pdr: models.IProjectDetectionResult) =>
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
    presets: models.IPresets,
    projectDetectionResult?: models.IProjectDetectionResult,
    affectedPresets?: models.IPresets,
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
    customFiles: models.IFileCollection,
    defaultFiles: models.IFileCollection,
  ): models.IFileCollection {
    let files = customFiles;
    for (const preset of projectPresets) {
      const key: string = Object.keys(preset)[0];
      const disable: boolean = preset[key];
      const regex = new RegExp(
        `^${
          models.IconNames[
            models.PresetNames[key] as keyof typeof models.IconNames
          ]
        }_.*\\D$`,
      );
      const icons = files.supported
        .filter((file: models.IFileExtension) => regex.test(file.icon))
        .map((file: models.IFileExtension) => file.icon);
      const defaultIcons = defaultFiles.supported
        .filter((file: models.IFileExtension) => regex.test(file.icon))
        .map((file: models.IFileExtension) => file.icon);
      const temp = this.togglePreset(disable, icons, files);
      files = this.togglePreset(disable, defaultIcons, temp);
    }
    return files;
  }

  private static toggleOfficialIconsPreset(
    disable: boolean,
    customFiles: models.IFileCollection,
    officialIcons: string[],
    defaultIcons: string[],
  ): models.IFileCollection {
    const temp = this.togglePreset(disable, officialIcons, customFiles);
    return this.togglePreset(!disable, defaultIcons, temp);
  }

  private static toggleFoldersAllDefaultIconPreset(
    disable: boolean,
    customFolders: models.IFolderCollection,
    defaultFolders: models.IFolderCollection,
  ): models.IFolderCollection {
    const folderIcons = this.getNonDisabledIcons(customFolders);
    const defaultFolderIcons = defaultFolders.supported
      .filter((folder: models.IFolderExtension) => !folder.disabled)
      .filter((folder: models.IFolderExtension) =>
        // Exclude overrides
        customFolders.supported.every(
          (cFolder: models.IFolderExtension) =>
            cFolder.overrides !== folder.icon,
        ),
      )
      .filter((folder: models.IFolderExtension) =>
        // Exclude disabled by custom
        customFolders.supported
          .filter(
            (cFolder: models.IFolderExtension) => folder.icon === cFolder.icon,
          )
          .every((cFolder: models.IFolderExtension) => !cFolder.disabled),
      )
      .map((folder: models.IFolderExtension) => folder.icon);
    const temp = this.togglePreset<models.IFolderCollection>(
      disable,
      folderIcons,
      customFolders,
    );
    const collection = this.togglePreset<models.IFolderCollection>(
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
    customFolders: models.IFolderCollection,
  ): models.IFolderCollection {
    const folderIcons = this.getNonDisabledIcons(customFolders);
    const collection = this.togglePreset<models.IFolderCollection>(
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
    customFolders: models.IFolderCollection,
  ): string[] {
    return customFolders.supported
      .filter((cFolder: models.IFolderExtension) => !cFolder.disabled)
      .map((cFolder: models.IFolderExtension) => cFolder.icon);
  }

  private static mergeCustoms(
    customFiles: models.IFileCollection,
    supportedFiles: models.IFileCollection,
    customFolders: models.IFolderCollection,
    supportedFolders: models.IFolderCollection,
  ): models.IMergedCollection {
    const files: models.IFileCollection = {
      default: this.mergeDefaultFiles(
        customFiles.default,
        supportedFiles.default,
      ),
      supported: this.mergeSupported(
        customFiles.supported,
        supportedFiles.supported,
      ),
    };

    const folders: models.IFolderCollection = {
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
    custom: models.IFileDefault,
    supported: models.IFileDefault,
  ): models.IFileDefault {
    return {
      file: custom.file || supported.file,
      file_light: custom.file_light || supported.file_light,
    };
  }

  private static mergeDefaultFolders(
    custom: models.IFolderDefault,
    supported: models.IFolderDefault,
  ): models.IFolderDefault {
    return {
      folder: custom.folder || supported.folder,
      folder_light: custom.folder_light || supported.folder_light,
      root_folder: custom.root_folder || supported.root_folder,
      root_folder_light:
        custom.root_folder_light || supported.root_folder_light,
    };
  }

  private static mergeSupported(
    custom: models.IExtension[],
    supported: models.IExtension[],
  ): models.IExtension[] {
    if (!custom || !custom.length) {
      return supported;
    }
    // start the merge operation
    let final: models.IExtension[] = cloneDeep(supported);
    custom.forEach((file: models.IFileExtension) => {
      const officialFiles = final.filter(
        (extension: models.IExtension) => extension.icon === file.icon,
      );
      if (officialFiles.length) {
        // existing icon
        // checking if the icon is disabled
        if (file.disabled != null) {
          officialFiles.forEach(
            (extension: models.IExtension) =>
              (extension.disabled = file.disabled),
          );
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
            (extension: models.IExtension) => extension.icon === file.extends,
          )
          .forEach(
            (extension: models.IExtension) => (extension.icon = file.icon),
          );
      }
      // remove overrides
      final = final.filter(
        (extension: models.IExtension) => extension.icon !== file.overrides,
      );
      // check if file extensions are already in use and remove them
      if (!file.extensions) {
        file.extensions = [];
      }
      file.extensions.forEach((ext: string) =>
        final
          .filter((extension: models.IExtension) =>
            extension.extensions.find((el: string) => el === ext),
          )
          .forEach((extension: models.IExtension) =>
            remove(extension.extensions, (el: string) => el === ext),
          ),
      );
      final.push(file);
    });
    return final;
  }

  // Note: generics and union types don't work very well :(
  // that's why we had to use IExtensionCollection<> instead of T
  private static togglePreset<
    T extends models.IFileCollection | models.IFolderCollection,
  >(
    disable: boolean,
    icons: string[],
    customItems: models.IExtensionCollection<models.IExtension>,
  ): T {
    const workingCopy = cloneDeep(customItems);
    icons.forEach((icon: string) => {
      const existing = workingCopy.supported.filter(
        (extension: models.IExtension) => extension.icon === icon,
      );
      if (!existing.length) {
        workingCopy.supported.push({
          icon,
          extensions: [],
          format: models.FileFormat.svg,
          disabled: disable,
        });
      } else {
        existing.forEach(
          (extension: models.IExtension) => (extension.disabled = disable),
        );
      }
    });
    return workingCopy as T;
  }
}
