// :> mocha does not work always well with arrow functions
/* tslint:disable only-arrow-functions */
import * as fs from 'fs';
import * as path from 'path';
import { expect } from 'chai';
import { schema as defaultSchema } from '../src/icon-manifest/defaultSchema';
import { IconGenerator } from '../src/icon-manifest/iconGenerator';
import { extensions as files } from '../src/icon-manifest/supportedExtensions';
import { extensions as folders } from '../src/icon-manifest/supportedFolders';
import { FileFormat } from '../src/models/IExtension';
import { vscode } from '../src/utils/vscode';

const iconsFolderPath = path.join(__dirname, '../../icons');
const iconGenerator = new IconGenerator(vscode);

describe('generating icons', function () {
  it('removes first dot from text', function () {
    const text = '.test';
    const noDottedText = 'test';
    expect(iconGenerator.removeFirstDot(text)).equal(noDottedText);
  });

  it('resolves path from one directory to another', function () {
    const fromDirPath = __dirname;
    const toDirName = iconsFolderPath;
    const pathTo = './../../icons/';
    expect(iconGenerator.getPathToDirName(toDirName, fromDirPath)).equals(pathTo);
  });

  it('file extension should not have a leading dot', function () {
    files.supported
      .filter(file => !file.filename && !file.disabled)
      .forEach(file => {
        file.extensions.forEach(extension => {
          expect(extension.startsWith('.')).to.be.false;
        });
      });
  });

  it('ensures default file has an icon path', function () {
    const json = iconGenerator.getDefaultSchema();
    expect(json.iconDefinitions._file.iconPath).not.to.be.equal('');
  });

  it('ensures default folder has an icon path', function () {
    const json = iconGenerator.getDefaultSchema();
    expect(json.iconDefinitions._folder.iconPath).not.to.be.equal('');
  });

  it('ensures default folder has an open icon path', function () {
    const json = iconGenerator.getDefaultSchema();
    expect(json.iconDefinitions._folder_open.iconPath).not.to.be.equal('');
  });

  it('ensures each supported file extension has an associated icon file', function () {
    const suffix = '@2x';
    const iconDirPath = iconGenerator.getPathToDirName(iconsFolderPath, __dirname);

    files.supported
      .filter(file => !file.disabled)
      .forEach(file => {
        const iconFileExtension = '.' + FileFormat[file.format];
        const iconFilePath = iconDirPath + 'file_type_' +
          file.icon + suffix + iconFileExtension;
        expect(fs.existsSync(path.join(__dirname, iconFilePath))).to.be.true;
      });
  });

  it('ensures each supported file extension that has a light theme version ' +
    'has an associated icon file',
    function () {
      const suffix = '@2x';
      const iconDirPath = iconGenerator.getPathToDirName(iconsFolderPath, __dirname);

      files.supported
        .filter(file => file.light && !file.disabled)
        .forEach(file => {
          const iconFileExtension = '.' + FileFormat[file.format];
          const iconFilePath = iconDirPath + 'file_type_light_' +
            file.icon + suffix + iconFileExtension;

          expect(fs.existsSync(path.join(__dirname, iconFilePath))).to.be.true;
        });
    });

  it('ensures each supported folder has an associated icon file', function () {
    const suffix = '@2x';
    const iconDirPath = iconGenerator.getPathToDirName(iconsFolderPath, __dirname);

    folders.supported
    .filter(folder => !folder.disabled)
    .forEach(folder => {
      const iconFileExtension = '.' + FileFormat[folder.format];
      const iconFilePath = iconDirPath + 'folder_type_' +
        folder.icon + suffix + iconFileExtension;
      expect(fs.existsSync(path.join(__dirname, iconFilePath))).to.be.true;
    });
  });

  it('ensures each supported folder that has a light theme version ' +
    'has an associated icon file',
    function () {
      const suffix = '@2x';
      const iconDirPath = iconGenerator.getPathToDirName(iconsFolderPath, __dirname);

      folders.supported
        .filter(folder => folder.light && !folder.disabled)
        .forEach(folder => {
          const iconFileExtension = '.' + FileFormat[folder.format];
          const iconFilePath = iconDirPath + 'folder_type_light_' +
            folder.icon + suffix + iconFileExtension;
          expect(fs.existsSync(path.join(__dirname, iconFilePath))).to.be.true;
        });
    });

  it('ensures each supported folder has an associated opened icon file', function () {
    const suffix = '@2x';
    const iconDirPath = iconGenerator.getPathToDirName(iconsFolderPath, __dirname);

    folders.supported
    .filter(folder => !folder.disabled)
    .forEach(folder => {
      const iconFileExtension = '.' + FileFormat[folder.format];
      const iconOpenFilePath = iconDirPath + 'folder_type_' +
        folder.icon + '_opened' + suffix + iconFileExtension;
      expect(fs.existsSync(path.join(__dirname, iconOpenFilePath))).to.be.true;
    });
  });

  it('ensures each supported folder that has a light theme version ' +
    'has an associated opened icon file',
    function () {
      const suffix = '@2x';
      const iconDirPath = iconGenerator.getPathToDirName(iconsFolderPath, __dirname);

      folders.supported
        .filter(folder => folder.light && !folder.disabled)
        .forEach(folder => {
          const iconFileExtension = '.' + FileFormat[folder.format];
          const iconOpenFilePath = iconDirPath + 'folder_type_light_' +
            folder.icon + '_opened' + suffix + iconFileExtension;
          expect(fs.existsSync(path.join(__dirname, iconOpenFilePath))).to.be.true;
        });
    });

  it('ensures each supported file extension has a definition', function () {
    const fileDefinitions = iconGenerator.buildFiles(files).defs;

    files.supported
      .filter(file => !file.disabled)
      .forEach(file => {
        const definition = '_f_' + file.icon;
        expect(fileDefinitions[definition]).not.to.be.undefined;
      });
  });

  it('ensures each supported file extension that has a light theme version' +
    ' has a \'light\' definition',
    function () {
      const fileDefinitions = iconGenerator.buildFiles(files).defs;

      files.supported
        .filter(file => file.light && !file.disabled)
        .forEach(file => {
          const definition = '_f_light_' + file.icon;
          expect(fileDefinitions[definition]).not.to.be.undefined;
        });
    });

  it('ensures each supported file extension has an icon path', function () {
    const fileDefinitions = iconGenerator.buildFiles(files).defs;

    files.supported
      .filter(file => !file.disabled)
      .forEach(file => {
        const definition = '_f_' + file.icon;
        expect(fileDefinitions[definition].iconPath).not.to.be.equal('');
      });
  });

  it('ensures each supported file extension that has a light theme version has an icon path',
    function () {
      const fileDefinitions = iconGenerator.buildFiles(files).defs;

      files.supported
        .filter(file => file.light && !file.disabled)
        .forEach(file => {
          const definition = '_f_light_' + file.icon;
          expect(fileDefinitions[definition].iconPath).not.to.be.equal('');
        });
    });

  it('ensures each supported folder has a definition', function () {
    const folderDefinitions = iconGenerator.buildFolders(folders).defs;

    folders.supported
      .filter(folder => !folder.disabled)
      .forEach(folder => {
        const definition = '_fd_' + folder.icon;
        expect(folderDefinitions[definition]).not.to.be.undefined;
      });
  });

  it('ensures each supported folder that has a light theme version has a \'light\' definition',
    function () {
      const folderDefinitions = iconGenerator.buildFolders(folders).defs;

      folders.supported
        .filter(folder => folder.light && !folder.disabled)
        .forEach(folder => {
          const definition = '_fd_light_' + folder.icon;
          expect(folderDefinitions[definition]).not.to.be.undefined;
        });
    });

  it('ensures each supported folder has an open definition', function () {
    const folderDefinitions = iconGenerator.buildFolders(folders).defs;

    folders.supported
      .filter(folder => !folder.disabled)
      .forEach(folder => {
        const definition = '_fd_' + folder.icon + '_open';
        expect(folderDefinitions[definition]).not.to.be.undefined;
      });
  });

  it('ensures each supported folder that has a light theme version has a open \'light\' definition',
    function () {
      const folderDefinitions = iconGenerator.buildFolders(folders).defs;

      folders.supported
        .filter(folder => folder.light && !folder.disabled)
        .forEach(folder => {
          const definition = '_fd_light_' + folder.icon + '_open';
          expect(folderDefinitions[definition]).not.to.be.undefined;
        });
    });

  it('ensures each supported folder has an icon path', function () {
    const folderDefinitions = iconGenerator.buildFolders(folders).defs;

    folders.supported
      .filter(folder => !folder.disabled)
      .forEach(folder => {
        const definition = '_fd_' + folder.icon;
        expect(folderDefinitions[definition].iconPath).not.to.be.equal('');
      });
  });

  it('ensures each supported folder that has a light theme version has an icon path',
    function () {
      const folderDefinitions = iconGenerator.buildFolders(folders).defs;

      folders.supported
        .filter(folder => folder.light && !folder.disabled)
        .forEach(folder => {
          const definition = '_fd_light_' + folder.icon;
          expect(folderDefinitions[definition].iconPath).not.to.be.equal('');
        });
    });

  it('ensures each supported folder has an open icon path', function () {
    const folderDefinitions = iconGenerator.buildFolders(folders).defs;

    folders.supported
      .filter(folder => !folder.disabled)
      .forEach(folder => {
        const definition = '_fd_' + folder.icon + '_open';
        expect(folderDefinitions[definition].iconPath).not.to.be.equal('');
      });
  });

  it('ensures each supported folder that has a light theme version has an open icon path',
    function () {
      const folderDefinitions = iconGenerator.buildFolders(folders).defs;

      folders.supported
        .filter(folder => folder.light && !folder.disabled)
        .forEach(folder => {
          const definition = '_fd_light_' + folder.icon + '_open';
          expect(folderDefinitions[definition].iconPath).not.to.be.equal('');
        });
    });

  it('ensures each supported folder has a folder name referencing its definition',
    function () {
      const folderNames = iconGenerator.buildFolders(folders).names.folderNames;

      folders.supported
        .filter(folder => !folder.disabled)
        .forEach(folder => {
          const definition = '_fd_' + folder.icon;
          folder.extensions.forEach(function (extension) {
            const extensionName = (folder.dot ? '.' : '') + extension;
            expect(folderNames[extensionName]).equals(definition);
          });
        });
    });

  it('ensures each supported folder that has a light theme version ' +
    'has a folder name referencing its \'light\' definition',
    function () {
      const folderNames = iconGenerator.buildFolders(folders).light.folderNames;

      folders.supported
        .filter(folder => folder.light && !folder.disabled)
        .forEach(folder => {
          const definition = '_fd_light_' + folder.icon;
          folder.extensions.forEach(function (extension) {
            const extensionName = (folder.dot ? '.' : '') + extension;
            expect(folderNames[extensionName]).equal(definition);
          });
        });
    });

  it('ensures each supported folder has a folder name expanded referencing its definition',
    function () {
      const folderNamesExpanded = iconGenerator.buildFolders(folders).names.folderNamesExpanded;

      folders.supported
        .filter(folder => !folder.disabled)
        .forEach(folder => {
          const definition = '_fd_' + folder.icon + '_open';
          folder.extensions.forEach(function (extension) {
            const extensionName = (folder.dot ? '.' : '') + extension;
            expect(folderNamesExpanded[extensionName]).equal(definition);
          });
        });
    });

  it('ensures each supported folder that has a light theme version ' +
    'has a folder name expanded referencing its open \'light\' definition',
    function () {
      const folderNamesExpanded = iconGenerator.buildFolders(folders).light.folderNamesExpanded;

      folders.supported
        .filter(folder => folder.light && !folder.disabled)
        .forEach(folder => {
          const definition = '_fd_light_' + folder.icon + '_open';
          folder.extensions.forEach(function (extension) {
            const extensionName = (folder.dot ? '.' : '') + extension;
            expect(folderNamesExpanded[extensionName]).equal(definition);
          });
        });
    });

  it('ensures each supported file extension that is not a filename ' +
    'has a file extension referencing its definition',
    function () {
      const fileExtensions = iconGenerator.buildFiles(files).names.fileExtensions;

      files.supported
        .filter(file => !file.filename && !file.disabled)
        .forEach(file => {
          const definition = '_f_' + file.icon;
          file.extensions.forEach(function (extension) {
            const extensionName = iconGenerator.removeFirstDot(extension);
            expect(fileExtensions[extensionName]).equal(definition);
          });
        });
    });

  it('ensures each supported file extension that is not a filename ' +
    'and has a light theme version has a file extension referencing its \'light\' definition',
    function () {
      const fileExtensions = iconGenerator.buildFiles(files).light.fileExtensions;

      files.supported
        .filter(file => !file.filename && file.light && !file.disabled)
        .forEach(file => {
          const definition = '_f_light_' + file.icon;
          file.extensions.forEach(function (extension) {
            const extensionName = iconGenerator.removeFirstDot(extension);
            expect(fileExtensions[extensionName]).equal(definition);
          });
        });
    });

  it('ensures each supported file extension that is a filename ' +
    'has a file name referencing its definition',
    function () {
      const fileNames = iconGenerator.buildFiles(files).names.fileNames;

      files.supported
        .filter(file => file.filename && !file.languages && !file.disabled)
        .forEach(file => {
          const definition = '_f_' + file.icon;
          file.extensions.forEach(function (extension) {
            expect(fileNames[extension]).equal(definition);
          });
        });
    });

  it('ensures each supported file extension that is a filename ' +
    'and has a light theme version has a file name referencing its \'light\' definition',
    function () {
      const fileNames = iconGenerator.buildFiles(files).light.fileNames;

      files.supported
        .filter(file => file.filename && !file.languages && file.light && !file.disabled)
        .forEach(file => {
          const definition = '_f_light_' + file.icon;
          file.extensions.forEach(function (extension) {
            expect(fileNames[extension]).equal(definition);
          });
        });
    });

  it('ensures each supported file extension that is supported by language ids ' +
    'has a language id referencing its definition',
    function () {
      const languageIds = iconGenerator.buildFiles(files).languageIds;

      files.supported
        .filter(file => file.languages && !file.disabled)
        .forEach(file => {
          const definition = '_f_' + file.icon;
          const assertLanguage = function (language) {
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
      const fileDefinitions = iconGenerator.buildFiles(files, null, true).defs;

      files.supported
        .filter(file => !file.light && !file.disabled)
        .forEach(file => {
          const definition = '_f_light_' + file.icon;
          expect(fileDefinitions[definition]).not.to.be.undefined;
        });
    });

  it('ensures each supported folder that has not a light theme version ' +
    'if a default folder icon for light theme is specified, has a \'light\' definition',
    function () {
      const folderDefinitions = iconGenerator.buildFolders(folders, null, true).defs;

      folders.supported
        .filter(folder => !folder.light && !folder.disabled)
        .forEach(folder => {
          const definition = '_fd_light_' + folder.icon;
          expect(folderDefinitions[definition]).not.to.be.undefined;
        });
    });

  it('ensures each supported folder that has not a light theme version ' +
    'if a default folder open icon for light theme is specified, has an open \'light\' definition',
    function () {
      const folderDefinitions = iconGenerator.buildFolders(folders, null, true).defs;

      folders.supported
        .filter(folder => !folder.light && !folder.disabled)
        .forEach(folder => {
          const definition = '_fd_light_' + folder.icon + '_open';
          expect(folderDefinitions[definition]).not.to.be.undefined;
        });
    });

  it('ensures each supported folder that has not a light theme version ' +
    'if a default folder icon for light theme is specified, ' +
    'has a folder name referencing its inherited definition',
    function () {
      const folderNames = iconGenerator.buildFolders(folders, null, true).light.folderNames;

      folders.supported
        .filter(folder => !folder.light && !folder.disabled)
        .forEach(folder => {
          const definition = '_fd_' + folder.icon;
          folder.extensions.forEach(function (extension) {
            const extensionName = (folder.dot ? '.' : '') + extension;
            expect(folderNames[extensionName]).equals(definition);
          });
        });
    });

  it('ensures each supported folder that has not a light theme version ' +
    'if a default folder icon for light theme is specified, ' +
    'has a folder name expanded referencing its inherited definition',
    function () {
      const folderNamesExpanded = iconGenerator.buildFolders(folders, null, true).light.folderNamesExpanded;

      folders.supported
        .filter(folder => !folder.light && !folder.disabled)
        .forEach(folder => {
          const definition = '_fd_' + folder.icon + '_open';
          folder.extensions.forEach(function (extension) {
            const extensionName = (folder.dot ? '.' : '') + extension;
            expect(folderNamesExpanded[extensionName]).equals(definition);
          });
        });
    });

  it('ensures each supported file extension that is not a filename ' +
    'and has not a light theme version, has a file extension referencing its inherited definition',
    function () {
      const fileExtensions = iconGenerator.buildFiles(files, null, true).light.fileExtensions;

      files.supported
        .filter(file => !file.filename && !file.light && !file.disabled)
        .forEach(file => {
          const definition = '_f_' + file.icon;
          file.extensions.forEach(function (extension) {
            const extensionName = iconGenerator.removeFirstDot(extension);
            expect(fileExtensions[extensionName]).equals(definition);
          });
        });
    });

  it('ensures each supported file extension that is a filename ' +
    'and has a light theme version has a file name referencing its inherited definition',
    function () {
      const fileNames = iconGenerator.buildFiles(files, null, true).light.fileNames;

      files.supported
        .filter(file => file.filename && !file.languages && !file.light && !file.disabled)
        .forEach(file => {
          const definition = '_f_' + file.icon;
          file.extensions.forEach(function (extension) {
            expect(fileNames[extension]).equals(definition);
          });
        });
    });

  it('ensures icons schema is vscode default schema for icons', function () {
    expect(iconGenerator.getDefaultSchema()).to.deep.equal(defaultSchema);
  });
});
