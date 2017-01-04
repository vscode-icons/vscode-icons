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
    outDir: string = null): void {
    const outputDir = this.cleanOutDir(outDir || this.manifestFolderPath);
    if (iconsFilename == null) {
      throw new Error('iconsFilename not defined.');
    }
    this.writeJsonToFile(json, iconsFilename, outputDir);
    const pathForPackageJson = `${this.cleanOutDir(this.getRelativePath('.', outputDir))}${iconsFilename}`;
    this.updatePackageJson(pathForPackageJson);
  }

  private buildFolders(
    folders: IFolderCollection,
    iconsFolderBasePath: string = '',
    hasDefaultLightFolder: boolean = false,
    suffix: string = '') {
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
        const fPath = this.getIconPath(current, iconsFolderBasePath);
        const folderPath = pathUnixJoin(fPath, iconFolderType);
        const folderLightPath = pathUnixJoin(fPath, iconFolderLightType);
        const openFolderPath = `${folderPath}_opened`;
        const openFolderLightPath = `${folderLightPath}_opened`;
        const iconFolderDefinition = `${sts.manifestFolderPrefix}${icon}`;
        const iconFolderLightDefinition = `${sts.manifestFolderLightPrefix}${icon}`;
        const iconOpenFolderDefinition = `${iconFolderDefinition}_open`;
        const iconOpenFolderLightDefinition = `${iconFolderLightDefinition}_open`;
        const iconFileExtension = `.${typeof current.format === 'string' ?
          current.format.trim() : FileFormat[current.format]}`;

        defs[iconFolderDefinition] = {
          iconPath: folderPath + suffix + iconFileExtension,
        };
        defs[iconOpenFolderDefinition] = {
          iconPath: openFolderPath + suffix + iconFileExtension,
        };

        if (hasDefaultLightFolder && !hasLightVersion) {
          defs[iconFolderLightDefinition] = {
            iconPath: folderPath + suffix + iconFileExtension,
          };
          defs[iconOpenFolderLightDefinition] = {
            iconPath: openFolderPath + suffix + iconFileExtension,
          };
        }

        if (hasLightVersion) {
          defs[iconFolderLightDefinition] = {
            iconPath: folderLightPath + suffix + iconFileExtension,
          };
          defs[iconOpenFolderLightDefinition] = {
            iconPath: openFolderLightPath + suffix + iconFileExtension,
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
    hasDefaultLightFile: boolean = false,
    suffix: string = '') {
    if (!iconsFolderBasePath) { iconsFolderBasePath = ''; }
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
        const fPath = this.getIconPath(current, iconsFolderBasePath);
        const filePath = pathUnixJoin(fPath, iconFileType);
        const fileLightPath = pathUnixJoin(fPath, iconFileLightType);
        const iconFileDefinition = `${sts.manifestFilePrefix}${icon}`;
        const iconFileLightDefinition = `${sts.manifestFileLightPrefix}${icon}`;
        const iconFileExtension = fileFormatToString(current.format);
        const isFilename = current.filename;

        defs[iconFileDefinition] = {
          iconPath: filePath + suffix + iconFileExtension,
        };

        if (hasDefaultLightFile && !hasLightVersion) {
          defs[iconFileLightDefinition] = {
            iconPath: filePath + suffix + iconFileExtension,
          };
        }

        if (hasLightVersion) {
          defs[iconFileLightDefinition] = {
            iconPath: fileLightPath + suffix + iconFileExtension,
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

  private getRelativePath(fromDirPath, toDirName) {
    if (toDirName == null) {
      throw new Error('toDirName not defined.');
    }

    if (fromDirPath == null) {
      throw new Error('fromDirPath not defined.');
    }

    if (!fs.existsSync(toDirName)) {
      throw new Error('Directory \'' + toDirName + '\' not found.');
    }
    return './' +
      path.relative(fromDirPath, toDirName).replace(/\\/g, '/') +
      (toDirName.endsWith('/') ? '' : '/');
  }

  private removeFirstDot(txt: string): string {
    if (txt.indexOf('.') === 0) {
      return txt.substring(1, txt.length);
    }
    return txt;
  }

  private buildIconPath(
    defaultExtension: IDefaultExtension,
    schemaExtension: IIconPath,
    path: string,
    isOpenFolder: boolean): string {
    if (!defaultExtension || defaultExtension.disabled) { return schemaExtension.iconPath || ''; }
    const defPrefix = this.settings.extensionSettings.defaultExtensionPrefix;
    const suffix = isOpenFolder ? '_opened' : '';
    const icon = defaultExtension.icon;
    const format = defaultExtension.format;
    const fPath = this.getIconPath(defaultExtension, path);
    return pathUnixJoin(fPath, `${defPrefix}${icon}${suffix}${fileFormatToString(format)}`);
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
    const iconSuffix = this.settings.extensionSettings.iconSuffix;
     // check for light files & folders
    const hasDefaultLightFolder =
      schema.iconDefinitions._folder_light.iconPath != null &&
      schema.iconDefinitions._folder_light.iconPath !== '';
    const hasDefaultLightFile =
      schema.iconDefinitions._file_light.iconPath != null &&
      schema.iconDefinitions._file_light.iconPath !== '';
    const res = {
      // folders section
      folders: this.buildFolders(folders, iconsFolderBasePath, hasDefaultLightFolder, iconSuffix),
      //  files section 
      files: this.buildFiles(files, iconsFolderBasePath, hasDefaultLightFile, iconSuffix),
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

  private getIconPath(ext: IExtension | IDefaultExtension, defaultPath: string): string {
    if (ext._custom) {
      // this option is not allowed for the moment.
      // VSCode doesn't allow absolute paths...
      // return path.join(this.settingsManager.getSettings().vscodeAppData, 'vsicons-custom-icons');
      // HACK: temporary solution... 
      return defaultPath.replace('../icons', `../../${this.settings.extensionSettings.customIconFolderName}`);
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
