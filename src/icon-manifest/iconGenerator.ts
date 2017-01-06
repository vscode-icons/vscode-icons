import * as fs from 'fs';
import * as path from 'path';
import * as _ from 'lodash';

import { SettingsManager } from '../settings';
import { pathUnixJoin, fileFormatToString } from '../utils';
import { schema } from './defaultSchema';
import {
  FileFormat,
  IExtension,
  IIconGenerator,
  IVSCode,
  IIconSchema,
  ISettings,
  ISettingsManager,
  IFolderCollection,
  IFileCollection,
  IDefaultExtension,
  IIconPath,
} from '../models';

// tslint:disable-next-line no-var-requires
const packageJson = require('../../../package.json');

export class IconGenerator implements IIconGenerator {
  private settingsManager: ISettingsManager;
  private iconsFolderPath: string;
  private manifestFolderPath: string;
  private settings: ISettings;

  constructor(private vscode: IVSCode, private defaultSchema: IIconSchema) {
    this.settingsManager = new SettingsManager(vscode);
    this.settings = this.settingsManager.getSettings();
    // relative to this file
    this.iconsFolderPath = path.join(__dirname, '../../../icons');
    this.manifestFolderPath = path.join(__dirname, '../../../out/src');
  }

  public generateJson(
    files: IFileCollection,
    folders: IFolderCollection,
    outDir: string = null): IIconSchema {
    const outputDir = this.cleanOutDir(outDir || this.manifestFolderPath);
    const iconsFolderBasePath = this.getRelativePath(outputDir, this.iconsFolderPath);
    return this.fillDefaultSchema(files, folders, iconsFolderBasePath, this.defaultSchema);
  }

  public persist(
    iconsFilename: string,
    json: IIconSchema,
    outDir?: string,
    updatePackageJson?: boolean): void {
    const outputDir = this.cleanOutDir(outDir || this.manifestFolderPath);
    if (iconsFilename == null) {
      throw new Error('iconsFilename not defined.');
    }
    this.writeJsonToFile(json, iconsFilename, outputDir);
    if (updatePackageJson) {
      const pathForPackageJson = `${this.cleanOutDir(this.getRelativePath('.', outputDir))}${iconsFilename}`;
      this.updatePackageJson(pathForPackageJson);
    }
  }

  private buildFolders(
    folders: IFolderCollection,
    iconsFolderBasePath: string = '',
    hasDefaultLightFolder: boolean = false) {
    if (!iconsFolderBasePath) { iconsFolderBasePath = ''; }
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
        const iconFileExtension = fileFormatToString(current.format);
        const foldername =
          `${hasLightVersion
            ? iconFolderLightType
            : iconFolderType}
            ${sts.iconSuffix}${iconFileExtension}`;
        const openfoldername =
          `${hasLightVersion
            ? iconFolderLightType
            : iconFolderType}_opened${sts.iconSuffix}${iconFileExtension}`;
        const fPath = this.getIconPath(iconsFolderBasePath, foldername) &&
          this.getIconPath(iconsFolderBasePath, openfoldername);
        const folderPath = pathUnixJoin(fPath, iconFolderType);
        const folderLightPath = pathUnixJoin(fPath, iconFolderLightType);
        const openFolderPath = `${folderPath}_opened`;
        const openFolderLightPath = `${folderLightPath}_opened`;
        const iconFolderDefinition = `${sts.manifestFolderPrefix}${icon}`;
        const iconFolderLightDefinition = `${sts.manifestFolderLightPrefix}${icon}`;
        const iconOpenFolderDefinition = `${iconFolderDefinition}_open`;
        const iconOpenFolderLightDefinition = `${iconFolderLightDefinition}_open`;

        defs[iconFolderDefinition] = {
          iconPath: folderPath + sts.iconSuffix + iconFileExtension,
        };
        defs[iconOpenFolderDefinition] = {
          iconPath: openFolderPath + sts.iconSuffix + iconFileExtension,
        };

        if (hasDefaultLightFolder && !hasLightVersion) {
          defs[iconFolderLightDefinition] = {
            iconPath: folderPath + sts.iconSuffix + iconFileExtension,
          };
          defs[iconOpenFolderLightDefinition] = {
            iconPath: openFolderPath + sts.iconSuffix + iconFileExtension,
          };
        }

        if (hasLightVersion) {
          defs[iconFolderLightDefinition] = {
            iconPath: folderLightPath + sts.iconSuffix + iconFileExtension,
          };
          defs[iconOpenFolderLightDefinition] = {
            iconPath: openFolderLightPath + sts.iconSuffix + iconFileExtension,
          };
        }

        current.extensions.forEach(extension => {
          const key = extension;
          names.folderNames[key] = iconFolderDefinition;
          names.folderNamesExpanded[key] = iconOpenFolderDefinition;

          if (hasDefaultLightFolder && !hasLightVersion) {
            light.folderNames[key] = iconFolderDefinition;
            light.folderNamesExpanded[key] = iconOpenFolderDefinition;
          }

          if (hasLightVersion) {
            light.folderNames[key] = iconFolderLightDefinition;
            light.folderNamesExpanded[key] = iconOpenFolderLightDefinition;
          }
        });

        return old;
      }, {
        defs: {},
        names: { folderNames: {}, folderNamesExpanded: {} },
        light: { folderNames: {}, folderNamesExpanded: {} },
      });
  }

  private buildFiles(
    files: IFileCollection,
    iconsFolderBasePath: string = '',
    hasDefaultLightFile: boolean = false) {
    if (!iconsFolderBasePath) { iconsFolderBasePath = ''; }
    const sts = this.settings.extensionSettings;
    const suffix = sts.iconSuffix;
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
        const iconFileExtension = fileFormatToString(current.format);
        const filename =
          `${hasLightVersion ? iconFileLightType : iconFileType}${sts.iconSuffix}${iconFileExtension}`;
        const fPath = this.getIconPath(iconsFolderBasePath, filename);
        const filePath = pathUnixJoin(fPath, iconFileType);
        const fileLightPath = pathUnixJoin(fPath, iconFileLightType);
        const iconFileDefinition = `${sts.manifestFilePrefix}${icon}`;
        const iconFileLightDefinition = `${sts.manifestFileLightPrefix}${icon}`;
        const isFilename = current.filename;

        defs[iconFileDefinition] = {
          iconPath: filePath + sts.iconSuffix + iconFileExtension,
        };

        if (hasDefaultLightFile && !hasLightVersion) {
          defs[iconFileLightDefinition] = {
            iconPath: filePath + sts.iconSuffix + iconFileExtension,
          };
        }

        if (hasLightVersion) {
          defs[iconFileLightDefinition] = {
            iconPath: fileLightPath + sts.iconSuffix + iconFileExtension,
          };
        }

        if (current.languages) {
          const assignLanguages = langId => {
            languageIds[langId] = iconFileDefinition;
          };

          current.languages.forEach(langIds => {
            if (Array.isArray(langIds.ids)) {
              langIds.ids.forEach(id => { assignLanguages(id); });
            } else {
              assignLanguages(langIds.ids);
            }
          });
        }

        current.extensions.forEach(extension => {
          if (isFilename) {
            names.fileNames[extension] = iconFileDefinition;

            if (hasDefaultLightFile && !hasLightVersion) {
              light.fileNames[extension] = iconFileDefinition;
            }

            if (hasLightVersion) {
              light.fileNames[extension] = iconFileLightDefinition;
            }
          } else {
            names.fileExtensions[this.removeFirstDot(extension)] = iconFileDefinition;

            if (hasDefaultLightFile && !hasLightVersion) {
              light.fileExtensions[this.removeFirstDot(extension)] = iconFileDefinition;
            }

            if (hasLightVersion) {
              light.fileExtensions[this.removeFirstDot(extension)] = iconFileLightDefinition;
            }
          }
        });

        return old;
      }, {
        defs: {},
        names: { fileExtensions: {}, fileNames: {} },
        light: { fileExtensions: {}, fileNames: {} },
        languageIds: {},
      });
  }

  private getRelativePath(fromDirPath: string, toDirName: string, checkDirectory: boolean = true): string {
    if (toDirName == null) {
      throw new Error('toDirName not defined.');
    }

    if (fromDirPath == null) {
      throw new Error('fromDirPath not defined.');
    }

    if (checkDirectory && !fs.existsSync(toDirName)) {
      throw new Error('Directory \'' + toDirName + '\' not found.');
    }

    const relativePath = path.relative(fromDirPath, toDirName).replace(/\\/g, '/');

    return './' + relativePath + (toDirName.endsWith('/') ? '' : '/');
  }

  private removeFirstDot(txt: string): string {
    return txt.indexOf('.') === 0 ? txt.substring(1, txt.length) : txt;
  }

  private buildIconPath(
    defaultExtension: IDefaultExtension,
    schemaExtension: IIconPath,
    iconsFolderBasePath: string,
    isOpenFolder: boolean): string {
    if (!defaultExtension || defaultExtension.disabled) { return schemaExtension.iconPath || ''; }
    const defPrefix = this.settings.extensionSettings.defaultExtensionPrefix;
    const openSuffix = isOpenFolder ? '_opened' : '';
    const iconSuffix = this.settings.extensionSettings.iconSuffix;
    const icon = defaultExtension.icon;
    const format = defaultExtension.format;
    const filename = `${defPrefix}${icon}${openSuffix}${iconSuffix}${fileFormatToString(format)}`;
    const fPath = this.getIconPath(iconsFolderBasePath, filename);

    return pathUnixJoin(fPath, filename);
  }

  private hasCustomIcon(filename: string): boolean {
    const relativePath = this.getRelativePath('.', this.settings.extensionSettings.customIconFolderName, false);
    const fpath = path.posix.join(relativePath, filename);
    return fs.existsSync(fpath);
  }

  private fillDefaultSchema(
    files: IFileCollection,
    folders: IFolderCollection,
    iconsFolderBasePath: string,
    defaultSchema: IIconSchema): IIconSchema {
    const schema = _.cloneDeep(defaultSchema);
    const defs = schema.iconDefinitions;
    // set default icons
    defs._file.iconPath =
      this.buildIconPath(files.default.file, defs._file, iconsFolderBasePath, false);
    defs._folder.iconPath =
      this.buildIconPath(folders.default.folder, defs._folder, iconsFolderBasePath, false);
    defs._folder_open.iconPath =
      this.buildIconPath(folders.default.folder, defs._folder_open, iconsFolderBasePath, true);
    // light theme
    // default file and folder related icon paths if not set,
    // inherit their icons from dark theme.
    // The icon paths should not be set unless there is a specific icon for them.
    // If the icon paths get set then they override the dark theme section
    // and light icons definitions have to be specified for each extension
    // and populate the light section, otherwise they inherit from dark theme
    // and only those in 'light' section get overriden.
    defs._file_light.iconPath =
      this.buildIconPath(files.default.file_light, defs._file_light, iconsFolderBasePath, false);
    defs._folder_light.iconPath =
      this.buildIconPath(folders.default.folder_light, defs._folder_light, iconsFolderBasePath, false);
    defs._folder_light_open.iconPath =
      this.buildIconPath(folders.default.folder_light, defs._folder_light_open, iconsFolderBasePath, true);
    // set the rest of the schema
    return this.buildJsonStructure(files, folders, iconsFolderBasePath, schema);
  }

  private buildJsonStructure(
    files: IFileCollection,
    folders: IFolderCollection,
    iconsFolderBasePath: string,
    schema: IIconSchema): IIconSchema {
    // check for light files & folders
    const hasDefaultLightFolder =
      schema.iconDefinitions._folder_light.iconPath != null &&
      schema.iconDefinitions._folder_light.iconPath !== '';
    const hasDefaultLightFile =
      schema.iconDefinitions._file_light.iconPath != null &&
      schema.iconDefinitions._file_light.iconPath !== '';
    const res = {
      // folders section
      folders: this.buildFolders(folders, iconsFolderBasePath, hasDefaultLightFolder),
      //  files section 
      files: this.buildFiles(files, iconsFolderBasePath, hasDefaultLightFile),
    };
    // map structure to the schema
    schema.iconDefinitions = Object.assign({}, schema.iconDefinitions, res.folders.defs, res.files.defs);
    schema.folderNames = res.folders.names.folderNames;
    schema.folderNamesExpanded = res.folders.names.folderNamesExpanded;
    schema.fileExtensions = res.files.names.fileExtensions;
    schema.fileNames = res.files.names.fileNames;
    schema.languageIds = res.files.languageIds;
    schema.light.folderNames = res.folders.light.folderNames;
    schema.light.folderNamesExpanded = res.folders.light.folderNamesExpanded;
    schema.light.fileExtensions = res.files.light.fileExtensions;
    schema.light.fileNames = res.files.light.fileNames;
    return schema;
  }

  private getIconPath(defaultPath: string, filename: string): string {
    const isCustom = this.hasCustomIcon(filename);
    if (isCustom) {
      const absPath = path.join(this.settingsManager.getSettings().vscodeAppData,
        this.settings.extensionSettings.customIconFolderName);
      return this.getRelativePath(this.manifestFolderPath, absPath, false);
    }
    return defaultPath;
  }

  private cleanOutDir(outDir: string) {
    let outputDir = outDir;

    if (outputDir == null) {
      outputDir = './';
    }

    if (!outputDir.endsWith('/')) {
      outputDir += '/';
    }
    return outputDir;
  }

  private writeJsonToFile(json, iconsFilename, outDir) {
    try {
      if (!fs.existsSync(outDir)) {
        fs.mkdir(outDir);
      }

      fs.writeFileSync(outDir + iconsFilename, JSON.stringify(json, null, 2));
      // tslint:disable-next-line no-console
      console.log('Icon contribution file successfully generated!');
    } catch (error) {
      console.error('Something went wrong while generating the icon contribution file:', error);
    }
  }

  private updatePackageJson(newIconThemesPath) {
    const oldIconThemesPath = packageJson.contributes.iconThemes[0].path;

    if (!oldIconThemesPath || (oldIconThemesPath === newIconThemesPath)) {
      return;
    }

    packageJson.contributes.iconThemes[0].path = newIconThemesPath;

    try {
      fs.writeFileSync('./package.json', JSON.stringify(packageJson, null, 2));
      // tslint:disable-next-line no-console
      console.log('package.json updated');
    } catch (err) {
      console.error(err);
    }
  }
}
