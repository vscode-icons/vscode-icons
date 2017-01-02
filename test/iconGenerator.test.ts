// :> mocha does not work always well with arrow functions
/* tslint:disable only-arrow-functions */
import * as fs from 'fs';
import * as path from 'path';
import * as _ from 'lodash';
import { expect } from 'chai';
import { schema as defaultSchema, schema } from '../src/icon-manifest/defaultSchema';
import { IconGenerator } from '../src/icon-manifest/iconGenerator';
import { extensions as files } from '../src/icon-manifest/supportedExtensions';
import { extensions as folders } from '../src/icon-manifest/supportedFolders';
import { FileFormat } from '../src/models';
import { vscode } from '../src/utils';
import { iconSuffix } from '../src/settings/extSettings';

const iconsFolderPath = path.join(__dirname, '../../icons');
const iconGenerator = new IconGenerator(vscode);

describe('IconGenerator: icon generation test', function () {

  it('filename extension should not have a leading dot', function () {
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

  it('ensures icons schema is vscode default schema for icons', function () {
    expect(iconGenerator.getDefaultSchema()).to.deep.equal(defaultSchema);
  });

  it('ensures each supported file extension has an associated icon file', function () {
    files.supported
      .forEach(file => {
        const filename = `file_type_${file.icon}${iconSuffix}.${FileFormat[file.format]}`;
        const iconFilePath = path.join(iconsFolderPath, filename);
        expect(fs.existsSync(iconFilePath)).to.be.true;
      });
  });

  it('ensures each supported file extension that has a light theme version ' +
    'has an associated icon file', function () {
      files.supported
        .filter(file => file.light)
        .forEach(file => {
          const filename = `file_type_light_${file.icon}${iconSuffix}.${FileFormat[file.format]}`;
          const iconFilePath = path.join(iconsFolderPath, filename);
          expect(fs.existsSync(iconFilePath)).to.be.true;
        });
    });

  it('ensures each supported folder has an associated icon file', function () {
    folders.supported
      .forEach(folder => {
        const filename = `folder_type_${folder.icon}${iconSuffix}.${FileFormat[folder.format]}`;
        const iconFilePath = path.join(iconsFolderPath, filename);
        expect(fs.existsSync(iconFilePath)).to.be.true;
      });
  });

  it('ensures each supported folder that has a light theme version ' +
    'has an associated icon file',
    function () {
      folders.supported
        .filter(folder => folder.light)
        .forEach(folder => {
          const filename = `folder_type_light_${folder.icon}${iconSuffix}.${FileFormat[folder.format]}`;
          const iconFilePath = path.join(iconsFolderPath, filename);
          expect(fs.existsSync(iconFilePath)).to.be.true;
        });
    });

  it('ensures each supported folder has an associated opened icon file', function () {
    folders.supported
      .forEach(folder => {
        const filename = `folder_type_${folder.icon}_opened${iconSuffix}.${FileFormat[folder.format]}`;
        const iconFilePath = path.join(iconsFolderPath, filename);
        expect(fs.existsSync(iconFilePath)).to.be.true;
      });
  });

  it('ensures each supported folder that has a light theme version ' +
    'has an associated opened icon file',
    function () {
      folders.supported
        .filter(folder => folder.light)
        .forEach(folder => {
          const filename = `folder_type_light_${folder.icon}_opened${iconSuffix}.${FileFormat[folder.format]}`;
          const iconFilePath = path.join(iconsFolderPath, filename);
          expect(fs.existsSync(iconFilePath)).to.be.true;
        });
    });

  it('ensures each supported file extension has a definition', function () {
    const schema = iconGenerator.generateJson(files, { supported: [] });
    files.supported
      .filter(file => !file.disabled)
      .forEach(file => {
        const definition = '_f_' + file.icon;
        expect(schema.iconDefinitions[definition]).exist;
      });
  });

  it('ensures each supported file extension that has a light theme version' +
    ' has a \'light\' definition',
    function () {
      const schema = iconGenerator.generateJson(files, { supported: [] });
      files.supported
        .filter(file => file.light && !file.disabled)
        .forEach(file => {
          const definition = '_f_light_' + file.icon;
          expect(schema.iconDefinitions[definition]).exist;
        });
    });

  it('ensures each supported file extension has an icon path', function () {
    const schema = iconGenerator.generateJson(files, { supported: [] });
    files.supported
      .filter(file => !file.disabled)
      .forEach(file => {
        const definition = '_f_' + file.icon;
        expect(schema.iconDefinitions[definition].iconPath).not.to.be.equal('');
      });
  });

  it('ensures each supported file extension that has a light theme version has an icon path',
    function () {
      const schema = iconGenerator.generateJson(files, { supported: [] });
      files.supported
        .filter(file => file.light && !file.disabled)
        .forEach(file => {
          const definition = '_f_light_' + file.icon;
          expect(schema.iconDefinitions[definition].iconPath).not.to.be.equal('');
        });
    });

  it('ensures each supported folder has a definition', function () {
    const schema = iconGenerator.generateJson({ supported: [] }, folders);
    folders.supported
      .filter(folder => !folder.disabled)
      .forEach(folder => {
        const definition = '_fd_' + folder.icon;
        expect(schema.iconDefinitions[definition]).exist;
      });
  });

  it('ensures each supported folder that has a light theme version has a \'light\' definition',
    function () {
      const schema = iconGenerator.generateJson({ supported: [] }, folders);
      folders.supported
        .filter(folder => folder.light && !folder.disabled)
        .forEach(folder => {
          const definition = '_fd_light_' + folder.icon;
          expect(schema.iconDefinitions[definition]).exist;
        });
    });

  it('ensures each supported folder has an open definition', function () {
    const schema = iconGenerator.generateJson({ supported: [] }, folders);
    folders.supported
      .filter(folder => !folder.disabled)
      .forEach(folder => {
        const definition = '_fd_' + folder.icon + '_open';
        expect(schema.iconDefinitions[definition]).exist;
      });
  });

  it('ensures each supported folder that has a light theme version has a open \'light\' definition',
    function () {
      const schema = iconGenerator.generateJson({ supported: [] }, folders);
      folders.supported
        .filter(folder => folder.light && !folder.disabled)
        .forEach(folder => {
          const definition = '_fd_light_' + folder.icon + '_open';
          expect(schema.iconDefinitions[definition]).exist;
        });
    });

  it('ensures each supported folder has an icon path', function () {
    const schema = iconGenerator.generateJson({ supported: [] }, folders);
    folders.supported
      .filter(folder => !folder.disabled)
      .forEach(folder => {
        const definition = '_fd_' + folder.icon;
        expect(schema.iconDefinitions[definition].iconPath).not.to.be.equal('');
      });
  });

  it('ensures each supported folder that has a light theme version has an icon path',
    function () {
      const schema = iconGenerator.generateJson({ supported: [] }, folders);
      folders.supported
        .filter(folder => folder.light && !folder.disabled)
        .forEach(folder => {
          const definition = '_fd_light_' + folder.icon;
          expect(schema.iconDefinitions[definition].iconPath).not.to.be.equal('');
        });
    });

  it('ensures each supported folder has an open icon path', function () {
    const schema = iconGenerator.generateJson({ supported: [] }, folders);
    folders.supported
      .filter(folder => !folder.disabled)
      .forEach(folder => {
        const definition = '_fd_' + folder.icon + '_open';
        expect(schema.iconDefinitions[definition].iconPath).not.to.be.equal('');
      });
  });

  it('ensures each supported folder that has a light theme version has an open icon path',
    function () {
      const schema = iconGenerator.generateJson({ supported: [] }, folders);
      folders.supported
        .filter(folder => folder.light && !folder.disabled)
        .forEach(folder => {
          const definition = '_fd_light_' + folder.icon + '_open';
          expect(schema.iconDefinitions[definition].iconPath).not.to.be.equal('');
        });
    });

  it('ensures each supported folder has a folder name referencing its definition',
    function () {
      const schema = iconGenerator.generateJson({ supported: [] }, folders);
      folders.supported
        .filter(folder => !folder.disabled)
        .forEach(folder => {
          const definition = '_fd_' + folder.icon;
          folder.extensions.forEach(function (extension) {
            expect(schema.folderNames[extension]).equals(definition);
          });
        });
    });

  it('ensures each supported folder that has a light theme version ' +
    'has a folder name referencing its \'light\' definition',
    function () {
      const schema = iconGenerator.generateJson({ supported: [] }, folders);
      folders.supported
        .filter(folder => folder.light && !folder.disabled)
        .forEach(folder => {
          const definition = '_fd_light_' + folder.icon;
          folder.extensions.forEach(function (extension) {
            expect(schema.light.folderNames[extension]).equal(definition);
          });
        });
    });

  it('ensures each supported folder has a folder name expanded referencing its definition',
    function () {
      const schema = iconGenerator.generateJson({ supported: [] }, folders);
      folders.supported
        .filter(folder => !folder.disabled)
        .forEach(folder => {
          const definition = '_fd_' + folder.icon + '_open';
          folder.extensions.forEach(function (extension) {
            expect(schema.folderNamesExpanded[extension]).equal(definition);
          });
        });
    });

  it('ensures each supported folder that has a light theme version ' +
    'has a folder name expanded referencing its open \'light\' definition',
    function () {
      const schema = iconGenerator.generateJson({ supported: [] }, folders);
      folders.supported
        .filter(folder => folder.light && !folder.disabled)
        .forEach(folder => {
          const definition = '_fd_light_' + folder.icon + '_open';
          folder.extensions.forEach(function (extension) {
            expect(schema.light.folderNamesExpanded[extension]).equal(definition);
          });
        });
    });

  it('ensures each supported file extension that is not a filename ' +
    'has a file extension referencing its definition',
    function () {
      const schema = iconGenerator.generateJson(files, { supported: [] });
      files.supported
        .filter(file => !file.filename && !file.disabled)
        .forEach(file => {
          const definition = '_f_' + file.icon;
          file.extensions.forEach(function (extension) {
            expect(schema.fileExtensions[extension]).equal(definition);
          });
        });
    });

  it('ensures each supported file extension that is not a filename ' +
    'and has a light theme version has a file extension referencing its \'light\' definition',
    function () {
      const schema = iconGenerator.generateJson(files, { supported: [] });
      files.supported
        .filter(file => !file.filename && file.light && !file.disabled)
        .forEach(file => {
          const definition = '_f_light_' + file.icon;
          file.extensions.forEach(function (extension) {
            expect(schema.light.fileExtensions[extension]).equal(definition);
          });
        });
    });

  it('ensures each supported file extension that is a filename ' +
    'has a file name referencing its definition',
    function () {
      const schema = iconGenerator.generateJson(files, { supported: [] });
      files.supported
        .filter(file => file.filename && !file.languages && !file.disabled)
        .forEach(file => {
          const definition = '_f_' + file.icon;
          file.extensions.forEach(function (extension) {
            expect(schema.fileNames[extension]).equal(definition);
          });
        });
    });

  it('ensures each supported file extension that is a filename ' +
    'and has a light theme version has a file name referencing its \'light\' definition',
    function () {
      const schema = iconGenerator.generateJson(files, { supported: [] });
      files.supported
        .filter(file => file.filename && !file.languages && file.light && !file.disabled)
        .forEach(file => {
          const definition = '_f_light_' + file.icon;
          file.extensions.forEach(function (extension) {
            expect(schema.light.fileNames[extension]).equal(definition);
          });
        });
    });

  it('ensures each supported file extension that is supported by language ids ' +
    'has a language id referencing its definition',
    function () {
      const schema = iconGenerator.generateJson(files, { supported: [] });
      files.supported
        .filter(file => file.languages && !file.disabled)
        .forEach(file => {
          const definition = '_f_' + file.icon;
          const assertLanguage = function (language) {
            expect(schema.languageIds[language]).equal(definition);
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
      const dSchema = iconGenerator.getDefaultSchema();
      dSchema.iconDefinitions._file_light.iconPath = 'light_icon';
      const schema = iconGenerator.generateJson(files, { supported: [] }, dSchema);
      files.supported
        .filter(file => !file.light && !file.disabled)
        .forEach(file => {
          const definition = '_f_light_' + file.icon;
          expect(schema.iconDefinitions[definition]).exist;
        });
    });

  it('ensures each supported folder that has not a light theme version ' +
    'if a default folder icon for light theme is specified, has a \'light\' definition',
    function () {
      const dSchema = iconGenerator.getDefaultSchema();
      dSchema.iconDefinitions._folder_light.iconPath = 'light_icon';
      const schema = iconGenerator.generateJson({ supported: [] }, folders, dSchema);
      folders.supported
        .filter(folder => !folder.light && !folder.disabled)
        .forEach(folder => {
          const definition = '_fd_light_' + folder.icon;
          expect(schema.iconDefinitions[definition]).exist;
        });
    });

  it('ensures each supported folder that has not a light theme version ' +
    'if a default folder open icon for light theme is specified, has an open \'light\' definition',
    function () {
      const dSchema = iconGenerator.getDefaultSchema();
      dSchema.iconDefinitions._folder_light.iconPath = 'light_icon';
      const schema = iconGenerator.generateJson({ supported: [] }, folders, dSchema);
      folders.supported
        .filter(folder => !folder.light && !folder.disabled)
        .forEach(folder => {
          const definition = '_fd_light_' + folder.icon + '_open';
          expect(schema.iconDefinitions[definition]).exist;
        });
    });

  it('ensures each supported folder that has not a light theme version ' +
    'if a default folder icon for light theme is specified, ' +
    'has a folder name referencing its inherited definition',
    function () {
      const dSchema = iconGenerator.getDefaultSchema();
      dSchema.iconDefinitions._folder_light.iconPath = 'light_icon';
      const schema = iconGenerator.generateJson({ supported: [] }, folders, dSchema);
      folders.supported
        .filter(folder => !folder.light && !folder.disabled)
        .forEach(folder => {
          const definition = '_fd_' + folder.icon;
          folder.extensions.forEach(function (extension) {
            expect(schema.light.folderNames[extension]).equals(definition);
          });
        });
    });

  it('ensures each supported folder that has not a light theme version ' +
    'if a default folder icon for light theme is specified, ' +
    'has a folder name expanded referencing its inherited definition',
    function () {
      const dSchema = iconGenerator.getDefaultSchema();
      dSchema.iconDefinitions._folder_light.iconPath = 'light_icon';
      const schema = iconGenerator.generateJson({ supported: [] }, folders, dSchema);
      folders.supported
        .filter(folder => !folder.light && !folder.disabled)
        .forEach(folder => {
          const definition = '_fd_' + folder.icon + '_open';
          folder.extensions.forEach(function (extension) {
            expect(schema.light.folderNamesExpanded[extension]).equals(definition);
          });
        });
    });

  it('ensures each supported file extension that is not a filename ' +
    'and has not a light theme version, has a file extension referencing its inherited definition',
    function () {
      const dSchema = iconGenerator.getDefaultSchema();
      dSchema.iconDefinitions._file_light.iconPath = 'light_icon';
      const schema = iconGenerator.generateJson(files, { supported: [] }, dSchema);
      files.supported
        .filter(file => !file.filename && !file.light && !file.disabled)
        .forEach(file => {
          const definition = '_f_' + file.icon;
          file.extensions.forEach(function (extension) {
            expect(schema.light.fileExtensions[extension]).equals(definition);
          });
        });
    });

  it('ensures each supported file extension that is a filename ' +
    'and has a light theme version has a file name referencing its inherited definition',
    function () {
      const dSchema = iconGenerator.getDefaultSchema();
      dSchema.iconDefinitions._file_light.iconPath = 'light_icon';
      const schema = iconGenerator.generateJson(files, { supported: [] }, dSchema);
      files.supported
        .filter(file => file.filename && !file.languages && !file.light && !file.disabled)
        .forEach(file => {
          const definition = '_f_' + file.icon;
          file.extensions.forEach(function (extension) {
            expect(schema.light.fileNames[extension]).equals(definition);
          });
        });
    });

});
