import { cloneDeep, sortBy, sortedUniq } from 'lodash';
import { existsAsync } from '../common/fsAsync';
import { ConfigManager } from '../configuration/configManager';
import { constants } from '../constants';
import * as models from '../models';
import {
  schema as defaultSchema,
  zedSchema as defaultZedSchema,
} from '../models/iconsManifest';
import { Utils } from '../utils';

export class ManifestBuilder {
  private static iconsDirRelativeBasePath: string;
  private static customIconDirPath: string;

  public static async buildManifest(
    files: models.IFileCollection,
    folders: models.IFolderCollection,
    customIconsDirPath?: string,
  ): Promise<models.IIconManifest> {
    this.customIconDirPath = customIconsDirPath;
    this.iconsDirRelativeBasePath = await Utils.getRelativePath(
      ConfigManager.sourceDir,
      ConfigManager.iconsDir,
    );

    const vscSchema = cloneDeep(defaultSchema);
    const zedSchema = cloneDeep(defaultZedSchema);
    const vscDefs = vscSchema.iconDefinitions;

    // set default icons for dark theme
    // vscode only
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

    // common
    const defaultFolderIconPath = await this.buildDefaultIconPath(
      folders.default.folder,
      vscDefs._folder,
      true,
      false,
    );

    const defaultOpenFolderIconPath = await this.buildDefaultIconPath(
      folders.default.folder,
      vscDefs._folder_open,
      true,
      true,
    );

    vscDefs._folder.iconPath = defaultFolderIconPath;
    vscDefs._folder_open.iconPath = defaultOpenFolderIconPath;

    const zedFolderIconPath = this.toZedPath(defaultFolderIconPath);
    const zedOpenFolderIconPath = this.toZedPath(defaultOpenFolderIconPath);

    for (let i = 0; i < 4; i++) {
      zedSchema.themes[i].directory_icons.collapsed = zedFolderIconPath;
      zedSchema.themes[i].directory_icons.expanded = zedOpenFolderIconPath;
    }

    // set default icons for light theme
    // default file and folder related icon paths if not set,
    // inherit their icons from dark theme.
    // The icon paths should not be set unless there is a specific icon for them.
    // If the icon paths get set then they override the dark theme section
    // and light icons definitions have to be specified for each extension
    // and populate the light section, otherwise they inherit from dark theme
    // and only those in 'light' section get overridden.

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

    // common
    const defaultFolderLightIconPath = await this.buildDefaultIconPath(
      folders.default.folder_light,
      vscDefs._folder_light,
      true,
      false,
    );

    const defaultOpenFolderLightIconPath = await this.buildDefaultIconPath(
      folders.default.folder_light,
      vscDefs._folder_light_open,
      true,
      true,
    );

    vscDefs._folder_light.iconPath = defaultFolderLightIconPath;
    vscDefs._folder_light_open.iconPath = defaultOpenFolderLightIconPath;

    for (let i = 4; i < 8; i++) {
      zedSchema.themes[i].directory_icons.collapsed =
        this.toZedPath(defaultFolderLightIconPath) ||
        zedSchema.themes[0].directory_icons.collapsed;
      zedSchema.themes[i].directory_icons.expanded =
        this.toZedPath(defaultOpenFolderLightIconPath) ||
        zedSchema.themes[0].directory_icons.expanded;
    }

    // set the rest of the schema
    const finalManifest = await this.buildJsonStructure(
      files,
      folders,
      vscSchema,
      zedSchema,
    );

    return finalManifest;
  }

  private static toZedPath(iconPath: string): string {
    return iconPath.replace(/^.*?(\/icons\/)/, './icons/');
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
    vscSchema: models.IIconSchema,
    zedSchema: models.IZedIconSchema,
  ): Promise<models.IIconManifest> {
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

    // zed has several themes:
    // DARK:
    //    [0] dark,
    //    [1] official dark,
    //    [2] angular official dark,
    //    [3] nest official dark,
    // LIGHT:
    //    [4] light,
    //    [5] official light,
    //    [6] angular official light,
    //    [7] nest official light
    let zedFinalSchema = this.buildZedJsonStructure(
      resFiles,
      resFolders,
      zedSchema,
      [0, 4],
    );

    zedFinalSchema = this.buildZedJsonStructure(
      resFilesOfficial,
      resFoldersOfficial,
      zedFinalSchema,
      [1, 5],
    );

    zedFinalSchema = this.buildZedJsonStructure(
      resFilesAngular,
      resFoldersOfficial,
      zedFinalSchema,
      [2, 6],
    );

    zedFinalSchema = this.buildZedJsonStructure(
      resFilesNest,
      resFoldersOfficial,
      zedFinalSchema,
      [3, 7],
    );

    return { vscode: vscFinalSchema, zed: zedFinalSchema };
  }

  private static buildVSCJsonStructure(
    files: models.IBuildFiles,
    folders: models.IBuildFolders,
    schema: models.IIconSchema,
  ): models.IIconSchema {
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
    files: models.IBuildFiles,
    folders: models.IBuildFolders,
    schema: models.IZedIconSchema,
    themePosition: [number, number],
  ): models.IZedIconSchema {
    const darkSchema = schema.themes[themePosition[0]];
    const lightSchema = schema.themes[themePosition[1]];

    // zed file icons
    const darkFileIcons: models.IZedFileIcons = {};
    const lightFileIcons: models.IZedFileIcons = {};

    Object.entries(files.defs).forEach(([key, def]) => {
      const iconDef = def as models.IIconPath;
      darkFileIcons[key] = { path: this.toZedPath(iconDef.iconPath) };
      lightFileIcons[key] = { path: this.toZedPath(iconDef.iconPath) };
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
    const darkFolderIcons: models.IZedFolderIcons = {};
    const lightFolderIcons: models.IZedFolderIcons = {};

    Object.entries(folders.light.folderNames).forEach(([dirName, key]) => {
      const fd = folders.defs[key] as models.IIconPath;
      const fdOpen = folders.defs[`${key}_open`] as models.IIconPath;

      lightFolderIcons[dirName] = {
        collapsed: this.toZedPath(fd.iconPath),
        expanded: this.toZedPath(fdOpen.iconPath),
      };

      // if we have a light version icon, we need to find the dark version icon key.
      if (key.includes('_light')) {
        const darkKey = key.replace('_light', '');
        const darkFd = folders.defs[darkKey] as models.IIconPath;
        const darkFdOpen = folders.defs[`${darkKey}_open`] as models.IIconPath;

        darkFolderIcons[dirName] = {
          collapsed: this.toZedPath(darkFd.iconPath),
          expanded: this.toZedPath(darkFdOpen.iconPath),
        };
      } else {
        // no light version, so both themes use the same icon paths
        darkFolderIcons[dirName] = lightFolderIcons[dirName];
      }
    });

    darkSchema.named_directory_icons = darkFolderIcons;
    lightSchema.named_directory_icons = lightFolderIcons;

    return schema;
  }

  private static buildFiles(
    files: models.IFileCollection,
    hasDefaultLightFile: boolean,
    options?: 'officialIcons' | 'angularIcons' | 'nestIcons',
  ): Promise<models.IBuildFiles> {
    const sts = constants.iconsManifest;

    let collection = files.supported;

    const officialFilter = (f: models.IFileExtension): boolean =>
      f.icon &&
      (!f.disabled ||
        (f.icon.endsWith('_official') && f.icon !== 'json_official'));

    const angularFilter = (f: models.IFileExtension): boolean =>
      f.icon &&
      (!f.disabled || (f.icon.startsWith('ng_') && !f.icon.endsWith('2')));

    const nestFilter = (f: models.IFileExtension): boolean =>
      f.icon && (!f.disabled || f.icon.startsWith('nest_'));

    switch (options) {
      case 'officialIcons':
        collection = files.supported.filter(officialFilter);
        break;

      case 'angularIcons':
        collection = files.supported.filter(
          f => officialFilter(f) || angularFilter(f),
        );
        break;

      case 'nestIcons':
        collection = files.supported.filter(
          f => officialFilter(f) || nestFilter(f),
        );
        break;

      default:
        collection = files.supported.filter(f => !f.disabled && f.icon);
        break;
    }

    return sortedUniq(
      sortBy(collection, (item: models.IFileExtension) => item.icon),
    ).reduce(
      async (previous, current): Promise<models.IBuildFiles> => {
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
            lang: models.ILanguage,
          ): void => {
            language.languageIds[langId] = iconFileDefinition;
            // assign known extensions and filenames
            lang.knownExtensions?.forEach(ext => {
              language.fileExtensions[ext] = iconFileDefinition;
            });
            lang.knownFilenames?.forEach(name => {
              language.fileNames[name] = iconFileDefinition;
            });
          };

          const assignLanguagesLight = (
            langId: string,
            lang: models.ILanguage,
          ): void => {
            const iconDef = hasLightVersion
              ? iconFileLightDefinition
              : iconFileDefinition;
            light.language.languageIds[langId] = iconDef;
            // assign known extensions and filenames
            lang.knownExtensions?.forEach(ext => {
              light.language.fileExtensions[ext] = iconDef;
            });
            lang.knownFilenames?.forEach(name => {
              light.language.fileNames[name] = iconDef;
            });
          };

          current.languages.forEach((lang: models.ILanguage): void => {
            if (Array.isArray(lang.ids)) {
              lang.ids.forEach((id: string) => {
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
      Promise.resolve({
        defs: {},
        names: { fileExtensions: {}, fileNames: {} },
        light: {
          fileExtensions: {},
          fileNames: {},
          language: { fileExtensions: {}, fileNames: {}, languageIds: {} },
        },
        language: { fileExtensions: {}, fileNames: {}, languageIds: {} },
      } as models.IBuildFiles),
    );
  }

  private static buildFolders(
    folders: models.IFolderCollection,
    hasDefaultLightFolder: boolean,
    officialIcons = false,
  ): Promise<models.IBuildFolders> {
    const sts = constants.iconsManifest;
    const collection = officialIcons
      ? folders.supported.filter(
          f =>
            f.icon &&
            (!f.disabled ||
              (f.icon.endsWith('_official') && f.icon !== 'json_official')),
        )
      : folders.supported.filter(f => !f.disabled && f.icon);
    return sortBy(
      collection,
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
