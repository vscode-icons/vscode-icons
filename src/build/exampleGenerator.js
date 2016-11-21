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

function deleteFolderRecursively(path) {
  if (fs.existsSync(path)) {
    fs.readdirSync(path).forEach(function (file) {
      var curPath = path + '/' + file;
      if (fs.lstatSync(curPath).isDirectory()) { // recurse
        deleteFolderRecursively(curPath);
      } else { // delete file
        fs.unlinkSync(curPath);
      }
    });
    fs.rmdirSync(path);
  }
}

function createFolder(dirName) {
  deleteFolderRecursively(dirName);
  fs.mkdirSync(dirName);
  process.chdir(dirName);
}

function buildFiles(icons) {
  icons.forEach(function (icon) {
    var fileName = fileNames[icon];

    if (!fileName) {
      console.log('Unsupported file: ' + icon); // eslint-disable-line
      return;
    }

    try {
      fs.writeFileSync(fileName, null);
      console.log('Example file for \'' + icon + '\' successfully created!'); // eslint-disable-line
    } catch (error) {
      console.log('Something went wrong while creating the file for \'' + icon + '\' :\n', error); // eslint-disable-line
    }
  });
}

function buildFolders(icons) {
  icons.forEach(function (icon) {
    var dirName = folderNames[icon];

    if (!dirName) {
      console.log('Unsupported folder: ' + icon); // eslint-disable-line
      return;
    }

    try {
      fs.mkdirSync(dirName);
      console.log('Example folder for \'' + icon + '\' successfully created!'); // eslint-disable-line
    } catch (error) {
      console.log('Something went wrong while creating the folder for \'' + icon + '\' :\n', error); // eslint-disable-line
    }
  });
}

function buildExample(flag, icons) {
  var currentDir = process.cwd();

  createFolder('examples');

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

function assertFlags(args) {
  var supportedFlagsMsg = 'Supported flags are ' + supportedFlags.join(', ') + '.';

  if (args.length <= 2) {
    console.log('Please provide a valid flag. ' + supportedFlagsMsg); // eslint-disable-line
    return true;
  }

  if (args.length > 2) {
    if (supportedFlags.indexOf(args[2]) === -1) {
      console.log(supportedFlagsMsg); // eslint-disable-line
      return true;
    }
  }

  return false;
}

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
