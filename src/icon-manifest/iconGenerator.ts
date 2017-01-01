import * as fs from 'fs';
import * as path from 'path';
import * as _ from 'lodash';

import { schema as defaultSchema } from './defaultSchema';
import { IExtensionCollection, IFileExtension, IFolderExtension, FileFormat, IExtension } from '../models/IExtension';
import { IIconSchema } from '../models/IIconSchema';
import { IVSCode } from '../models/IVSCode';
import { ISettingsManager, SettingsManager } from '../settings';

// tslint:disable-next-line no-var-requires
const packageJson = require('../../../package.json');

export class IconGenerator {
  private settingsManager: ISettingsManager;
  private outputPath: string;

  constructor(private vscode: IVSCode) {
    this.settingsManager = new SettingsManager(vscode);
    this.outputPath = path.join(__dirname, '../../../icons');
  }

  public buildFolders(
    folders: IExtensionCollection<IFolderExtension>,
    iconsFolderBasePath: string = '',
    hasDefaultLightFolder: boolean = false,
    suffix: string = '') {
    if (!iconsFolderBasePath) { iconsFolderBasePath = ''; }
    return _.sortBy(folders.supported.filter(x => !x.disabled), item => item.icon)
      .reduce((old, current) => {
        const defs = old.defs;
        const names = old.names;
        const light = old.light;
        const icon = current.icon;
        const hasLightVersion = current.light;
        const iconFolderType = `folder_type_${icon}`;
        const iconFolderLightType = `folder_type_light_${icon}`;
        const fPath = this.getIconPath(current, iconsFolderBasePath);
        const folderPath = path.join(fPath, iconFolderType);
        const folderLightPath = path.join(fPath, iconFolderLightType);
        const openFolderPath = `${folderPath}_opened`;
        const openFolderLightPath = `${folderLightPath}_opened`;
        const iconFolderDefinition = `_fd_${icon}`;
        const iconFolderLightDefinition = `_fd_light_${icon}`;
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
          const key = current.dot ? '.' + extension : extension;
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

  public buildFiles(
    files: IExtensionCollection<IFileExtension>,
    iconsFolderBasePath: string = '',
    hasDefaultLightFile: boolean = false,
    suffix: string = '') {
    if (!iconsFolderBasePath) { iconsFolderBasePath = ''; }
    return _.sortedUniq(_.sortBy(files.supported.filter(x => !x.disabled), item => item.icon))
      .reduce((old, current) => {
        const defs = old.defs;
        const names = old.names;
        const languageIds = old.languageIds;
        const light = old.light;
        const icon = current.icon;
        const hasLightVersion = current.light;
        const iconFileType = `file_type_${icon}`;
        const iconFileLightType = `file_type_light_${icon}`;
        const fPath = this.getIconPath(current, iconsFolderBasePath);
        const filePath = path.join(fPath, iconFileType);
        const fileLightPath = path.join(fPath, iconFileLightType);
        const iconFileDefinition = `_f_${icon}`;
        const iconFileLightDefinition = `_f_light_${icon}`;
        const iconFileExtension = `.${typeof current.format === 'string' ?
          current.format.trim() : FileFormat[current.format]}`;
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

  public getDefaultSchema(iconsFolderBasePath?: string): IIconSchema {
    const schema = Object.assign({}, defaultSchema);
    // dark theme
    schema.iconDefinitions._file
      .iconPath = iconsFolderBasePath + 'file.svg';
    schema.iconDefinitions._folder
      .iconPath = iconsFolderBasePath + 'folder.svg';
    schema.iconDefinitions._folder_open
      .iconPath = iconsFolderBasePath + 'folder_opened.svg';

    // light theme
    // default file and folder related icon paths if not set,
    // inherit their icons from dark theme.
    // The icon paths should not be set unless there is a specific icon for them.
    // If the icon paths get set then they override the dark theme section
    // and light icons definitions have to be specified for each extension
    // and populate the light section, otherwise they inherit from dark theme
    // and only those in 'light' section get overriden.
    schema.iconDefinitions._file_light
      .iconPath = '';
    schema.iconDefinitions._folder_light
      .iconPath = '';
    schema.iconDefinitions._folder_light_open
      .iconPath = '';
    return schema;
  }

  public generateJson(
    outDir: string,
    files: IExtensionCollection<IFileExtension>,
    folders: IExtensionCollection<IFolderExtension>): IIconSchema {

    const outputDir = this.cleanOutDir(outDir);
    const iconsFolderBasePath = this.getPathToDirName(this.outputPath, outputDir);
    const json = this.getDefaultSchema(iconsFolderBasePath);
    const res = this.buildJsonStructure(files, folders, iconsFolderBasePath, json);

    json.iconDefinitions = Object.assign({}, json.iconDefinitions, res.folders.defs, res.files.defs);
    json.folderNames = res.folders.names.folderNames;
    json.folderNamesExpanded = res.folders.names.folderNamesExpanded;
    json.fileExtensions = res.files.names.fileExtensions;
    json.fileNames = res.files.names.fileNames;
    json.languageIds = res.files.languageIds;
    json.light.folderNames = res.folders.light.folderNames;
    json.light.folderNamesExpanded = res.folders.light.folderNamesExpanded;
    json.light.fileExtensions = res.files.light.fileExtensions;
    json.light.fileNames = res.files.light.fileNames;

    return json;
  }

  public persist(
    iconsFilename: string,
    outDir: string,
    json: IIconSchema): void {
    const outputDir = this.cleanOutDir(outDir);
    if (iconsFilename == null) {
      throw new Error('iconsFilename not defined.');
    }
    this.writeJsonToFile(json, iconsFilename, outputDir);
    this.updatePackageJson(outputDir + iconsFilename);
  }

  public getPathToDirName(toDirName, fromDirPath) {
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

  public removeFirstDot(txt: string): string {
    if (txt.indexOf('.') === 0) {
      return txt.substring(1, txt.length);
    }
    return txt;
  }

  private buildJsonStructure(
    files: IExtensionCollection<IFileExtension>,
    folders: IExtensionCollection<IFolderExtension>,
    iconsFolderBasePath, json) {
    const suffix = '@2x';

    const hasDefaultLightFolder = json.iconDefinitions._folder_light.iconPath != null &&
      json.iconDefinitions._folder_light.iconPath !== '';
    const hasDefaultLightFile = json.iconDefinitions._file_light.iconPath != null &&
      json.iconDefinitions._file_light.iconPath !== '';

    return {
      // folders section
      folders: this.buildFolders(folders, iconsFolderBasePath, hasDefaultLightFolder, suffix),
      //  files section 
      files: this.buildFiles(files, iconsFolderBasePath, hasDefaultLightFile, suffix),
    };
  }

  private getIconPath(ext: IExtension, defaultPath: string): string {
    if (ext._custom) {

      // this option is not allowed for the moment.
      // VSCode doesn't allow absolute paths...
      // return path.join(this.settingsManager.getSettings().vscodeAppData, 'vsicons-custom-icons');
      // HACK: temporary solution... 
      return defaultPath.replace('../icons', '../../robertohuertasm.vscode-icons.custom-icons');
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
