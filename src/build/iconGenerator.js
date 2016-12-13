var fs = require('fs');
var path = require('path');
var _ = require('lodash');
var defaultSchema = require('./defaultSchema').schema;
var files = require('./supportedExtensions').extensions;
var folders = require('./supportedFolders').extensions;
var packageJson = require('./../../package.json');

/**
 * Removes the first dot from the text.
 *
 * @param {any} txt The text
 * @returns A text without leading dot
 */
function removeFirstDot(txt) {
  if (txt.indexOf('.') === 0) {
    return txt.substring(1, txt.length);
  }
  return txt;
}

/**
 * Builds the structure for folders and files to use in the json file.
 *
 * @param {any} iconsFolderBasePath The base path to the icons folder
 * @returns An object with folders and files properties
 */
function buildJsonStructure(iconsFolderBasePath) {
  var suffix = '@2x';

  return {
    /**   folders section   **/
    folders: _.sortBy(folders.supported, function (item) {
      return item.icon;
    })
      .reduce(function (old, current) {
        var defs = old.defs;
        var names = old.names;
        var light = old.light;
        var icon = current.icon;
        var hasLightVersion = current.light;
        var iconFolderType = 'folder_type_' + icon;
        var iconFolderLightType = 'folder_type_light_' + icon;
        var folderPath = iconsFolderBasePath + iconFolderType;
        var folderLightPath = iconsFolderBasePath + iconFolderLightType;
        var openFolderPath = folderPath + '_opened';
        var openFolderLightPath = openFolderPath + '_opened';
        var iconFolderDefinition = '_fd_' + icon;
        var iconFolderLightDefinition = '_fd_light_' + icon;
        var iconOpenFolderDefinition = iconFolderDefinition + '_open';
        var iconOpenFolderLightDefinition = iconFolderLightDefinition + '_open';
        var iconFileExtension = current.svg ? '.svg' : '.png';

        defs[iconFolderDefinition] = {
          iconPath: folderPath + suffix + iconFileExtension
        };
        defs[iconOpenFolderDefinition] = {
          iconPath: openFolderPath + suffix + iconFileExtension
        };

        if (hasLightVersion) {
          defs[iconFolderLightDefinition] = {
            iconPath: folderLightPath + suffix + iconFileExtension
          };
          defs[iconOpenFolderLightDefinition] = {
            iconPath: openFolderLightPath + suffix + iconFileExtension
          };
        }

        current.extensions.forEach(function (extension) {
          var key = current.dot ? '.' + extension : extension;
          names.folderNames[key] = iconFolderDefinition;
          names.folderNamesExpanded[key] = iconOpenFolderDefinition;

          if (hasLightVersion) {
            light.folderNames[key] = iconFolderLightDefinition;
            light.folderNamesExpanded[key] = iconOpenFolderLightDefinition;
          }
        });

        return old;
      }, {
        defs: {},
        names: { folderNames: {}, folderNamesExpanded: {} },
        light: { folderNames: {}, folderNamesExpanded: {} }
      }),

    /**   files section   **/
    files: _.sortedUniq(_.sortBy(files.supported, function (item) {
      return item.icon;
    }), true)
      .reduce(function (old, current) {
        var defs = old.defs;
        var names = old.names;
        var languageIds = old.languageIds;
        var light = old.light;
        var icon = current.icon;
        var hasLightVersion = current.light;
        var iconFileType = 'file_type_' + icon;
        var iconFileLightType = 'file_type_light_' + icon;
        var filePath = iconsFolderBasePath + iconFileType;
        var fileLightPath = iconsFolderBasePath + iconFileLightType;
        var iconFileDefinition = '_f_' + icon;
        var iconFileLightDefinition = '_f_light_' + icon;
        var iconFileExtension = current.svg ? '.svg' : '.png';
        var isFilename = current.filename;

        defs[iconFileDefinition] = {
          iconPath: filePath + suffix + iconFileExtension
        };

        if (hasLightVersion) {
          defs[iconFileLightDefinition] = {
            iconPath: fileLightPath + suffix + iconFileExtension
          };
        }

        if (current.languages) {
          var assignLanguages = function (langId) {
            languageIds[langId] = iconFileDefinition;
          };

          current.languages.forEach(function (langIds) {
            if (Array.isArray(langIds)) {
              langIds.forEach(function (id) { assignLanguages(id); });
            } else {
              assignLanguages(langIds);
            }
          });
        }

        current.extensions.forEach(function (extension) {
          if (isFilename) {
            names.fileNames[extension] = iconFileDefinition;

            if (hasLightVersion) {
              light.fileNames[extension] = iconFileLightDefinition;
            }
          } else {
            names.fileExtensions[removeFirstDot(extension)] = iconFileDefinition;

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
        languageIds: {}
      })
  };
}

/**
 * Gets the default schema for the json file.
 *
 * @param {any} iconsFolderBasePath The base path to the icons folder
 * @returns A json object with the apprepriate schema for vscode
 */
function getDefaultSchema(iconsFolderBasePath) {
  /* eslint-disable no-underscore-dangle */

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

  /* eslint-enable no-underscore-dangle */
  return defaultSchema;
}

/**
 * Gets the relative path to the destination folder from the source directory.
 *
 * @param {any} toDirName The destination directory name
 * @param {any} fromDirPath The path of the source diretory
 * @returns The relative path to the destination directory
 */
function getPathToDirName(toDirName, fromDirPath) {
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
    console.log('Icon contribution file successfully generated!'); //eslint-disable-line
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
  var oldIconThemesPath = packageJson.contributes.iconThemes[0].path;

  if (!oldIconThemesPath || (oldIconThemesPath === newIconThemesPath)) {
    return;
  }

  packageJson.contributes.iconThemes[0].path = newIconThemesPath;

  try {
    fs.writeFileSync('./package.json', JSON.stringify(packageJson, null, 2));
    console.log('package.json updated'); //eslint-disable-line
  } catch (err) {
    console.error(err);
  }
}

/**
 * Generates an icon json file.
 *
 * @param {any} iconsFilename The icons file name
 * @param {any} outDir The output diretory
 */
function generate(iconsFilename, outDir) {
  var outputDir = outDir;

  if (iconsFilename == null) {
    throw new Error('iconsFilename not defined.');
  }

  if (outputDir == null) {
    outputDir = './';
  }

  if (!outputDir.endsWith('/')) {
    outputDir += '/';
  }

  var iconsFolderBasePath = getPathToDirName('icons', outputDir);
  var res = buildJsonStructure(iconsFolderBasePath);
  var json = getDefaultSchema(iconsFolderBasePath);

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

module.exports = {
  generate: generate,
  removeFirstDot: removeFirstDot,
  getPathToDirName: getPathToDirName,
  getDefaultSchema: getDefaultSchema,
  buildJsonStructure: buildJsonStructure
};
