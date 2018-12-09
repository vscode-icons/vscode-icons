import { cloneDeep, remove } from 'lodash';
import * as models from '../models';
import { ManifestReader } from './manifestReader';

export class CustomsMerger {
  public static merge(
    customFiles: models.IFileCollection,
    extFiles: models.IFileCollection,
    customFolders: models.IFolderCollection,
    extFolders: models.IFolderCollection,
    presets: models.IPresets,
    projectDetectionResult?: models.IProjectDetectionResult,
    affectedPresets?: models.IPresets,
  ): { files: models.IFileCollection; folders: models.IFolderCollection } {
    const angularPreset: boolean = this.getAngularPreset(
      presets,
      projectDetectionResult,
      affectedPresets,
    );

    let { files, folders } = this.mergeCustoms(
      customFiles || { default: {}, supported: [] },
      extFiles,
      customFolders || { default: {}, supported: [] },
      extFolders,
    );

    files = this.toggleAngularPreset(!angularPreset, files, extFiles);
    files = this.toggleOfficialIconsPreset(
      !presets.jsOfficial,
      files,
      [models.IconNames.jsOfficial],
      [models.IconNames.js],
    );
    files = this.toggleOfficialIconsPreset(
      !presets.tsOfficial,
      files,
      [models.IconNames.tsOfficial, models.IconNames.tsDefOfficial],
      [models.IconNames.ts, models.IconNames.tsDef],
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

  private static getAngularPreset(
    presets: models.IPresets,
    projectDetectionResult: models.IProjectDetectionResult,
    affectedPresets: models.IPresets,
  ): boolean {
    const hasProjectDetectionResult =
      projectDetectionResult &&
      typeof projectDetectionResult === 'object' &&
      'value' in projectDetectionResult;
    return hasProjectDetectionResult &&
      projectDetectionResult.projectName === models.Projects.angular
      ? projectDetectionResult.value
      : presets.angular ||
          (affectedPresets &&
            !affectedPresets.angular &&
            !ManifestReader.iconsDisabled(models.Projects.angular));
  }

  private static toggleAngularPreset(
    disable: boolean,
    customFiles: models.IFileCollection,
    defaultFiles: models.IFileCollection,
  ): models.IFileCollection {
    const regex = new RegExp(`^${models.IconNames.angular}_.*\\D$`);
    const icons = customFiles.supported
      .filter(x => regex.test(x.icon))
      .map(x => x.icon);
    const defaultIcons = defaultFiles.supported
      .filter(x => regex.test(x.icon))
      .map(x => x.icon);
    const temp = this.togglePreset(disable, icons, customFiles);
    return this.togglePreset(disable, defaultIcons, temp);
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
      .filter(x => !x.disabled)
      .filter(x =>
        // Exclude overrides
        customFolders.supported.every(y => y.overrides !== x.icon),
      )
      .filter(x =>
        // Exclude disabled by custom
        customFolders.supported
          .filter(y => x.icon === y.icon)
          .every(z => !z.disabled),
      )
      .map(x => x.icon);
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
  ): any {
    return customFolders.supported.filter(x => !x.disabled).map(x => x.icon);
  }

  private static mergeCustoms(
    customFiles: models.IFileCollection,
    supportedFiles: models.IFileCollection,
    customFolders: models.IFolderCollection,
    supportedFolders: models.IFolderCollection,
  ): { files: models.IFileCollection; folders: models.IFolderCollection } {
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
    custom.forEach(file => {
      const officialFiles = final.filter(x => x.icon === file.icon);
      if (officialFiles.length) {
        // existing icon
        // checking if the icon is disabled
        if (file.disabled != null) {
          officialFiles.forEach(x => (x.disabled = file.disabled));
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
          .filter(x => x.icon === file.extends)
          .forEach(x => (x.icon = file.icon));
      }
      // remove overrides
      final = final.filter(x => x.icon !== file.overrides);
      // check if file extensions are already in use and remove them
      if (!file.extensions) {
        file.extensions = [];
      }
      file.extensions.forEach(ext =>
        final
          .filter(x => x.extensions.find(y => y === ext))
          .forEach(x => remove(x.extensions, el => el === ext)),
      );
      final.push(file);
    });
    return final;
  }

  // Note: generics and union types don't work very well :(
  // that's why we had to use IExtensionCollection<> instead of T
  private static togglePreset<
    T extends models.IFileCollection | models.IFolderCollection
  >(
    disable: boolean,
    icons: string[],
    customItems: models.IExtensionCollection<models.IExtension>,
  ): T {
    const workingCopy = cloneDeep(customItems);
    icons.forEach(icon => {
      const existing = workingCopy.supported.filter(x => x.icon === icon);
      if (!existing.length) {
        workingCopy.supported.push({
          icon,
          extensions: [],
          format: models.FileFormat.svg,
          disabled: disable,
        });
      } else {
        existing.forEach(x => (x.disabled = disable));
      }
    });
    return workingCopy as T;
  }
}
