import * as fs from 'fs';
import * as path from 'path';
import * as _ from 'lodash';
import { SettingsManager } from '../settings';
import * as utils from '../utils';
import * as models from '../models';
import * as packageJson from '../../../package.json';

export class IconGenerator implements models.IIconGenerator {
  public settings: models.ISettings;

  public iconsFolderBasePath: string;

  private iconsFolderPath: string;
  private manifestFolderPath: string;

  constructor(
    vscode: models.IVSCode,
    private defaultSchema: models.IIconSchema,
    private configCustomIconFolderPath?: string,
    private avoidCustomDetection: boolean = false) {
    this.settings = new SettingsManager(vscode).getSettings();
    // relative to this file
    this.iconsFolderPath = path.join(__dirname, '../../../', 'icons');
    this.manifestFolderPath = path.join(__dirname, '../../../', 'out/src');
    this.iconsFolderBasePath = utils.getRelativePath(this.manifestFolderPath, this.iconsFolderPath);
  }

  public generateJson(
    files: models.IFileCollection,
    folders: models.IFolderCollection): models.IIconSchema {
    const schema = _.cloneDeep(this.defaultSchema);
    const defs = schema.iconDefinitions;

    // set default icons for dark theme
    defs._file.iconPath =
      this.buildDefaultIconPath(files.default.file, defs._file, false);
    defs._folder.iconPath =
      this.buildDefaultIconPath(folders.default.folder, defs._folder, false);
    defs._folder_open.iconPath =
      this.buildDefaultIconPath(folders.default.folder, defs._folder_open, true);
    defs._root_folder.iconPath =
      this.buildDefaultIconPath(folders.default.root_folder, defs._root_folder, false);
    defs._root_folder_open.iconPath =
      this.buildDefaultIconPath(folders.default.root_folder, defs._root_folder_open, true);

    // set default icons for light theme
    // default file and folder related icon paths if not set,
    // inherit their icons from dark theme.
    // The icon paths should not be set unless there is a specific icon for them.
    // If the icon paths get set then they override the dark theme section
    // and light icons definitions have to be specified for each extension
    // and populate the light section, otherwise they inherit from dark theme
    // and only those in 'light' section get overriden.
    defs._file_light.iconPath =
      this.buildDefaultIconPath(files.default.file_light, defs._file_light, false);
    defs._folder_light.iconPath =
      this.buildDefaultIconPath(folders.default.folder_light, defs._folder_light, false);
    defs._folder_light_open.iconPath =
      this.buildDefaultIconPath(folders.default.folder_light, defs._folder_light_open, true);
    defs._root_folder_light.iconPath =
      this.buildDefaultIconPath(folders.default.root_folder_light, defs._root_folder_light, false);
    defs._root_folder_light_open.iconPath =
      this.buildDefaultIconPath(folders.default.root_folder_light, defs._root_folder_light_open, true);

    // set the rest of the schema
    return this.buildJsonStructure(files, folders, schema);
  }

  public persist(
    iconsFilename: string,
    json: models.IIconSchema,
    updatePackageJson: boolean = false): void {
    if (iconsFilename == null) {
      throw new Error('iconsFilename not defined.');
    }
    this.writeJsonToFile(json, iconsFilename, this.manifestFolderPath);
    if (updatePackageJson) {
      const iconsFolderRelativePath = `${utils.getRelativePath('.', this.manifestFolderPath)}${iconsFilename}`;
      this.updatePackageJson(iconsFolderRelativePath);
    }
  }

  public hasCustomIcon(customIconFolderPath: string, filename: string): boolean {
    const relativePath = utils.getRelativePath('.', customIconFolderPath, false);
    const filePath = utils.pathUnixJoin(relativePath, filename);
    return fs.existsSync(filePath);
  }

  public getIconPath(filename: string): string {
    if (this.avoidCustomDetection) {
      return this.iconsFolderBasePath;
    }
    const customIconFolderPath = (this.configCustomIconFolderPath && this.configCustomIconFolderPath.trim()) ||
      this.settings.vscodeAppData;
    const absPath = path.join(customIconFolderPath, this.settings.extensionSettings.customIconFolderName);
    if (!this.hasCustomIcon(absPath, filename)) {
      return this.iconsFolderBasePath;
    }
    const sanitizedFolderPath =
      utils.belongToSameDrive(absPath, this.manifestFolderPath)
        ? this.manifestFolderPath
        : utils.overwriteDrive(absPath, this.manifestFolderPath);
    return utils.getRelativePath(sanitizedFolderPath, absPath, false);
  }

  public writeJsonToFile(json: models.IIconSchema, iconsFilename: string, outDir: string) {
    try {
      if (!fs.existsSync(outDir)) {
        fs.mkdirSync(outDir);
      }

      fs.writeFileSync(path.join(outDir, iconsFilename), JSON.stringify(json, null, 2));
      // tslint:disable-next-line no-console
      console.info('Icons manifest file successfully generated!');
    } catch (error) {
      console.error('Something went wrong while generating the icon contribution file:', error);
    }
  }

  public updatePackageJson(iconsFolderPath: string) {
    const oldIconsThemesFolderPath = packageJson.contributes.iconThemes[0].path;

    if (!oldIconsThemesFolderPath || (oldIconsThemesFolderPath === iconsFolderPath)) {
      return;
    }

    packageJson.contributes.iconThemes[0].path = iconsFolderPath;

    try {
      fs.writeFileSync('./package.json', JSON.stringify(packageJson, null, 2));
      // tslint:disable-next-line no-console
      console.info('package.json updated');
    } catch (err) {
      console.error(err);
    }
  }

  private buildFolders(
    folders: models.IFolderCollection,
    hasDefaultLightFolder: boolean) {
    const sts = this.settings.extensionSettings;
    return _.sortBy(folders.supported.filter(x => !x.disabled && x.icon), item => item.icon)
      .reduce((old, current) => {
        const defs = old.defs;
        const names = old.names;
        const light = old.light;
        const icon = current.icon;
        const hasLightVersion = current.light;
        const iconFolderType = `${sts.folderPrefix}${icon}`;
        const iconFolderLightType = `${sts.folderLightPrefix}${icon}`;
        const iconFileExtension = utils.fileFormatToString(current.format);
        const folderName =
          `${hasLightVersion
            ? iconFolderLightType
            : iconFolderType}${sts.iconSuffix}${iconFileExtension}`;
        const openFolderName =
          `${hasLightVersion
            ? iconFolderLightType
            : iconFolderType}_opened${sts.iconSuffix}${iconFileExtension}`;
        const folderIconPath = this.getIconPath(folderName);
        const openFolderIconPath = this.getIconPath(openFolderName);
        const folderPath = utils.pathUnixJoin(folderIconPath, iconFolderType);
        const folderLightPath = utils.pathUnixJoin(folderIconPath, iconFolderLightType);
        const openFolderPath = `${folderPath}_opened`;
        const openFolderLightPath = `${folderLightPath}_opened`;
        const iconFolderDefinition = `${sts.manifestFolderPrefix}${icon}`;
        const iconFolderLightDefinition = `${sts.manifestFolderLightPrefix}${icon}`;
        const iconOpenFolderDefinition = `${iconFolderDefinition}_open`;
        const iconOpenFolderLightDefinition = `${iconFolderLightDefinition}_open`;

        if (folderIconPath !== openFolderIconPath) {
          throw new Error(`Folder icons for '${icon}' must be placed in the same directory`);
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

        current.extensions.forEach(extension => {
          const key = extension;
          names.folderNames[key] = iconFolderDefinition;
          names.folderNamesExpanded[key] = iconOpenFolderDefinition;
          light.folderNames[key] = hasLightVersion ? iconFolderLightDefinition : iconFolderDefinition;
          light.folderNamesExpanded[key] = hasLightVersion ? iconOpenFolderLightDefinition : iconOpenFolderDefinition;
        });

        return old;
      }, {
        defs: {},
        names: { folderNames: {}, folderNamesExpanded: {} },
        light: { folderNames: {}, folderNamesExpanded: {} },
      });
  }

  private buildFiles(
    files: models.IFileCollection,
    hasDefaultLightFile: boolean) {
    const sts = this.settings.extensionSettings;
    return _.sortedUniq(_.sortBy(files.supported.filter(x => !x.disabled && x.icon), item => item.icon))
      .reduce((old, current) => {
        const defs = old.defs;
        const names = old.names;
        const languageIds = old.languageIds;
        const light = old.light;
        const icon = current.icon;
        const hasLightVersion = current.light;
        const iconFileType = `${sts.filePrefix}${icon}`;
        const iconFileLightType = `${sts.fileLightPrefix}${icon}`;
        const iconFileExtension = utils.fileFormatToString(current.format);
        const filename =
          `${hasLightVersion
            ? iconFileLightType
            : iconFileType}${sts.iconSuffix}${iconFileExtension}`;
        const fileIconPath = this.getIconPath(filename);
        const filePath = utils.pathUnixJoin(fileIconPath, iconFileType);
        const fileLightPath = utils.pathUnixJoin(fileIconPath, iconFileLightType);
        const iconFileDefinition = `${sts.manifestFilePrefix}${icon}`;
        const iconFileLightDefinition = `${sts.manifestFileLightPrefix}${icon}`;
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
            light.languageIds[langId] = hasLightVersion ? iconFileLightDefinition : iconFileDefinition;
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

        current.extensions.forEach(extension => {
          if (isFilename) {
            names.fileNames[extension] = iconFileDefinition;
            light.fileNames[extension] = hasLightVersion ? iconFileLightDefinition : iconFileDefinition;
          } else {
            const noDotExtension = utils.removeFirstDot(extension);
            names.fileExtensions[noDotExtension] = iconFileDefinition;
            light.fileExtensions[noDotExtension] = hasLightVersion ? iconFileLightDefinition : iconFileDefinition;
          }
        });

        return old;
      }, {
        defs: {},
        names: { fileExtensions: {}, fileNames: {} },
        light: { fileExtensions: {}, fileNames: {}, languageIds: {} },
        languageIds: {},
      });
  }

  private buildDefaultIconPath(
    defaultExtension: models.IDefaultExtension,
    schemaExtension: models.IIconPath,
    isOpenFolder: boolean): string {
    if (!defaultExtension || defaultExtension.disabled) { return schemaExtension.iconPath || ''; }
    const defPrefix = this.settings.extensionSettings.defaultExtensionPrefix;
    const openSuffix = isOpenFolder ? '_opened' : '';
    const iconSuffix = this.settings.extensionSettings.iconSuffix;
    const icon = defaultExtension.icon;
    const format = defaultExtension.format;
    const filename = `${defPrefix}${icon}${openSuffix}${iconSuffix}${utils.fileFormatToString(format)}`;
    const fPath = this.getIconPath(filename);

    return utils.pathUnixJoin(fPath, filename);
  }

  private buildJsonStructure(
    files: models.IFileCollection,
    folders: models.IFolderCollection,
    schema: models.IIconSchema): models.IIconSchema {
    // check for light files & folders
    const hasDefaultLightFolder =
      schema.iconDefinitions._folder_light.iconPath != null &&
      schema.iconDefinitions._folder_light.iconPath !== '';
    const hasDefaultLightFile =
      schema.iconDefinitions._file_light.iconPath != null &&
      schema.iconDefinitions._file_light.iconPath !== '';
    const res = {
      // folders section
      folders: this.buildFolders(folders, hasDefaultLightFolder),
      //  files section
      files: this.buildFiles(files, hasDefaultLightFile),
    };
    // map structure to the schema
    schema.iconDefinitions = { ...schema.iconDefinitions, ...res.folders.defs, ...res.files.defs };
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
}
