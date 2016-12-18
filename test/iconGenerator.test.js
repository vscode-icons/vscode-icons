/* eslint-disable no-underscore-dangle */

'use strict';

var fs = require('fs');
var expect = require('chai').expect;
var iconGenerator = require('../src/build/iconGenerator');
var files = require('../src/build/supportedExtensions').extensions;
var folders = require('../src/build/supportedFolders').extensions;

suite("Extension Tests", function () {

  // Defines a Mocha unit test
  test("Something 1", function () {
    assert.equal(-1, [1, 2, 3].indexOf(5));
    assert.equal(-1, [1, 2, 3].indexOf(0));
  });
});

describe('generating icons', function () {
  it('removes first dot from text', function () {
    var text = '.test';
    var noDottedText = 'test';
    expect(iconGenerator.removeFirstDot(text)).equals(noDottedText);
  });

  it('resolves path from one directory to another', function () {
    var fromDirPath = './test/';
    var toDirName = 'icons';
    var pathTo = './../icons/';
    expect(iconGenerator.getPathToDirName(toDirName, fromDirPath)).equals(pathTo);
  });

  it('file extension should not have a leading dot', function () {
    files.supported
      .filter(function (file) { return !file.filename; })
      .forEach(function (file) {
        file.extensions.forEach(function (extension) {
          expect(extension.startsWith('.')).to.be.false;
        });
      });
  });

  it('ensures default file has an icon path', function () {
    var json = iconGenerator.getDefaultSchema();

    expect(json.iconDefinitions._file.iconPath).not.to.be.equal('');
  });

  it('ensures default folder has an icon path', function () {
    var json = iconGenerator.getDefaultSchema();

    expect(json.iconDefinitions._folder.iconPath).not.to.be.equal('');
  });

  it('ensures default folder has an open icon path', function () {
    var json = iconGenerator.getDefaultSchema();

    expect(json.iconDefinitions._folder_open.iconPath).not.to.be.equal('');
  });

  it('ensures each supported file extension has an associated icon file', function () {
    var suffix = '@2x';
    var iconDirPath = iconGenerator.getPathToDirName('icons', '.');

    files.supported.forEach(function (file) {
      var iconFileExtension = file.svg ? '.svg' : '.png';
      var iconFilePath = iconDirPath + 'file_type_' +
        file.icon + suffix + iconFileExtension;

      expect(fs.existsSync(iconFilePath)).to.be.true;
    });
  });

  it('ensures each supported file extension that has a light theme version ' +
    'has an associated icon file',
    function () {
      var suffix = '@2x';
      var iconDirPath = iconGenerator.getPathToDirName('icons', '.');

      files.supported
        .filter(function (file) { return file.light; })
        .forEach(function (file) {
          var iconFileExtension = file.svg ? '.svg' : '.png';
          var iconFilePath = iconDirPath + 'file_type_light_' +
            file.icon + suffix + iconFileExtension;

          expect(fs.existsSync(iconFilePath)).to.be.true;
        });
    });

  it('ensures each supported folder has an associated icon file', function () {
    var suffix = '@2x';
    var iconDirPath = iconGenerator.getPathToDirName('icons', '.');

    folders.supported.forEach(function (folder) {
      var iconFileExtension = folder.svg ? '.svg' : '.png';
      var iconFilePath = iconDirPath + 'folder_type_' +
        folder.icon + suffix + iconFileExtension;

      expect(fs.existsSync(iconFilePath)).to.be.true;
    });
  });

  it('ensures each supported folder that has a light theme version ' +
    'has an associated icon file',
    function () {
      var suffix = '@2x';
      var iconDirPath = iconGenerator.getPathToDirName('icons', '.');

      folders.supported
        .filter(function (folder) { return folder.light; })
        .forEach(function (folder) {
          var iconFileExtension = folder.svg ? '.svg' : '.png';
          var iconFilePath = iconDirPath + 'folder_type_light_' +
            folder.icon + suffix + iconFileExtension;

          expect(fs.existsSync(iconFilePath)).to.be.true;
        });
    });

  it('ensures each supported folder has an associated opened icon file', function () {
    var suffix = '@2x';
    var iconDirPath = iconGenerator.getPathToDirName('icons', '.');

    folders.supported.forEach(function (folder) {
      var iconFileExtension = folder.svg ? '.svg' : '.png';
      var iconOpenFilePath = iconDirPath + 'folder_type_' +
        folder.icon + '_opened' + suffix + iconFileExtension;

      expect(fs.existsSync(iconOpenFilePath)).to.be.true;
    });
  });

  it('ensures each supported folder that has a light theme version ' +
    'has an associated opened icon file',
    function () {
      var suffix = '@2x';
      var iconDirPath = iconGenerator.getPathToDirName('icons', '.');

      folders.supported
        .filter(function (folder) { return folder.light; })
        .forEach(function (folder) {
          var iconFileExtension = folder.svg ? '.svg' : '.png';
          var iconOpenFilePath = iconDirPath + 'folder_type_light_' +
            folder.icon + '_opened' + suffix + iconFileExtension;

          expect(fs.existsSync(iconOpenFilePath)).to.be.true;
        });
    });

  it('ensures each supported file extension has a definition', function () {
    var fileDefinitions = iconGenerator.buildFiles().defs;

    files.supported.forEach(function (file) {
      var definition = '_f_' + file.icon;
      expect(fileDefinitions[definition]).not.to.be.undefined;
    });
  });

  it('ensures each supported file extension that has a light theme version' +
    ' has a \'light\' definition',
    function () {
      var fileDefinitions = iconGenerator.buildFiles().defs;

      files.supported
        .filter(function (file) { return file.light; })
        .forEach(function (file) {
          var definition = '_f_light_' + file.icon;
          expect(fileDefinitions[definition]).not.to.be.undefined;
        });
    });

  it('ensures each supported file extension has an icon path', function () {
    var fileDefinitions = iconGenerator.buildFiles().defs;

    files.supported.forEach(function (file) {
      var definition = '_f_' + file.icon;
      expect(fileDefinitions[definition].iconPath).not.to.be.equal('');
    });
  });

  it('ensures each supported file extension that has a light theme version has an icon path',
    function () {
      var fileDefinitions = iconGenerator.buildFiles().defs;

      files.supported
        .filter(function (file) { return file.light; })
        .forEach(function (file) {
          var definition = '_f_light_' + file.icon;
          expect(fileDefinitions[definition].iconPath).not.to.be.equal('');
        });
    });

  it('ensures each supported folder has a definition', function () {
    var folderDefinitions = iconGenerator.buildFolders().defs;

    folders.supported.forEach(function (folder) {
      var definition = '_fd_' + folder.icon;
      expect(folderDefinitions[definition]).not.to.be.undefined;
    });
  });

  it('ensures each supported folder that has a light theme version has a \'light\' definition',
    function () {
      var folderDefinitions = iconGenerator.buildFolders().defs;

      folders.supported
        .filter(function (folder) { return folder.light; })
        .forEach(function (folder) {
          var definition = '_fd_light_' + folder.icon;
          expect(folderDefinitions[definition]).not.to.be.undefined;
        });
    });

  it('ensures each supported folder has an open definition', function () {
    var folderDefinitions = iconGenerator.buildFolders().defs;

    folders.supported.forEach(function (folder) {
      var definition = '_fd_' + folder.icon + '_open';
      expect(folderDefinitions[definition]).not.to.be.undefined;
    });
  });

  it('ensures each supported folder that has a light theme version has a open \'light\' definition',
    function () {
      var folderDefinitions = iconGenerator.buildFolders().defs;

      folders.supported
        .filter(function (folder) { return folder.light; })
        .forEach(function (folder) {
          var definition = '_fd_light_' + folder.icon + '_open';
          expect(folderDefinitions[definition]).not.to.be.undefined;
        });
    });

  it('ensures each supported folder has an icon path', function () {
    var folderDefinitions = iconGenerator.buildFolders().defs;

    folders.supported.forEach(function (folder) {
      var definition = '_fd_' + folder.icon;
      expect(folderDefinitions[definition].iconPath).not.to.be.equal('');
    });
  });

  it('ensures each supported folder that has a light theme version has an icon path',
    function () {
      var folderDefinitions = iconGenerator.buildFolders().defs;

      folders.supported
        .filter(function (folder) { return folder.light; })
        .forEach(function (folder) {
          var definition = '_fd_light_' + folder.icon;
          expect(folderDefinitions[definition].iconPath).not.to.be.equal('');
        });
    });

  it('ensures each supported folder has an open icon path', function () {
    var folderDefinitions = iconGenerator.buildFolders().defs;

    folders.supported.forEach(function (folder) {
      var definition = '_fd_' + folder.icon + '_open';
      expect(folderDefinitions[definition].iconPath).not.to.be.equal('');
    });
  });

  it('ensures each supported folder that has a light theme version has an open icon path',
    function () {
      var folderDefinitions = iconGenerator.buildFolders().defs;

      folders.supported
        .filter(function (folder) { return folder.light; })
        .forEach(function (folder) {
          var definition = '_fd_light_' + folder.icon + '_open';
          expect(folderDefinitions[definition].iconPath).not.to.be.equal('');
        });
    });

  it('ensures each supported folder has a folder name referencing its definition',
    function () {
      var folderNames = iconGenerator.buildFolders().names.folderNames;

      folders.supported.forEach(function (folder) {
        var definition = '_fd_' + folder.icon;
        folder.extensions.forEach(function (extension) {
          var extensionName = (folder.dot ? '.' : '') + extension;
          expect(folderNames[extensionName]).equals(definition);
        });
      });
    });

  it('ensures each supported folder that has a light theme version ' +
    'has a folder name referencing its \'light\' definition',
    function () {
      var folderNames = iconGenerator.buildFolders().light.folderNames;

      folders.supported
        .filter(function (folder) { return folder.light; })
        .forEach(function (folder) {
          var definition = '_fd_light_' + folder.icon;
          folder.extensions.forEach(function (extension) {
            var extensionName = (folder.dot ? '.' : '') + extension;
            expect(folderNames[extensionName]).equal(definition);
          });
        });
    });

  it('ensures each supported folder has a folder name expanded referencing its definition',
    function () {
      var folderNamesExpanded = iconGenerator.buildFolders().names.folderNamesExpanded;

      folders.supported.forEach(function (folder) {
        var definition = '_fd_' + folder.icon + '_open';
        folder.extensions.forEach(function (extension) {
          var extensionName = (folder.dot ? '.' : '') + extension;
          expect(folderNamesExpanded[extensionName]).equal(definition);
        });
      });
    });

  it('ensures each supported folder that has a light theme version ' +
    'has a folder name expanded referencing its open \'light\' definition',
    function () {
      var folderNamesExpanded = iconGenerator.buildFolders().light.folderNamesExpanded;

      folders.supported
        .filter(function (folder) { return folder.light; })
        .forEach(function (folder) {
          var definition = '_fd_light_' + folder.icon + '_open';
          folder.extensions.forEach(function (extension) {
            var extensionName = (folder.dot ? '.' : '') + extension;
            expect(folderNamesExpanded[extensionName]).equal(definition);
          });
        });
    });

  it('ensures each supported file extension that is not a filename ' +
    'has a file extension referencing its definition',
    function () {
      var fileExtensions = iconGenerator.buildFiles().names.fileExtensions;

      files.supported
        .filter(function (file) { return !file.filename; })
        .forEach(function (file) {
          var definition = '_f_' + file.icon;
          file.extensions.forEach(function (extension) {
            var extensionName = iconGenerator.removeFirstDot(extension);
            expect(fileExtensions[extensionName]).equal(definition);
          });
        });
    });

  it('ensures each supported file extension that is not a filename ' +
    'and has a light theme version has a file extension referencing its \'light\' definition',
    function () {
      var fileExtensions = iconGenerator.buildFiles().light.fileExtensions;

      files.supported
        .filter(function (file) { return !file.filename && file.light; })
        .forEach(function (file) {
          var definition = '_f_light_' + file.icon;
          file.extensions.forEach(function (extension) {
            var extensionName = iconGenerator.removeFirstDot(extension);
            expect(fileExtensions[extensionName]).equal(definition);
          });
        });
    });

  it('ensures each supported file extension that is a filename ' +
    'has a file name referencing its definition',
    function () {
      var fileNames = iconGenerator.buildFiles().names.fileNames;

      files.supported
        .filter(function (file) { return file.filename && !file.languages; })
        .forEach(function (file) {
          var definition = '_f_' + file.icon;
          file.extensions.forEach(function (extension) {
            expect(fileNames[extension]).equal(definition);
          });
        });
    });

  it('ensures each supported file extension that is a filename ' +
    'and has a light theme version has a file name referencing its \'light\' definition',
    function () {
      var fileNames = iconGenerator.buildFiles().light.fileNames;

      files.supported
        .filter(function (file) { return file.filename && !file.languages && file.light; })
        .forEach(function (file) {
          var definition = '_f_light_' + file.icon;
          file.extensions.forEach(function (extension) {
            expect(fileNames[extension]).equal(definition);
          });
        });
    });

  it('ensures each supported file extension that is supported by language ids ' +
    'has a language id referencing its definition',
    function () {
      var languageIds = iconGenerator.buildFiles().languageIds;

      files.supported
        .filter(function (file) { return file.languages; })
        .forEach(function (file) {
          var definition = '_f_' + file.icon;
          var assertLanguage = function (language) {
            expect(languageIds[language]).equal(definition);
          };

          file.languages.forEach(function (langIds) {
            if (Array.isArray(langIds.ids)) {
              langIds.ids.forEach(function (id) { assertLanguage(id); });
            } else {
              assertLanguage(langIds.ids);
            }
          });
        });
    });

  it('ensures each supported file extension that has not a light theme version ' +
    'if a default file icon for light theme is specified, has a \'light\' definition',
    function () {
      var fileDefinitions = iconGenerator.buildFiles(null, true).defs;

      files.supported
        .filter(function (file) { return !file.light; })
        .forEach(function (file) {
          var definition = '_f_light_' + file.icon;
          expect(fileDefinitions[definition]).not.to.be.undefined;
        });
    });

  it('ensures each supported folder that has not a light theme version ' +
    'if a default folder icon for light theme is specified, has a \'light\' definition',
    function () {
      var folderDefinitions = iconGenerator.buildFolders(null, true).defs;

      folders.supported
        .filter(function (folder) { return !folder.light; })
        .forEach(function (folder) {
          var definition = '_fd_light_' + folder.icon;
          expect(folderDefinitions[definition]).not.to.be.undefined;
        });
    });

  it('ensures each supported folder that has not a light theme version ' +
    'if a default folder open icon for light theme is specified, has an open \'light\' definition',
    function () {
      var folderDefinitions = iconGenerator.buildFolders(null, true).defs;

      folders.supported
        .filter(function (folder) { return !folder.light; })
        .forEach(function (folder) {
          var definition = '_fd_light_' + folder.icon + '_open';
          expect(folderDefinitions[definition]).not.to.be.undefined;
        });
    });

  it('ensures each supported folder that has not a light theme version ' +
    'if a default folder icon for light theme is specified, ' +
    'has a folder name referencing its inherited definition',
    function () {
      var folderNames = iconGenerator.buildFolders(null, true).light.folderNames;

      folders.supported
        .filter(function (folder) { return !folder.light; })
        .forEach(function (folder) {
          var definition = '_fd_' + folder.icon;
          folder.extensions.forEach(function (extension) {
            var extensionName = (folder.dot ? '.' : '') + extension;
            expect(folderNames[extensionName]).equals(definition);
          });
        });
    });

  it('ensures each supported folder that has not a light theme version ' +
    'if a default folder icon for light theme is specified, ' +
    'has a folder name expanded referencing its inherited definition',
    function () {
      var folderNamesExpanded = iconGenerator.buildFolders(null, true).light.folderNamesExpanded;

      folders.supported
        .filter(function (folder) { return !folder.light; })
        .forEach(function (folder) {
          var definition = '_fd_' + folder.icon + '_open';
          folder.extensions.forEach(function (extension) {
            var extensionName = (folder.dot ? '.' : '') + extension;
            expect(folderNamesExpanded[extensionName]).equals(definition);
          });
        });
    });

  it('ensures each supported file extension that is not a filename ' +
    'and has not a light theme version, has a file extension referencing its inherited definition',
    function () {
      var fileExtensions = iconGenerator.buildFiles(null, true).light.fileExtensions;

      files.supported
        .filter(function (file) { return !file.filename && !file.light; })
        .forEach(function (file) {
          var definition = '_f_' + file.icon;
          file.extensions.forEach(function (extension) {
            var extensionName = iconGenerator.removeFirstDot(extension);
            expect(fileExtensions[extensionName]).equals(definition);
          });
        });
    });

  it('ensures each supported file extension that is a filename ' +
    'and has a light theme version has a file name referencing its inherited definition',
    function () {
      var fileNames = iconGenerator.buildFiles(null, true).light.fileNames;

      files.supported
        .filter(function (file) { return file.filename && !file.languages && !file.light; })
        .forEach(function (file) {
          var definition = '_f_' + file.icon;
          file.extensions.forEach(function (extension) {
            expect(fileNames[extension]).equals(definition);
          });
        });
    });

  /*
    This can be unskipped once 'toMatchObject' method has been released by facebook.
    See: https://github.com/facebook/jest/issues/2195
  */
  it.skip('ensures icons schema is vscode default schema for icons', function () {
    // expect(iconGenerator.getDefaultSchema()).toMatchObject(defaultSchema);
  });
});
