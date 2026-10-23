import type * as types from '../types';

import { cloneDeep, sortBy, sortedUniq } from 'lodash';

import { existsAsync } from '../common/fsAsync';
import { ConfigManager } from '../configuration/configManager';
import { constants } from '../constants';
import {
  vscodeSchema as defaultVSCodeSchema,
  zedSchema as defaultZedSchema,
} from '../types/iconSchema';
import { Utils } from '../utils';

export class ManifestBuilder {
  private static iconsRelativeDirPathFromSourceDir: string;
  private static iconsRelativeDirPathFromRootDir: string;
  private static customIconDirPath: string;

  public static async buildManifest(
    files: types.IFileCollection,
    folders: types.IFolderCollection,
    customIconsDirPath?: string,
  ): Promise<types.IIconManifest> {
    this.customIconDirPath = customIconsDirPath;
    this.iconsRelativeDirPathFromSourceDir = await Utils.getRelativePath(
      ConfigManager.sourceDir,
      ConfigManager.iconsDir,
    );
    this.iconsRelativeDirPathFromRootDir = await Utils.getRelativePath(
      ConfigManager.rootDir,
      ConfigManager.iconsDir,
      true, // checkDirectory
      true, // includeDotSlashPrefix
    );

    const vscSchema = cloneDeep(defaultVSCodeSchema);

    await this.configureVSCodeIconDefinitions(files, folders, vscSchema);

    const zedSchema = this.configureZedThemesDirectoryIcons(
      vscSchema.iconDefinitions,
    );

    // When folders are hidden, we need to set the folder mapping references to empty
    // so VS Code doesn't reserve space for invisible folder icons.
    // This prevents the misleading indentation gap described in issue #3353.
    this.updateFolderIconMappings(folders, vscSchema);

    // set the rest of the schema
    const finalManifest = await this.buildJsonStructure(
      files,
      folders,
      vscSchema,
      zedSchema,
    );

    return finalManifest;
  }

  private static updateFolderIconMappings(
    folders: types.IFolderCollection,
    vscSchema: types.IVSCodeIconSchema,
  ): void {
    const isDisabled = (entry?: { disabled?: boolean }): boolean =>
      !entry || entry.disabled;
    if (isDisabled(folders.default.folder)) {
      vscSchema.folder = '';
      vscSchema.folderExpanded = '';
    }
    if (isDisabled(folders.default.root_folder)) {
      vscSchema.rootFolder = '';
      vscSchema.rootFolderExpanded = '';
    }
    if (isDisabled(folders.default.folder_light)) {
      vscSchema.light.folder = '';
      vscSchema.light.folderExpanded = '';
    }
    if (isDisabled(folders.default.root_folder_light)) {
      vscSchema.light.rootFolder = '';
      vscSchema.light.rootFolderExpanded = '';
    }
  }

  private static async configureVSCodeIconDefinitions(
    files: types.IFileCollection,
    folders: types.IFolderCollection,
    vscSchema: types.IVSCodeIconSchema,
  ): Promise<void> {
    const vscDefs = vscSchema.iconDefinitions;

    // set default icons for dark theme
    vscDefs._file.iconPath = await this.buildDefaultIconPath(
      files.default.file,
      vscDefs._file,
    );

    vscDefs._root_folder.iconPath = await this.buildDefaultIconPath(
      folders.default.root_folder,
      vscDefs._root_folder,
      true,
      false,
    );

    vscDefs._root_folder_open.iconPath = await this.buildDefaultIconPath(
      folders.default.root_folder,
      vscDefs._root_folder_open,
      true,
      true,
    );

    vscDefs._folder.iconPath = await this.buildDefaultIconPath(
      folders.default.folder,
      vscDefs._folder,
      true,
      false,
    );

    vscDefs._folder_open.iconPath = await this.buildDefaultIconPath(
      folders.default.folder,
      vscDefs._folder_open,
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
    // vscode only
    vscDefs._file_light.iconPath = await this.buildDefaultIconPath(
      files.default.file_light,
      vscDefs._file_light,
    );

    vscDefs._root_folder_light.iconPath = await this.buildDefaultIconPath(
      folders.default.root_folder_light,
      vscDefs._root_folder_light,
      true,
      false,
    );

    vscDefs._root_folder_light_open.iconPath = await this.buildDefaultIconPath(
      folders.default.root_folder_light,
      vscDefs._root_folder_light_open,
      true,
      true,
    );

    vscDefs._folder_light.iconPath = await this.buildDefaultIconPath(
      folders.default.folder_light,
      vscDefs._folder_light,
      true,
      false,
    );

    vscDefs._folder_light_open.iconPath = await this.buildDefaultIconPath(
      folders.default.folder_light,
      vscDefs._folder_light_open,
      true,
      true,
    );
  }

  private static configureZedThemesDirectoryIcons(
    vscDefs: types.IVSCodeIconDefinition,
  ): types.IZedIconSchema {
    const zedSchema = cloneDeep(defaultZedSchema);

    for (const themeIndex of Object.values(constants.zed.dark_themes)) {
      zedSchema.themes[themeIndex].directory_icons.collapsed =
        this.toIconFolderPath(vscDefs._folder.iconPath);
      zedSchema.themes[themeIndex].directory_icons.expanded =
        this.toIconFolderPath(vscDefs._folder_open.iconPath);
    }

    for (const themeIndex of Object.values(constants.zed.light_themes)) {
      zedSchema.themes[themeIndex].directory_icons.collapsed =
        this.toIconFolderPath(vscDefs._folder_light.iconPath) ||
        zedSchema.themes[0].directory_icons.collapsed;
      zedSchema.themes[themeIndex].directory_icons.expanded =
        this.toIconFolderPath(vscDefs._folder_light_open.iconPath) ||
        zedSchema.themes[0].directory_icons.expanded;
    }

    return zedSchema;
  }

  private static toIconFolderPath(iconPath: string): string {
    const sourceIconsPrefix = this.iconsRelativeDirPathFromSourceDir;
    return iconPath.startsWith(sourceIconsPrefix)
      ? `${this.iconsRelativeDirPathFromRootDir}${iconPath.slice(sourceIconsPrefix.length)}`
      : iconPath;
  }

  private static async buildDefaultIconPath(
    defaultExtension: types.IDefaultExtension,
    schemaExtension: types.IVSCodeIconPath,
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
    files: types.IFileCollection,
    folders: types.IFolderCollection,
    vscSchema: types.IVSCodeIconSchema,
    zedSchema: types.IZedIconSchema,
  ): Promise<types.IIconManifest> {
    // check for light files & folders
    // NOTE: We're checking VS Code schema but bear in mind that Zed use the same icons.
    // So it's guaranteed that if there is a light folder/file in VS Code schema, Zed will have it too.
    const hasDefaultLightFolder =
      vscSchema.iconDefinitions._folder_light.iconPath != null &&
      vscSchema.iconDefinitions._folder_light.iconPath !== '';
    const hasDefaultLightFile =
      vscSchema.iconDefinitions._file_light.iconPath != null &&
      vscSchema.iconDefinitions._file_light.iconPath !== '';
    const res = {
      //  files section
      files: this.buildFiles(files, hasDefaultLightFile),
      filesOfficial: this.buildFiles(
        files,
        hasDefaultLightFile,
        'officialIcons',
      ),
      filesAngular: this.buildFiles(files, hasDefaultLightFile, 'angularIcons'),
      filesNest: this.buildFiles(files, hasDefaultLightFile, 'nestIcons'),
      // folders section
      folders: this.buildFolders(folders, hasDefaultLightFolder),
      foldersOfficial: this.buildFolders(folders, hasDefaultLightFolder, true),
    };
    // map structure to the schema
    const [
      resFiles,
      resFilesOfficial,
      resFolders,
      resFoldersOfficial,
      resFilesAngular,
      resFilesNest,
    ] = await Promise.all([
      res.files,
      res.filesOfficial,
      res.folders,
      res.foldersOfficial,
      res.filesAngular,
      res.filesNest,
    ]);

    const vscFinalSchema = this.buildVSCJsonStructure(
      resFiles,
      resFolders,
      vscSchema,
    );

    const zedFinalSchema = this.generateZedJsonStructure({
      files: resFiles,
      folders: resFolders,
      filesOfficial: resFilesOfficial,
      foldersOfficial: resFoldersOfficial,
      filesAngular: resFilesAngular,
      filesNest: resFilesNest,
      schema: zedSchema,
    });

    return { vscode: vscFinalSchema, zed: zedFinalSchema };
  }

  private static generateZedJsonStructure(
    options: types.IZedJsonStructureOptions,
  ): types.IZedIconSchema {
    let zedFinalSchema = this.buildZedJsonStructure(
      options.files,
      options.folders,
      options.schema,
      {
        dark: constants.zed.dark_themes.dark,
        light: constants.zed.light_themes.light,
      },
    );

    zedFinalSchema = this.buildZedJsonStructure(
      options.filesOfficial,
      options.foldersOfficial,
      zedFinalSchema,
      {
        dark: constants.zed.dark_themes.official,
        light: constants.zed.light_themes.official,
      },
    );

    zedFinalSchema = this.buildZedJsonStructure(
      options.filesAngular,
      options.foldersOfficial,
      zedFinalSchema,
      {
        dark: constants.zed.dark_themes.angular,
        light: constants.zed.light_themes.angular,
      },
    );

    zedFinalSchema = this.buildZedJsonStructure(
      options.filesNest,
      options.foldersOfficial,
      zedFinalSchema,
      {
        dark: constants.zed.dark_themes.nest,
        light: constants.zed.light_themes.nest,
      },
    );

    return zedFinalSchema;
  }

  private static buildVSCJsonStructure(
    files: types.IBuildFiles,
    folders: types.IBuildFolders,
    schema: types.IVSCodeIconSchema,
  ): types.IVSCodeIconSchema {
    schema.iconDefinitions = {
      ...schema.iconDefinitions,
      ...folders.defs,
      ...files.defs,
    };

    schema.folderNames = folders.names.folderNames;
    schema.folderNamesExpanded = folders.names.folderNamesExpanded;
    schema.fileExtensions = files.names.fileExtensions;
    schema.fileNames = files.names.fileNames;
    schema.languageIds = files.language.languageIds;
    schema.light.folderNames = folders.light.folderNames;
    schema.light.folderNamesExpanded = folders.light.folderNamesExpanded;
    schema.light.fileExtensions = files.light.fileExtensions;
    schema.light.fileNames = files.light.fileNames;
    schema.light.languageIds = files.light.language.languageIds;

    return schema;
  }

  private static buildZedJsonStructure(
    files: types.IBuildFiles,
    folders: types.IBuildFolders,
    schema: types.IZedIconSchema,
    theme: { dark: number; light: number },
  ): types.IZedIconSchema {
    const darkSchema = schema.themes[theme.dark];
    const lightSchema = schema.themes[theme.light];

    const darkFileIcons: types.IZedFileIcons = {};
    const lightFileIcons: types.IZedFileIcons = {};

    Object.entries(files.defs).forEach(([key, iconDef]): void => {
      darkFileIcons[key] = { path: this.toIconFolderPath(iconDef.iconPath) };
      lightFileIcons[key] = {
        path: this.toIconFolderPath(iconDef.iconPath),
      };
      if (key.includes('_light')) {
        // delete it from the dark icons version
        delete darkFileIcons[key];
        // delete the dark version from the light icons version if exists
        const darkKey = key.replace('_light', '');
        if (lightFileIcons[darkKey]) {
          delete lightFileIcons[darkKey];
        }
      }
    });

    darkSchema.file_icons = darkFileIcons;
    lightSchema.file_icons = lightFileIcons;

    // language id icons are going to go first,
    // and we will overwrite them with the supported file extensions and filenames if available

    // zed file stems (file names)
    darkSchema.file_stems = {
      ...files.language.fileNames,
      ...files.names.fileNames,
    };
    lightSchema.file_stems = {
      ...files.light.language.fileNames,
      ...files.light.fileNames,
    };

    // zed file suffixes (file extensions)
    darkSchema.file_suffixes = {
      ...files.language.fileExtensions,
      ...files.names.fileExtensions,
    };
    lightSchema.file_suffixes = {
      ...files.light.language.fileExtensions,
      ...files.light.fileExtensions,
    };

    // zed folder icons
    // NOTE: the light folder list contains all the folders, so we can use it to build both themes
    // with just one iteration. On the other hand, we will leverage naming conventions to find the
    // correct icon paths depending on the theme and the state (collapsed/expanded).
    const darkFolderIcons: types.IZedFolderIcons = {};
    const lightFolderIcons: types.IZedFolderIcons = {};

    Object.entries(folders.light.folderNames).forEach(
      ([dirName, key]): void => {
        const folder = folders.defs[key];
        const folderOpen = folders.defs[`${key}_open`];

        lightFolderIcons[dirName] = {
          collapsed: this.toIconFolderPath(folder.iconPath),
          expanded: this.toIconFolderPath(folderOpen.iconPath),
        };

        // if we have a light version icon, we need to find the dark version icon key.
        if (key.includes('_light')) {
          const darkKey = key.replace('_light', '');
          const darkFolder = folders.defs[darkKey];
          const darkFolderOpen = folders.defs[`${darkKey}_open`];

          darkFolderIcons[dirName] = {
            collapsed: this.toIconFolderPath(darkFolder.iconPath),
            expanded: this.toIconFolderPath(darkFolderOpen.iconPath),
          };
        } else {
          // no light version, so both themes use the same icon paths
          darkFolderIcons[dirName] = lightFolderIcons[dirName];
        }
      },
    );

    darkSchema.named_directory_icons = darkFolderIcons;
    lightSchema.named_directory_icons = lightFolderIcons;

    return schema;
  }

  private static buildFiles(
    files: types.IFileCollection,
    hasDefaultLightFile: boolean,
    options?: 'officialIcons' | 'angularIcons' | 'nestIcons',
  ): Promise<types.IBuildFiles> {
    const sts = constants.iconsManifest;

    let collection: types.IFileExtension[];

    const officialFilter = (file: types.IFileExtension): boolean =>
      file.icon &&
      (!file.disabled ||
        (file.icon.endsWith('_official') && file.icon !== 'json_official'));

    const angularFilter = (file: types.IFileExtension): boolean =>
      file.icon &&
      (!file.disabled ||
        (file.icon.startsWith('ng_') && !file.icon.endsWith('2')));

    const nestFilter = (file: types.IFileExtension): boolean =>
      file.icon && (!file.disabled || file.icon.startsWith('nest_'));

    switch (options) {
      case 'officialIcons':
        collection = files.supported.filter(officialFilter);
        break;

      case 'angularIcons':
        collection = files.supported.filter(
          (file: types.IFileExtension): boolean =>
            officialFilter(file) || angularFilter(file),
        );
        break;

      case 'nestIcons':
        collection = files.supported.filter(
          (file: types.IFileExtension): boolean =>
            officialFilter(file) || nestFilter(file),
        );
        break;

      default:
        collection = files.supported.filter(
          (file: types.IFileExtension): boolean =>
            !file.disabled && !!file.icon,
        );
        break;
    }

    return sortedUniq(
      sortBy(collection, (item: types.IFileExtension): string => item.icon),
    ).reduce(
      async (previous, current): Promise<types.IBuildFiles> => {
        const old = await previous;
        const defs = old.defs;
        const names = old.names;
        const language = old.language;
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
          const assignLanguages = (
            langId: string,
            lang: types.ILanguage,
          ): void => {
            language.languageIds[langId] = iconFileDefinition;
            // assign known extensions and filenames
            lang.knownExtensions?.forEach((ext: string): void => {
              language.fileExtensions[ext] = iconFileDefinition;
            });
            lang.knownFilenames?.forEach((name: string): void => {
              language.fileNames[name] = iconFileDefinition;
            });
          };

          const assignLanguagesLight = (
            langId: string,
            lang: types.ILanguage,
          ): void => {
            const iconDef = hasLightVersion
              ? iconFileLightDefinition
              : iconFileDefinition;
            light.language.languageIds[langId] = iconDef;
            // assign known extensions and filenames
            lang.knownExtensions?.forEach((ext: string): void => {
              light.language.fileExtensions[ext] = iconDef;
            });
            lang.knownFilenames?.forEach((name: string): void => {
              light.language.fileNames[name] = iconDef;
            });
          };

          current.languages.forEach((lang: types.ILanguage): void => {
            if (Array.isArray(lang.ids)) {
              lang.ids.forEach((id: string): void => {
                assignLanguages(id, lang);
                assignLanguagesLight(id, lang);
              });
            } else {
              assignLanguages(lang.ids, lang);
              assignLanguagesLight(lang.ids, lang);
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
      Promise.resolve<types.IBuildFiles>({
        defs: {},
        names: { fileExtensions: {}, fileNames: {} },
        light: {
          fileExtensions: {},
          fileNames: {},
          language: { fileExtensions: {}, fileNames: {}, languageIds: {} },
        },
        language: { fileExtensions: {}, fileNames: {}, languageIds: {} },
      }),
    );
  }

  private static buildFolders(
    folders: types.IFolderCollection,
    hasDefaultLightFolder: boolean,
    officialIcons = false,
  ): Promise<types.IBuildFolders> {
    const sts = constants.iconsManifest;
    const collection = officialIcons
      ? folders.supported.filter(
          (folder: types.IFolderExtension): boolean =>
            folder.icon &&
            (!folder.disabled ||
              (folder.icon.endsWith('_official') &&
                folder.icon !== 'json_official')),
        )
      : folders.supported.filter(
          (folder: types.IFolderExtension): boolean =>
            !folder.disabled && !!folder.icon,
        );
    return sortBy(
      collection,
      (item: types.IFolderExtension): string => item.icon,
    ).reduce(
      async (previous, current): Promise<types.IBuildFolders> => {
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

        current.extensions.forEach((extension: string): void => {
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
      return this.iconsRelativeDirPathFromSourceDir;
    }
    const absPath = Utils.pathUnixJoin(
      this.customIconDirPath,
      constants.extension.customIconFolderName,
    );
    const hasCustomIcon = await this.hasCustomIcon(absPath, filename);
    if (!hasCustomIcon) {
      return this.iconsRelativeDirPathFromSourceDir;
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
