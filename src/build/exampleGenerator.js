var fs = require('fs');
var files = require('./supportedExtensions').extensions;
var folders = require('./supportedFolders').extensions;
var ctype = require('./contribTypes');

var supportedFlags = ['--all', '--folders', '--files'];

var folderNames = folders.supported.reduce(function (init, current) {
  var obj = init;
  if (current.extensions[0]) {
    obj[current.icon] = current.dot
      ? '.' + current.extensions[0]
      : current.extensions[0];
  }
  return obj;
}, {});

var fileNames = files.supported.reduce(function (init, current) {
  var obj = init;
  if (current.extensions[0]) {
    obj[current.icon] = current.contribType === ctype.filename
      ? current.extensions[0]
      : 'file.' + current.extensions[0];
  }
  return obj;
}, {});


/**
 * Deletes a directory and all subdirectories
 *
 * @param {any} path The directory's path
 */
function deleteDirectoryRecursively(path) {
  if (fs.existsSync(path)) {
    fs.readdirSync(path).forEach(function (file) {
      var curPath = path + '/' + file;
      if (fs.lstatSync(curPath).isDirectory()) { // recurse
        deleteDirectoryRecursively(curPath);
      } else { // delete file
        fs.unlinkSync(curPath);
      }
    });
    fs.rmdirSync(path);
  }
}


/**
 * Creates a directory if it doesn't exists.
 *
 * @param {any} dirName The directory name
 */
function createDirectory(dirName) {
  deleteDirectoryRecursively(dirName);
  fs.mkdirSync(dirName);
  process.chdir(dirName);
}


/**
 * Builds the files.
 *
 * @param {any} icons The icons names to build examples of
 */
function buildFiles(icons) {
  icons.forEach(function (icon) {
    var fileName = fileNames[icon];

    if (!fileName) {
      console.log('Unsupported file: ' + icon);
      return;
    }

    try {
      fs.writeFileSync(fileName, null);
      console.log('Example file for \'' + icon + '\' successfully created!');
    } catch (error) {
      console.log('Something went wrong while creating the file for \'' + icon + '\' :\n', error);
    }
  });
}

/**
 * Builds the folders.
 *
 * @param {any} icons The icons names to build examples of
 */
function buildFolders(icons) {
  icons.forEach(function (icon) {
    var dirName = folderNames[icon];

    if (!dirName) {
      console.log('Unsupported folder: ' + icon);
      return;
    }

    try {
      fs.mkdirSync(dirName);
      console.log('Example folder for \'' + icon + '\' successfully created!');
    } catch (error) {
      console.log('Something went wrong while creating the folder for \'' + icon + '\' :\n', error);
    }
  });
}

/**
 * Builds the examples.
 *
 * @param {any} flag The flag
 * @param {any} icons The icons names to build examples of
 */
function buildExample(flag, icons) {
  var currentDir = process.cwd();

  createDirectory('examples');

  if (flag === 'files') {
    if (!icons.length) {
      buildFiles(Object.keys(fileNames));
    } else {
      buildFiles(icons);
    }
  }

  if (flag === 'folders') {
    if (!icons.length) {
      buildFolders(Object.keys(folderNames));
    } else {
      buildFolders(icons);
    }
  }

  if (flag === 'all') {
    buildFolders(Object.keys(folderNames));
    buildFiles(Object.keys(fileNames));
  }

  process.chdir(currentDir);
}

/**
 * Asserts the arguments
 *
 * @param {any} args The arguments
 * @returns 'true' if the check fails, otherwise 'false'
 */
function assertFlags(args) {
  var supportedFlagsMsg = 'Supported flags are ' + supportedFlags.join(', ') + '.';

  if (args.length <= 2) {
    console.log('Please provide a valid flag. ' + supportedFlagsMsg);
    return true;
  }

  if (args.length > 2) {
    if (supportedFlags.indexOf(args[2]) === -1) {
      console.log(supportedFlagsMsg);
      return true;
    }
  }

  return false;
}

/**
 * Generates examples for the icons.
 *
 * @param {any} args The arguments
 * @returns
 */
function generate(args) {
  var icons = [];

  if (assertFlags(args)) {
    return;
  }

  if (supportedFlags.slice(1).indexOf(args[2]) > -1) {
    for (var i = 3; i < args.length; i++) {
      icons.push(args[i]);
    }
  }

  buildExample(args[2].slice(2), icons);
}

module.exports = { generate: generate };
