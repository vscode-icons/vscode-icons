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
import * as packageJson from '../../../package.json';

export class IconGenerator implements IIconGenerator {
  public settings: ISettings;

  private iconsFolderPath: string;
  private manifestFolderPath: string;

  constructor(
    private vscode: IVSCode,
    private defaultSchema: IIconSchema,
    private avoidCustomDetection: boolean = false) {
    this.settings = new SettingsManager(vscode).getSettings();
    // relative to this file
    this.iconsFolderPath = path.join(__dirname, '../../../', 'icons');
    this.manifestFolderPath = path.join(__dirname, '../../../', 'out/src');
  }

  public generateJson(
    files: IFileCollection,
    folders: IFolderCollection): IIconSchema {
    const iconsFolderBasePath = this.getRelativePath(this.manifestFolderPath, this.iconsFolderPath);
    return this.fillDefaultSchema(files, folders, iconsFolderBasePath, this.defaultSchema);
  }

  public persist(
    iconsFilename: string,
    json: IIconSchema,
    updatePackageJson?: boolean): void {
    if (iconsFilename == null) {
      throw new Error('iconsFilename not defined.');
    }
    this.writeJsonToFile(json, iconsFilename, this.manifestFolderPath);
    if (updatePackageJson) {
      const pathForPackageJson = `${this.getRelativePath('.', this.manifestFolderPath)}${iconsFilename}`;
      this.updatePackageJson(pathForPackageJson);
    }
  }

  private buildFolders(
    folders: IFolderCollection,
    iconsFolderBasePath: string,
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
            : iconFolderType}${sts.iconSuffix}${iconFileExtension}`;
        const openfoldername =
          `${hasLightVersion
            ? iconFolderLightType
            : iconFolderType}_opened${sts.iconSuffix}${iconFileExtension}`;
        const folderIconPath = this.getIconPath(iconsFolderBasePath, foldername);
        const openFolderIconPath = this.getIconPath(iconsFolderBasePath, openfoldername);
        const folderPath = pathUnixJoin(folderIconPath, iconFolderType);
        const folderLightPath = pathUnixJoin(folderIconPath, iconFolderLightType);
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
          `${hasLightVersion
            ? iconFileLightType
            : iconFileType}${sts.iconSuffix}${iconFileExtension}`;
        const fileIconPath = this.getIconPath(iconsFolderBasePath, filename);
        const filePath = pathUnixJoin(fileIconPath, iconFileType);
        const fileLightPath = pathUnixJoin(fileIconPath, iconFileLightType);
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
          const assignLanguagesLightWhenDefaultLight = langId => {
            light.languageIds[langId] = iconFileDefinition;
          };
          const assignLanguagesLight = langId => {
            light.languageIds[langId] = iconFileLightDefinition;
          };

          current.languages.forEach(langIds => {
            if (Array.isArray(langIds.ids)) {
              langIds.ids.forEach(id => {
                assignLanguages(id);

                if (hasDefaultLightFile && !hasLightVersion) {
                  assignLanguagesLightWhenDefaultLight(id);
                }

                if (hasLightVersion) {
                  assignLanguagesLight(id);
                }
              });
            } else {
              assignLanguages(langIds.ids);

              if (hasDefaultLightFile && !hasLightVersion) {
                assignLanguagesLightWhenDefaultLight(langIds.ids);
              }

              if (hasLightVersion) {
                assignLanguagesLight(langIds.ids);
              }

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
            const noDotExtension = this.removeFirstDot(extension);

            names.fileExtensions[noDotExtension] = iconFileDefinition;

            if (hasDefaultLightFile && !hasLightVersion) {
              light.fileExtensions[noDotExtension] = iconFileDefinition;
            }

            if (hasLightVersion) {
              light.fileExtensions[noDotExtension] = iconFileLightDefinition;
            }
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

  private getRelativePath(fromDirPath: string, toDirName: string, checkDirectory: boolean = true): string {
    if (fromDirPath == null) {
      throw new Error('fromDirPath not defined.');
    }

    if (toDirName == null) {
      throw new Error('toDirName not defined.');
    }

    if (checkDirectory && !fs.existsSync(toDirName)) {
      throw new Error(`Directory '${toDirName}' not found.`);
    }

    const relativePath = path.relative(fromDirPath, toDirName).replace(/\\/g, '/');

    return `${relativePath}${(relativePath.endsWith('/') ? '' : '/')}`;
  }

  private removeFirstDot(txt: string): string {
    return txt.indexOf('.') === 0 ? txt.substring(1, txt.length) : txt;
  }

  private buildDefaultIconPath(
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

  private fillDefaultSchema(
    files: IFileCollection,
    folders: IFolderCollection,
    iconsFolderBasePath: string,
    defaultSchema: IIconSchema): IIconSchema {
    const schema = _.cloneDeep(defaultSchema);
    const defs = schema.iconDefinitions;
    // set default icons
    defs._file.iconPath =
      this.buildDefaultIconPath(files.default.file, defs._file, iconsFolderBasePath, false);
    defs._folder.iconPath =
      this.buildDefaultIconPath(folders.default.folder, defs._folder, iconsFolderBasePath, false);
    defs._folder_open.iconPath =
      this.buildDefaultIconPath(folders.default.folder, defs._folder_open, iconsFolderBasePath, true);
    // light theme
    // default file and folder related icon paths if not set,
    // inherit their icons from dark theme.
    // The icon paths should not be set unless there is a specific icon for them.
    // If the icon paths get set then they override the dark theme section
    // and light icons definitions have to be specified for each extension
    // and populate the light section, otherwise they inherit from dark theme
    // and only those in 'light' section get overriden.
    defs._file_light.iconPath =
      this.buildDefaultIconPath(files.default.file_light, defs._file_light, iconsFolderBasePath, false);
    defs._folder_light.iconPath =
      this.buildDefaultIconPath(folders.default.folder_light, defs._folder_light, iconsFolderBasePath, false);
    defs._folder_light_open.iconPath =
      this.buildDefaultIconPath(folders.default.folder_light, defs._folder_light_open, iconsFolderBasePath, true);
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
    schema.light.languageIds = res.files.light.languageIds;
    return schema;
  }

  private hasCustomIcon(customIconFolderPath: string, filename: string): boolean {
    const relativePath = this.getRelativePath('.', customIconFolderPath, false);
    const fpath = path.posix.join(relativePath, filename);
    return fs.existsSync(fpath);
  }

  private getIconPath(defaultPath: string, filename: string): string {
    const absPath = path.join(this.settings.vscodeAppData, this.settings.extensionSettings.customIconFolderName);
    if (!this.avoidCustomDetection && this.hasCustomIcon(absPath, filename)) {
      const sanitizedFolderPath =
        this.belongToSameDrive(absPath, this.manifestFolderPath)
          ? this.manifestFolderPath
          : this.overwriteDrive(absPath, this.manifestFolderPath);
      return this.getRelativePath(sanitizedFolderPath, absPath, false);
    }
    return defaultPath;
  }

  private belongToSameDrive(path1: string, path2: string): boolean {
    const [val1, val2] = this.getDrives(path1, path2);
    return val1 === val2;
  }

  private overwriteDrive(sourcePath: string, destPath: string): string {
    const [val1, val2] = this.getDrives(sourcePath, destPath);
    return destPath.replace(val2, val1);
  }

  private getDrives(...paths: string[]): string[] {
    const rx = new RegExp('^[a-zA-Z]:');
    return paths.map(x => (rx.exec(x) || [])[0]);
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

      fs.writeFileSync(path.join(outDir, iconsFilename), JSON.stringify(json, null, 2));
      // tslint:disable-next-line no-console
      console.log('Icons manifest file successfully generated!');
    } catch (error) {
      console.error('Something went wrong while generating the icon contribution file:', error);
    }
  }

  private updatePackageJson(newIconThemesPath) {
    const packJson = packageJson as any;
    const oldIconThemesPath = packJson.contributes.iconThemes[0].path;

    if (!oldIconThemesPath || (oldIconThemesPath === newIconThemesPath)) {
      return;
    }

    packJson.contributes.iconThemes[0].path = newIconThemesPath;

    try {
      fs.writeFileSync('./package.json', JSON.stringify(packJson, null, 2));
      // tslint:disable-next-line no-console
      console.log('package.json updated');
    } catch (err) {
      console.error(err);
    }
  }
}
