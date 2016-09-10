var fs = require('fs');
var _ = require('underscore');
var files = require('./supportedExtensions').extensions;
var folders = require('./supportedFolders').extensions;
var ctype = require('./contribTypes');

var folderDefs = _.uniq(_.map(folders.supported, function(o){
  return o.icon;
})).reduce(function(old, current){
  old['_fd_' + current] = {
    iconPath: './icons/folder_type_' + current + '@2x.png'
  };
  old['_fd_' + current + '_open'] = {
    iconPath: './icons/folder_type_' + current + '_opened@2x.png'
  };
  return old;
}, {});

var folderNames = _.reduce(folders.supported, function(old, current){
  current.extensions.forEach(function(o) {
    old.folders[o] = '_fd_' + current.icon;
    old.foldersOpen[o] = '_fd_' + current.icon + '_open';
  });
  return old;
}, {folders: {}, foldersOpen: {}});

var fileDefs = _.uniq(_.map(files.supported, function(o){
  return o.icon;
})).reduce(function(old, current){
  old['_f_' + current] = {
    iconPath: './icons/file_type_' + current + '@2x.png'
  };
  return old;
}, {});

function removeFirstDot(txt){
  if (txt.indexOf('.') === 0){
    return txt.substring(1, txt.length);
  } 
  return txt;
}

var fileNames = _.reduce(files.supported, function(old, current){
  var contribType = current.contribType;
  var icon = current.icon;
  current.extensions.forEach(function(o) {      
    if (contribType === ctype.filename){
      old.names[o] = '_f_' + icon;
    } else if (!contribType){
      old.extensions[removeFirstDot(o)] = '_f_' + icon;
    } else {
      old.languages[contribType] = '_f_' + icon;
    }
  });
  return old;
}, {extensions: {}, names: {}, languages: {}});

console.dir(fileNames.extensions)

function getDefaultSchema() {
  return {
    "iconDefinitions": {
      "_file": {
        "iconPath": "./icons/File.svg"
      },
      "_folder": {
        "iconPath": "./icons/Folder_inverse.svg"
      },
      "_folder_open": {
        "iconPath": "./icons/Folder_opened.svg"
      }
    },
    "file": "_file",
    "folder": "_folder",
    "folderExpanded": "_folder_open",
    "folderNames": {},
    "folderNamesExpanded": {},
    "fileExtensions": {},
    "fileNames": {},
    "languageIds": {}
  };
}


function buildJsonFile(json) {
  try {
    fs.writeFileSync('icons.json', JSON.stringify(json, null, 2));
    console.log('icon contribution file successfully generated!');
  } catch (error) {
    console.log('something went wrong while generating the icon contribution file:', error);
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