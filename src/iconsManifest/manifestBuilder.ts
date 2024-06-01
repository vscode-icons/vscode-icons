import { cloneDeep, sortBy, sortedUniq } from 'lodash';
import { existsAsync } from '../common/fsAsync';
import { ConfigManager } from '../configuration/configManager';
import { constants } from '../constants';
import * as models from '../models';
import { schema as defaultSchema } from '../models/iconsManifest';
import { Utils } from '../utils';

export class ManifestBuilder {
  private static iconsDirRelativeBasePath: string;
  private static customIconDirPath: string;

  public static async buildManifest(
    files: models.IFileCollection,
    folders: models.IFolderCollection,
    customIconsDirPath?: string,
  ): Promise<models.IIconSchema> {
    this.customIconDirPath = customIconsDirPath;
    this.iconsDirRelativeBasePath = await Utils.getRelativePath(
      ConfigManager.sourceDir,
      ConfigManager.iconsDir,
    );

    const schema = cloneDeep(defaultSchema);
    const defs = schema.iconDefinitions;

    // set default icons for dark theme
    defs._file.iconPath = await this.buildDefaultIconPath(
      files.default.file,
      defs._file,
    );
    defs._folder.iconPath = await this.buildDefaultIconPath(
      folders.default.folder,
      defs._folder,
      true,
      false,
    );
    defs._folder_open.iconPath = await this.buildDefaultIconPath(
      folders.default.folder,
      defs._folder_open,
      true,
      true,
    );
    defs._root_folder.iconPath = await this.buildDefaultIconPath(
      folders.default.root_folder,
      defs._root_folder,
      true,
      false,
    );
    defs._root_folder_open.iconPath = await this.buildDefaultIconPath(
      folders.default.root_folder,
      defs._root_folder_open,
      true,
      true,
    );

    // set default icons for light theme
    // default file and folder related icon paths if not set,
    // inherit their icons from dark theme.
    // The icon paths should not be set unless there is a specific icon for them.
    // If the icon paths get set then they override the dark theme section
    // and light icons definitions have to be specified for each extension
    // and populate the light section, otherwise they inherit from dark theme
    // and only those in 'light' section get overriden.
    defs._file_light.iconPath = await this.buildDefaultIconPath(
      files.default.file_light,
      defs._file_light,
    );
    defs._folder_light.iconPath = await this.buildDefaultIconPath(
      folders.default.folder_light,
      defs._folder_light,
      true,
      false,
    );
    defs._folder_light_open.iconPath = await this.buildDefaultIconPath(
      folders.default.folder_light,
      defs._folder_light_open,
      true,
      true,
    );
    defs._root_folder_light.iconPath = await this.buildDefaultIconPath(
      folders.default.root_folder_light,
      defs._root_folder_light,
      true,
      false,
    );
    defs._root_folder_light_open.iconPath = await this.buildDefaultIconPath(
      folders.default.root_folder_light,
      defs._root_folder_light_open,
      true,
      true,
    );

    // set the rest of the schema
    return this.buildJsonStructure(files, folders, schema);
  }

  private static async buildDefaultIconPath(
    defaultExtension: models.IDefaultExtension,
    schemaExtension: models.IIconPath,
    isFolder = false,
    isOpenFolder = false,
  ): Promise<string> {
    if (!defaultExtension || defaultExtension.disabled) {
      return schemaExtension.iconPath || '';
    }
    const defPrefix = !defaultExtension.useBundledIcon
      ? constants.iconsManifest.defaultPrefix
      : isFolder
        ? constants.iconsManifest.folderTypePrefix
        : constants.iconsManifest.fileTypePrefix;
    const openSuffix = isOpenFolder ? '_opened' : '';
    const iconSuffix = constants.iconsManifest.iconSuffix;
    const icon = defaultExtension.icon;
    const format = defaultExtension.format;
    const filename = `${defPrefix}${icon}${openSuffix}${iconSuffix}${Utils.fileFormatToString(
      format,
    )}`;
    const fPath = await this.getIconPath(filename);

    return Utils.pathUnixJoin(fPath, filename);
  }

  private static async buildJsonStructure(
    files: models.IFileCollection,
    folders: models.IFolderCollection,
    schema: models.IIconSchema,
  ): Promise<models.IIconSchema> {
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
    const resFiles = await res.files;
    const resFolders = await res.folders;
    schema.iconDefinitions = {
      ...schema.iconDefinitions,
      ...resFolders.defs,
      ...resFiles.defs,
    };
    schema.folderNames = resFolders.names.folderNames;
    schema.folderNamesExpanded = resFolders.names.folderNamesExpanded;
    schema.fileExtensions = resFiles.names.fileExtensions;
    schema.fileNames = resFiles.names.fileNames;
    schema.languageIds = resFiles.languageIds;
    schema.light.folderNames = resFolders.light.folderNames;
    schema.light.folderNamesExpanded = resFolders.light.folderNamesExpanded;
    schema.light.fileExtensions = resFiles.light.fileExtensions;
    schema.light.fileNames = resFiles.light.fileNames;
    schema.light.languageIds = resFiles.light.languageIds;

    return schema;
  }

  private static buildFiles(
    files: models.IFileCollection,
    hasDefaultLightFile: boolean,
  ): Promise<models.IBuildFiles> {
    const sts = constants.iconsManifest;
    return sortedUniq(
      sortBy(
        files.supported.filter(
          (fileExt: models.IFileExtension) => !fileExt.disabled && fileExt.icon,
        ),
        (item: models.IFileExtension) => item.icon,
      ),
    ).reduce(
      async (previous, current): Promise<models.IBuildFiles> => {
        const old = await previous;
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
        const fileIconPath = await this.getIconPath(filename);
        const filePath = Utils.pathUnixJoin(fileIconPath, iconFileType);
        const fileLightPath = Utils.pathUnixJoin(
          fileIconPath,
          iconFileLightType,
        );
        const iconFileDefinition = `${sts.definitionFilePrefix}${icon}`;
        const iconFileLightDefinition = `${sts.definitionFileLightPrefix}${icon}`;
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
          const assignLanguages = (langId: string): void => {
            languageIds[langId] = iconFileDefinition;
          };
          const assignLanguagesLight = (langId: string): void => {
            light.languageIds[langId] = hasLightVersion
              ? iconFileLightDefinition
              : iconFileDefinition;
          };

          current.languages.forEach((langId: models.ILanguage): void => {
            if (Array.isArray(langId.ids)) {
              langId.ids.forEach((id: string) => {
                assignLanguages(id);
                assignLanguagesLight(id);
              });
            } else {
              assignLanguages(langId.ids);
              assignLanguagesLight(langId.ids);
            }
          });
        }

        const populateFn = (extension: string): void => {
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
            populateFn,
          );
        }

        return old;
      },
      Promise.resolve({
        defs: {},
        names: { fileExtensions: {}, fileNames: {} },
        light: { fileExtensions: {}, fileNames: {}, languageIds: {} },
        languageIds: {},
      }),
    );
  }

  private static buildFolders(
    folders: models.IFolderCollection,
    hasDefaultLightFolder: boolean,
  ): Promise<models.IBuildFolders> {
    const sts = constants.iconsManifest;
    return sortBy(
      folders.supported.filter(
        (folderExt: models.IFolderExtension) =>
          !folderExt.disabled && folderExt.icon,
      ),
      (item: models.IFolderExtension) => item.icon,
    ).reduce(
      async (previous, current): Promise<models.IBuildFolders> => {
        const old = await previous;
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
        const folderIconPath = await this.getIconPath(folderName);
        const openFolderIconPath = await this.getIconPath(openFolderName);
        const folderPath = Utils.pathUnixJoin(folderIconPath, iconFolderType);
        const folderLightPath = Utils.pathUnixJoin(
          folderIconPath,
          iconFolderLightType,
        );
        const openFolderPath = `${folderPath}_opened`;
        const openFolderLightPath = `${folderLightPath}_opened`;
        const iconFolderDefinition = `${sts.definitionFolderPrefix}${icon}`;
        const iconFolderLightDefinition = `${sts.definitionFolderLightPrefix}${icon}`;
        const iconOpenFolderDefinition = `${iconFolderDefinition}_open`;
        const iconOpenFolderLightDefinition = `${iconFolderLightDefinition}_open`;

        if (folderIconPath !== openFolderIconPath) {
          throw new Error(
            `Folder icons for '${icon}' must be placed in the same directory`,
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
            iconPath: `${openFolderLightPath}${sts.iconSuffix}${iconFileExtension}`,
          };
        }

        current.extensions.forEach((extension: string) => {
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
      Promise.resolve({
        defs: {},
        names: { folderNames: {}, folderNamesExpanded: {} },
        light: { folderNames: {}, folderNamesExpanded: {} },
      }),
    );
  }

  private static async getIconPath(filename: string): Promise<string> {
    if (!this.customIconDirPath) {
      return this.iconsDirRelativeBasePath;
    }
    const absPath = Utils.pathUnixJoin(
      this.customIconDirPath,
      constants.extension.customIconFolderName,
    );
    const hasCustomIcon = await this.hasCustomIcon(absPath, filename);
    if (!hasCustomIcon) {
      return this.iconsDirRelativeBasePath;
    }
    const belongToSameDrive: boolean = Utils.belongToSameDrive(
      absPath,
      ConfigManager.sourceDir,
    );
    const sanitizedFolderPath: string = belongToSameDrive
      ? ConfigManager.sourceDir
      : Utils.overwriteDrive(absPath, ConfigManager.sourceDir);
    return Utils.getRelativePath(sanitizedFolderPath, absPath, false);
  }

  private static async hasCustomIcon(
    folderPath: string,
    filename: string,
  ): Promise<boolean> {
    const relativePath = await Utils.getRelativePath('.', folderPath, false);
    const filePath = Utils.pathUnixJoin(relativePath, filename);
    return existsAsync(filePath);
  }
}
