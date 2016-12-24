import * as fs from 'fs';
import * as path from 'path';
import * as _ from 'lodash';

import { schema as defaultSchema } from './defaultSchema';
import { extensions as files } from './supportedExtensions';
import { extensions as folders } from './supportedFolders';

// tslint:disable-next-line no-var-requires
const packageJson = require('./../../package.json');

/**
 * Removes the first dot from the text.
 *
 * @param {string} txt The text
 * @returns A text without leading dot
 */
export function removeFirstDot(txt: string) {
  if (txt.indexOf('.') === 0) {
    return txt.substring(1, txt.length);
  }
  return txt;
}

/**
 * Builds the structure for folders to use in the json file.
 *
 * @param {string} iconsFolderBasePath The base path to the icons folder
 * @param {boolean} hasDefaultLightFolder Indicates if a default folder for the light theme is specified
 * @param {string} suffix The suffix to use in the file name
 * @returns An object with folders properties
 */
export function buildFolders(
  iconsFolderBasePath: string = '',
  hasDefaultLightFolder: boolean = false,
  suffix: string = '') {
  return _.sortBy(folders.supported, item => item.icon)
    .reduce((old, current) => {
      const defs = old.defs;
      const names = old.names;
      const light = old.light;
      const icon = current.icon;
      const hasLightVersion = current.light;
      const iconFolderType = 'folder_type_' + icon;
      const iconFolderLightType = 'folder_type_light_' + icon;
      const folderPath = iconsFolderBasePath + iconFolderType;
      const folderLightPath = iconsFolderBasePath + iconFolderLightType;
      const openFolderPath = folderPath + '_opened';
      const openFolderLightPath = folderLightPath + '_opened';
      const iconFolderDefinition = '_fd_' + icon;
      const iconFolderLightDefinition = '_fd_light_' + icon;
      const iconOpenFolderDefinition = iconFolderDefinition + '_open';
      const iconOpenFolderLightDefinition = iconFolderLightDefinition + '_open';
      const iconFileExtension = current.svg ? '.svg' : '.png';

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

/**
 * Builds the structure for files to use in the json file.
 *
 * @param {string} iconsFolderBasePath The base path to the icons folder
 * @param {boolean} hasDefaultLightFile Indicates if a default file for the light theme is specified
 * @param {string} suffix The suffix to use in the file name
 * @returns An object with files properties
 */
export function buildFiles(
  iconsFolderBasePath: string = '',
  hasDefaultLightFile: boolean = false,
  suffix: string = '') {
  return _.sortedUniq(_.sortBy(files.supported, item => item.icon), true)
    .reduce((old, current) => {
      const defs = old.defs;
      const names = old.names;
      const languageIds = old.languageIds;
      const light = old.light;
      const icon = current.icon;
      const hasLightVersion = current.light;
      const iconFileType = 'file_type_' + icon;
      const iconFileLightType = 'file_type_light_' + icon;
      const filePath = iconsFolderBasePath + iconFileType;
      const fileLightPath = iconsFolderBasePath + iconFileLightType;
      const iconFileDefinition = '_f_' + icon;
      const iconFileLightDefinition = '_f_light_' + icon;
      const iconFileExtension = current.svg ? '.svg' : '.png';
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
          names.fileExtensions[removeFirstDot(extension)] = iconFileDefinition;

          if (hasDefaultLightFile && !hasLightVersion) {
            light.fileExtensions[removeFirstDot(extension)] = iconFileDefinition;
          }

          if (hasLightVersion) {
            light.fileExtensions[removeFirstDot(extension)] = iconFileLightDefinition;
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

/**
 * Gets the default schema for the json file.
 *
 * @param {any} iconsFolderBasePath The base path to the icons folder
 * @returns A json object with the apprepriate schema for vscode
 */
export function getDefaultSchema(iconsFolderBasePath?: string) {
  // dark theme
  defaultSchema.iconDefinitions._file
    .iconPath = iconsFolderBasePath + 'file.svg';
  defaultSchema.iconDefinitions._folder
    .iconPath = iconsFolderBasePath + 'folder.svg';
  defaultSchema.iconDefinitions._folder_open
    .iconPath = iconsFolderBasePath + 'folder_opened.svg';

  // light theme
  // default file and folder related icon paths if not set,
  // inherit their icons from dark theme.
  // The icon paths should not be set unless there is a specific icon for them.
  // If the icon paths get set then they override the dark theme section
  // and light icons definitions have to be specified for each extension
  // and populate the light section, otherwise they inherit from dark theme
  // and only those in 'light' section get overriden.
  defaultSchema.iconDefinitions._file_light
    .iconPath = '';
  defaultSchema.iconDefinitions._folder_light
    .iconPath = '';
  defaultSchema.iconDefinitions._folder_light_open
    .iconPath = '';
  return defaultSchema;
}

/**
 * Gets the relative path to the destination folder from the source directory.
 *
 * @param {any} toDirName The destination directory name
 * @param {any} fromDirPath The path of the source diretory
 * @returns The relative path to the destination directory
 */
export function getPathToDirName(toDirName, fromDirPath) {
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
    path.relative(fromDirPath, toDirName).replace('\\', '/') +
    (toDirName.endsWith('/') ? '' : '/');
}

/**
 * Generates an icon json file.
 *
 * @param {any} iconsFilename The icons file name
 * @param {any} outDir The output diretory
 */
export function generate(iconsFilename, outDir) {
  let outputDir = outDir;

  if (iconsFilename == null) {
    throw new Error('iconsFilename not defined.');
  }

  if (outputDir == null) {
    outputDir = './';
  }

  if (!outputDir.endsWith('/')) {
    outputDir += '/';
  }

  const iconsFolderBasePath = getPathToDirName('icons', outputDir);
  const json = getDefaultSchema(iconsFolderBasePath);
  const res = buildJsonStructure(iconsFolderBasePath, json);

  json.iconDefinitions = Object.assign(json.iconDefinitions, res.folders.defs, res.files.defs);
  json.folderNames = res.folders.names.folderNames;
  json.folderNamesExpanded = res.folders.names.folderNamesExpanded;
  json.fileExtensions = res.files.names.fileExtensions;
  json.fileNames = res.files.names.fileNames;
  json.languageIds = res.files.languageIds;
  json.light.folderNames = res.folders.light.folderNames;
  json.light.folderNamesExpanded = res.folders.light.folderNamesExpanded;
  json.light.fileExtensions = res.files.light.fileExtensions;
  json.light.fileNames = res.files.light.fileNames;

  writeJsonToFile(json, iconsFilename, outputDir);
  updatePackageJson(outputDir + iconsFilename);
}

/**
 * Builds the structure for folders and files to use in the json file.
 *
 * @param {any} iconsFolderBasePath The base path to the icons folder
 * @returns An object with folders and files properties
 */
function buildJsonStructure(iconsFolderBasePath, json) {
  const suffix = '@2x';

  /* eslint-disable no-underscore-dangle */
  const hasDefaultLightFolder = json.iconDefinitions._folder_light.iconPath != null &&
    json.iconDefinitions._folder_light.iconPath !== '';
  const hasDefaultLightFile = json.iconDefinitions._file_light.iconPath != null &&
    json.iconDefinitions._file_light.iconPath !== '';
  /* eslint-enable no-underscore-dangle */

  return {
    // folders section
    folders: buildFolders(iconsFolderBasePath, hasDefaultLightFolder, suffix),
    //  files section 
    files: buildFiles(iconsFolderBasePath, hasDefaultLightFile, suffix),
  };
}

/**
 * Write the json to a file.
 *
 * @param {any} json The Json object
 * @param {any} iconsFilename The icons file name
 * @param {any} outDir The output diretory
 */
function writeJsonToFile(json, iconsFilename, outDir) {
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

/**
 * Updates the package.json file.
 *
 * @param {any} newIconThemesPath The new path of the icons directory.
 */
function updatePackageJson(newIconThemesPath) {
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
