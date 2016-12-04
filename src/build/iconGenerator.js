var fs = require('fs');
var path = require('path');
var _ = require('underscore');
var files = require('./supportedExtensions').extensions;
var folders = require('./supportedFolders').extensions;
var ctype = require('./contribTypes');
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
    folders: folders.supported.reduce(function (old, current) {
      var defs = old.defs;
      var names = old.names;
      var icon = current.icon;
      var iconFolderType = 'folder_type_' + icon;
      var folderPath = iconsFolderBasePath + iconFolderType;
      var openFolderPath = folderPath + '_opened';
      var iconFolderDefinition = '_fd_' + icon;
      var iconOpenFolderDefinition = iconFolderDefinition + '_open';
      var iconFileExtension = current.svg ? '.svg' : '.png';

      defs[iconFolderDefinition] = {
        iconPath: folderPath + suffix + iconFileExtension
      };
      defs[iconOpenFolderDefinition] = {
        iconPath: openFolderPath + suffix + iconFileExtension
      };

      current.extensions.forEach(function (extension) {
        var key = current.dot ? '.' + extension : extension;
        names.folderNames[key] = iconFolderDefinition;
        names.folderNamesExpanded[key] = iconOpenFolderDefinition;
      });

      return old;
    }, { defs: {}, names: { folderNames: {}, folderNamesExpanded: {} } }),

    /**   files section   **/
    files: _.uniq(files.supported, true)
      .reduce(function (old, current) {
        var defs = old.defs;
        var names = old.names;
        var icon = current.icon;
        var iconFileType = 'file_type_' + icon;
        var filePath = iconsFolderBasePath + iconFileType;
        var iconFileDefinition = '_f_' + icon;
        var iconFileExtension = current.svg ? '.svg' : '.png';
        var contribType = current.contribType;

        defs[iconFileDefinition] = {
          iconPath: filePath + suffix + iconFileExtension
        };

        current.extensions.forEach(function (extension) {
          if (contribType === ctype.filename) {
            names.fileNames[extension] = iconFileDefinition;
          } else if (!contribType) {
            names.fileExtensions[removeFirstDot(extension)] = iconFileDefinition;
          } else {
            names.languageIds[contribType] = iconFileDefinition;
          }
        });

        return old;
      }, { defs: {}, names: { fileExtensions: {}, fileNames: {}, languageIds: {} } })
  };
}

/**
 * Gets the default schema for the json file.
 *
 * @param {any} iconsFolderBasePath The base path to the icons folder
 * @returns A json object with the apprepriate schema for vscode
 */
function getDefaultSchema(iconsFolderBasePath) {
  return {
    iconDefinitions: {
      _file: {
        iconPath: iconsFolderBasePath + 'File.svg'
      },
      _folder: {
        iconPath: iconsFolderBasePath + 'Folder_inverse.svg'
      },
      _folder_open: {
        iconPath: iconsFolderBasePath + 'Folder_opened.svg'
      }
    },
    file: '_file',
    folder: '_folder',
    folderExpanded: '_folder_open',
    folderNames: {},
    folderNamesExpanded: {},
    fileExtensions: {},
    fileNames: {},
    languageIds: {}
  };
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
  var oldIconThemesPath = packageJson.contributes.iconThemes[0].path;

  if (!oldIconThemesPath || (oldIconThemesPath === newIconThemesPath)) {
    return;
  }

  packageJson.contributes.iconThemes[0].path = newIconThemesPath;

  try {
    fs.writeFileSync('./package.json', JSON.stringify(packageJson, null, 2));
    console.log('package.json updated');
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
  json.languageIds = res.files.names.languageIds;

  writeJsonToFile(json, iconsFilename, outputDir);
  updatePackageJson(outputDir + iconsFilename);
}

module.exports = { generate: generate };
