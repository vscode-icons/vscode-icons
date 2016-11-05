var fs = require('fs');
var _ = require('underscore');
var files = require('./supportedExtensions').extensions;
var folders = require('./supportedFolders').extensions;
var ctype = require('./contribTypes');

var folderDefs = _.uniq(_.map(folders.supported, function (o) {
  return o.icon;
})).reduce(function (old, current) {
  var oldObj = old;
  oldObj['_fd_' + current] = {
    iconPath: './icons/folder_type_' + current + '@2x.png'
  };
  oldObj['_fd_' + current + '_open'] = {
    iconPath: './icons/folder_type_' + current + '_opened@2x.png'
  };
  return oldObj;
}, {});

var folderNames = _.reduce(folders.supported, function (old, current) {
  var oldObj = old;
  current.extensions.forEach(function (o) {
    var key = current.dot ? '.' + o : o;
    oldObj.folders[key] = '_fd_' + current.icon;
    oldObj.foldersOpen[key] = '_fd_' + current.icon + '_open';
  });
  return oldObj;
}, { folders: {}, foldersOpen: {} });

var fileDefs = _.uniq(_.map(files.supported, function (o) {
  return { icon: o.icon, svg: o.svg };
})).reduce(function (old, current) {
  var oldObj = old;
  oldObj['_f_' + current.icon] = {
    iconPath: './icons/file_type_' + current.icon + '@2x.' + (current.svg ? 'svg' : 'png')
  };
  return oldObj;
}, {});

function removeFirstDot(txt) {
  if (txt.indexOf('.') === 0) {
    return txt.substring(1, txt.length);
  }
  return txt;
}

// we order files to avoid icons API to override some of the complex extensions.
var orderedFiles = _.sortBy(files.supported, function (item) {
  return item.contribOrder || 0;
});
var fileNames = _.reduce(orderedFiles, function (old, current) {
  var contribType = current.contribType;
  var icon = current.icon;
  var oldObj = old;
  current.extensions.forEach(function (o) {
    if (contribType === ctype.filename) {
      oldObj.names[o] = '_f_' + icon;
    } else if (!contribType) {
      oldObj.extensions[removeFirstDot(o)] = '_f_' + icon;
    } else {
      oldObj.languages[contribType] = '_f_' + icon;
    }
  });
  return oldObj;
}, { extensions: {}, names: {}, languages: {} });

function getDefaultSchema() {
  return {
    iconDefinitions: {
      _file: {
        iconPath: './icons/File.svg'
      },
      _folder: {
        iconPath: './icons/Folder_inverse.svg'
      },
      _folder_open: {
        iconPath: './icons/Folder_opened.svg'
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


function buildJsonFile(json) {
  try {
    fs.writeFileSync('icons.json', JSON.stringify(json, null, 2));
    console.log('icon contribution file successfully generated!'); // eslint-disable-line
  } catch (error) {
    console.log('something went wrong while generating the icon contribution file:', error); // eslint-disable-line
  }
}

function generate() {
  var iconfile = getDefaultSchema();
  iconfile.iconDefinitions = Object.assign(iconfile.iconDefinitions, folderDefs, fileDefs);
  iconfile.folderNames = folderNames.folders;
  iconfile.folderNamesExpanded = folderNames.foldersOpen;
  iconfile.fileExtensions = fileNames.extensions;
  iconfile.fileNames = fileNames.names;
  iconfile.languageIds = fileNames.languages;
  buildJsonFile(iconfile);
}

module.exports = { generate: generate };
