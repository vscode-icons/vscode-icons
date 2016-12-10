'use strict';

var iconGenerator = require('iconGenerator');
var defaultSchema = require('defaultSchema').schema;
var files = require('supportedExtensions').extensions;
var folders = require('supportedFolders').extensions;
var fs = require('fs');

describe('generating icons', function () {

  it('removes first dot from text', function () {

    var text = '.test';
    var noDottedText = 'test';
    expect(iconGenerator.removeFirstDot(text)).toEqual(noDottedText);
  })

  it('resolves path from one directory to another', function () {

    var fromDirPath = './test/';
    var toDirName = 'icons';
    var pathTo = './../icons/';
    expect(iconGenerator.getPathToDirName(toDirName, fromDirPath)).toEqual(pathTo);
  })

  it('ensures each supported extension has an associated icon file', function () {

    var suffix = '@2x';
    var iconDirPath = iconGenerator.getPathToDirName('icons', '.')

    files.supported.forEach(function (file) {
      var iconFileExtension = file.svg ? '.svg' : '.png';
      var iconFilePath = iconDirPath + 'file_type_' + file.icon + suffix + iconFileExtension;

      expect(fs.existsSync(iconFilePath)).toBeTruthy();
    });
  })

  it('ensures each supported folder has an associated icon file', function () {

    var suffix = '@2x';
    var iconDirPath = iconGenerator.getPathToDirName('icons', '.')

    folders.supported.forEach(function (folder) {
      var iconFileExtension = folder.svg ? '.svg' : '.png';
      var iconFilePath = iconDirPath + 'folder_type_' + folder.icon + suffix + iconFileExtension;

      expect(fs.existsSync(iconFilePath)).toBeTruthy();
    });
  })

  /* This can be unskipped when 'toMatchObject' has been released */
  it.skip('ensures icons schema is vscode default schema for icons', function () {

    expect(iconGenerator.getDefaultSchema()).toMatchObject(defaultSchema);
  })
})