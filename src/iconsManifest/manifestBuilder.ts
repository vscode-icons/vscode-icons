import { join } from 'path';
import { existsSync } from 'fs';
import { cloneDeep, sortBy, sortedUniq } from 'lodash';
import * as models from '../models';
import { Utils } from '../utils';
import { constants } from '../constants';
import { schema as defaultSchema } from '../models/iconsManifest';

export class ManifestBuilder {
  public static buildManifest(
    files: models.IFileCollection,
    folders: models.IFolderCollection,
    customIconsDirPath?: string
  ): models.IIconSchema {
    this.customIconDirPath = customIconsDirPath;
    this.iconsManifestDirPath = join(__dirname, '../../../', 'out/src');
    this.iconsDirRelativeBasePath = Utils.getRelativePath(
      this.iconsManifestDirPath,
      join(__dirname, '../../../', 'icons')
    );

    const schema = cloneDeep(defaultSchema);
    const defs = schema.iconDefinitions;

    // set default icons for dark theme
    defs._file.iconPath = this.buildDefaultIconPath(
      files.default.file,
      defs._file,
      false
    );
    defs._folder.iconPath = this.buildDefaultIconPath(
      folders.default.folder,
      defs._folder,
      false
    );
    defs._folder_open.iconPath = this.buildDefaultIconPath(
      folders.default.folder,
      defs._folder_open,
      true
    );
    defs._root_folder.iconPath = this.buildDefaultIconPath(
      folders.default.root_folder,
      defs._root_folder,
      false
    );
    defs._root_folder_open.iconPath = this.buildDefaultIconPath(
      folders.default.root_folder,
      defs._root_folder_open,
      true
    );

    // set default icons for light theme
    // default file and folder related icon paths if not set,
    // inherit their icons from dark theme.
    // The icon paths should not be set unless there is a specific icon for them.
    // If the icon paths get set then they override the dark theme section
    // and light icons definitions have to be specified for each extension
    // and populate the light section, otherwise they inherit from dark theme
    // and only those in 'light' section get overriden.
    defs._file_light.iconPath = this.buildDefaultIconPath(
      files.default.file_light,
      defs._file_light,
      false
    );
    defs._folder_light.iconPath = this.buildDefaultIconPath(
      folders.default.folder_light,
      defs._folder_light,
      false
    );
    defs._folder_light_open.iconPath = this.buildDefaultIconPath(
      folders.default.folder_light,
      defs._folder_light_open,
      true
    );
    defs._root_folder_light.iconPath = this.buildDefaultIconPath(
      folders.default.root_folder_light,
      defs._root_folder_light,
      false
    );
    defs._root_folder_light_open.iconPath = this.buildDefaultIconPath(
      folders.default.root_folder_light,
      defs._root_folder_light_open,
      true
    );

    // set the rest of the schema
    return this.buildJsonStructure(files, folders, schema);
  }

  private static iconsManifestDirPath: string;
  private static iconsDirRelativeBasePath: string;
  private static customIconDirPath: string;

  private static buildDefaultIconPath(
    defaultExtension: models.IDefaultExtension,
    schemaExtension: models.IIconPath,
    isOpenFolder: boolean
  ): string {
    if (!defaultExtension || defaultExtension.disabled) {
      return schemaExtension.iconPath || '';
    }
    const defPrefix = constants.iconsManifest.defaultPrefix;
    const openSuffix = isOpenFolder ? '_opened' : '';
    const iconSuffix = constants.iconsManifest.iconSuffix;
    const icon = defaultExtension.icon;
    const format = defaultExtension.format;
    const filename = `${defPrefix}${icon}${openSuffix}${iconSuffix}${Utils.fileFormatToString(
      format
    )}`;
    const fPath = this.getIconPath(filename);

    return Utils.pathUnixJoin(fPath, filename);
  }

  private static buildJsonStructure(
    files: models.IFileCollection,
    folders: models.IFolderCollection,
    schema: models.IIconSchema
  ): models.IIconSchema {
    // check for light files & folders
    const hasDefaultLightFolder =
      schema.iconDefinitions._folder_light.iconPath != null &&
      schema.iconDefinitions._folder_light.iconPath !== '';
    const hasDefaultLightFile =
      schema.iconDefinitions._file_light.iconPath != null &&
      schema.iconDefinitions._file_light.iconPath !== '';
    const res = {
      //  files section
      files: this.buildFiles(files, hasDefaultLightFile),
      // folders section
      folders: this.buildFolders(folders, hasDefaultLightFolder),
    };
    // map structure to the schema
    schema.iconDefinitions = {
      ...schema.iconDefinitions,
      ...res.folders.defs,
      ...res.files.defs,
    };
    schema.folderNames = res.folders.names.folderNames;
    schema.folderNamesExpanded = res.folders.names.folderNamesExpanded;
    schema.fileExtensions = res.files.names.fileExtensions;
    schema.fileNames = res.files.names.fileNames;
    schema.languageIds = res.files.languageIds;
    schema.light.folderNames = res.folders.light.folderNames;
    schema.light.folderNamesExpanded = res.folders.light.folderNamesExpanded;
    schema.light.fileExtensions = res.files.light.fileExtensions;
    schema.light.fileNames = res.files.light.fileNames;
    schema.light.languageIds = res.files.light.languageIds;

    return schema;
  }

  private static buildFiles(
    files: models.IFileCollection,
    hasDefaultLightFile: boolean
  ) {
    const sts = constants.iconsManifest;
    return sortedUniq(
      sortBy(
        files.supported.filter(x => !x.disabled && x.icon),
        item => item.icon
      )
    ).reduce(
      (old, current) => {
        const defs = old.defs;
        const names = old.names;
        const languageIds = old.languageIds;
        const light = old.light;
        const icon = current.icon;
        const hasLightVersion = current.light;
        const iconFileType = `${sts.fileTypePrefix}${icon}`;
        const iconFileLightType = `${sts.fileTypeLightPrefix}${icon}`;
        const iconFileExtension = Utils.fileFormatToString(current.format);
        const filename = `${
          hasLightVersion ? iconFileLightType : iconFileType
        }${sts.iconSuffix}${iconFileExtension}`;
        const fileIconPath = this.getIconPath(filename);
        const filePath = Utils.pathUnixJoin(fileIconPath, iconFileType);
        const fileLightPath = Utils.pathUnixJoin(
          fileIconPath,
          iconFileLightType
        );
        const iconFileDefinition = `${sts.definitionFilePrefix}${icon}`;
        const iconFileLightDefinition = `${
          sts.definitionFileLightPrefix
        }${icon}`;
        const isFilename = current.filename;

        defs[iconFileDefinition] = {
          iconPath: `${filePath}${sts.iconSuffix}${iconFileExtension}`,
        };

        if (hasDefaultLightFile && !hasLightVersion) {
          defs[iconFileLightDefinition] = {
            iconPath: `${filePath}${sts.iconSuffix}${iconFileExtension}`,
          };
        }

        if (hasLightVersion) {
          defs[iconFileLightDefinition] = {
            iconPath: `${fileLightPath}${sts.iconSuffix}${iconFileExtension}`,
          };
        }

        if (current.languages) {
          const assignLanguages = langId => {
            languageIds[langId] = iconFileDefinition;
          };
          const assignLanguagesLight = langId => {
            light.languageIds[langId] = hasLightVersion
              ? iconFileLightDefinition
              : iconFileDefinition;
          };

          current.languages.forEach(langIds => {
            if (Array.isArray(langIds.ids)) {
              langIds.ids.forEach(id => {
                assignLanguages(id);
                assignLanguagesLight(id);
              });
            } else {
              assignLanguages(langIds.ids);
              assignLanguagesLight(langIds.ids);
            }
          });
        }

        const populateFn = (extension: string) => {
          if (isFilename) {
            names.fileNames[extension] = iconFileDefinition;
            light.fileNames[extension] = hasLightVersion
              ? iconFileLightDefinition
              : iconFileDefinition;
          } else {
            const noDotExtension = Utils.removeFirstDot(extension);
            names.fileExtensions[noDotExtension] = iconFileDefinition;
            light.fileExtensions[noDotExtension] = hasLightVersion
              ? iconFileLightDefinition
              : iconFileDefinition;
          }
        };

        current.extensions.forEach(populateFn);

        const hasGlobDefinitions =
          current.filenamesGlob &&
          !!current.filenamesGlob.length &&
          current.extensionsGlob &&
          !!current.extensionsGlob.length;

        if (hasGlobDefinitions) {
          Utils.combine(current.filenamesGlob, current.extensionsGlob).forEach(
            populateFn
          );
        }

        return old;
      },
      {
        defs: {},
        names: { fileExtensions: {}, fileNames: {} },
        light: { fileExtensions: {}, fileNames: {}, languageIds: {} },
        languageIds: {},
      }
    );
  }

  private static buildFolders(
    folders: models.IFolderCollection,
    hasDefaultLightFolder: boolean
  ) {
    const sts = constants.iconsManifest;
    return sortBy(
      folders.supported.filter(x => !x.disabled && x.icon),
      item => item.icon
    ).reduce(
      (old, current) => {
        const defs = old.defs;
        const names = old.names;
        const light = old.light;
        const icon = current.icon;
        const hasLightVersion = current.light;
        const iconFolderType = `${sts.folderTypePrefix}${icon}`;
        const iconFolderLightType = `${sts.folderTypeLightPrefix}${icon}`;
        const iconFileExtension = Utils.fileFormatToString(current.format);
        const folderName = `${
          hasLightVersion ? iconFolderLightType : iconFolderType
        }${sts.iconSuffix}${iconFileExtension}`;
        const openFolderName = `${
          hasLightVersion ? iconFolderLightType : iconFolderType
        }_opened${sts.iconSuffix}${iconFileExtension}`;
        const folderIconPath = this.getIconPath(folderName);
        const openFolderIconPath = this.getIconPath(openFolderName);
        const folderPath = Utils.pathUnixJoin(folderIconPath, iconFolderType);
        const folderLightPath = Utils.pathUnixJoin(
          folderIconPath,
          iconFolderLightType
        );
        const openFolderPath = `${folderPath}_opened`;
        const openFolderLightPath = `${folderLightPath}_opened`;
        const iconFolderDefinition = `${sts.definitionFolderPrefix}${icon}`;
        const iconFolderLightDefinition = `${
          sts.definitionFolderLightPrefix
        }${icon}`;
        const iconOpenFolderDefinition = `${iconFolderDefinition}_open`;
        const iconOpenFolderLightDefinition = `${iconFolderLightDefinition}_open`;

        if (folderIconPath !== openFolderIconPath) {
          throw new Error(
            `Folder icons for '${icon}' must be placed in the same directory`
          );
        }

        defs[iconFolderDefinition] = {
          iconPath: `${folderPath}${sts.iconSuffix}${iconFileExtension}`,
        };
        defs[iconOpenFolderDefinition] = {
          iconPath: `${openFolderPath}${sts.iconSuffix}${iconFileExtension}`,
        };

        if (hasDefaultLightFolder && !hasLightVersion) {
          defs[iconFolderLightDefinition] = {
            iconPath: `${folderPath}${sts.iconSuffix}${iconFileExtension}`,
          };
          defs[iconOpenFolderLightDefinition] = {
            iconPath: `${openFolderPath}${sts.iconSuffix}${iconFileExtension}`,
          };
        }

        if (hasLightVersion) {
          defs[iconFolderLightDefinition] = {
            iconPath: `${folderLightPath}${sts.iconSuffix}${iconFileExtension}`,
          };
          defs[iconOpenFolderLightDefinition] = {
            iconPath: `${openFolderLightPath}${
              sts.iconSuffix
            }${iconFileExtension}`,
          };
        }

        current.extensions.forEach(extension => {
          const key = extension;
          names.folderNames[key] = iconFolderDefinition;
          names.folderNamesExpanded[key] = iconOpenFolderDefinition;
          light.folderNames[key] = hasLightVersion
            ? iconFolderLightDefinition
            : iconFolderDefinition;
          light.folderNamesExpanded[key] = hasLightVersion
            ? iconOpenFolderLightDefinition
            : iconOpenFolderDefinition;
        });

        return old;
      },
      {
        defs: {},
        names: { folderNames: {}, folderNamesExpanded: {} },
        light: { folderNames: {}, folderNamesExpanded: {} },
      }
    );
  }

  private static getIconPath(filename: string): string {
    if (!this.customIconDirPath) {
      return this.iconsDirRelativeBasePath;
    }
    const absPath = Utils.pathUnixJoin(
      this.customIconDirPath,
      constants.extension.customIconFolderName
    );
    if (!this.hasCustomIcon(absPath, filename)) {
      return this.iconsDirRelativeBasePath;
    }
    const sanitizedFolderPath = Utils.belongToSameDrive(
      absPath,
      this.iconsManifestDirPath
    )
      ? this.iconsManifestDirPath
      : Utils.overwriteDrive(absPath, this.iconsManifestDirPath);
    return Utils.getRelativePath(sanitizedFolderPath, absPath, false);
  }

  private static hasCustomIcon(folderPath: string, filename: string): boolean {
    const relativePath = Utils.getRelativePath('.', folderPath, false);
    const filePath = Utils.pathUnixJoin(relativePath, filename);
    return existsSync(filePath);
  }
}
