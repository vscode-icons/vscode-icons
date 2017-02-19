// :> mocha does not work always well with arrow functions
/* tslint:disable only-arrow-functions */
import * as fs from 'fs';
import * as path from 'path';
import { expect } from 'chai';
import { schema as defaultSchema, IconGenerator } from '../src/icon-manifest';
import { extensions as files } from '../src/icon-manifest/supportedExtensions';
import { extensions as folders } from '../src/icon-manifest/supportedFolders';
import { FileFormat, IFileCollection, IFolderCollection, IIconSchema } from '../src/models';
import { vscode } from '../src/utils';
import { extensionSettings as settings } from '../src/settings';

const iconsFolderPath = path.join(__dirname, '../../icons');

function getIconGenerator(schema?: IIconSchema) {
  return new IconGenerator(vscode, schema || defaultSchema);
}
function getEmptyFileCollection(): IFileCollection {
  return { default: { file: { icon: 'file', format: 'svg' } }, supported: [] };
}

function getEmptyFolderCollection(): IFolderCollection {
  return { default: { folder: { icon: 'folder', format: 'svg' } }, supported: [] };
}

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
    const schema = getIconGenerator().generateJson(files, getEmptyFolderCollection());
    expect(schema.iconDefinitions._file.iconPath).not.to.be.empty;
  });

  it('ensures default folder has an icon path', function () {
    const schema = getIconGenerator().generateJson(getEmptyFileCollection(), folders);
    expect(schema.iconDefinitions._folder.iconPath).not.to.be.empty;
  });

  it('ensures default folder has an open icon path', function () {
    const schema = getIconGenerator().generateJson(getEmptyFileCollection(), folders);
    expect(schema.iconDefinitions._folder_open.iconPath).not.to.be.equal('');
  });

  it('ensures each supported file extension has an associated icon file', function () {
    files.supported
      .forEach(file => {
        const filename = `${settings.filePrefix}${file.icon}${settings.iconSuffix}.${FileFormat[file.format]}`;
        const iconFilePath = path.join(iconsFolderPath, filename);
        expect(fs.existsSync(iconFilePath)).to.be.true;
      });
  });

  it('ensures each supported file extension that has a light theme version, ' +
    'has an associated icon file', function () {
      files.supported
        .filter(file => file.light)
        .forEach(file => {
          const filename =
            `${settings.fileLightPrefix}${file.icon}${settings.iconSuffix}.${FileFormat[file.format]}`;
          const iconFilePath = path.join(iconsFolderPath, filename);
          expect(fs.existsSync(iconFilePath)).to.be.true;
        });
    });

  it('ensures each supported folder has an associated icon file', function () {
    folders.supported
      .forEach(folder => {
        const filename =
          `${settings.folderPrefix}${folder.icon}${settings.iconSuffix}.${FileFormat[folder.format]}`;
        const iconFilePath = path.join(iconsFolderPath, filename);
        expect(fs.existsSync(iconFilePath)).to.be.true;
      });
  });

  it('ensures each supported folder that has a light theme version, ' +
    'has an associated icon file',
    function () {
      folders.supported
        .filter(folder => folder.light)
        .forEach(folder => {
          const filename =
            `${settings.folderLightPrefix}${folder.icon}${settings.iconSuffix}.${FileFormat[folder.format]}`;
          const iconFilePath = path.join(iconsFolderPath, filename);
          expect(fs.existsSync(iconFilePath)).to.be.true;
        });
    });

  it('ensures each supported folder has an associated opened icon file', function () {
    folders.supported
      .forEach(folder => {
        const filename =
          `${settings.folderPrefix}${folder.icon}_opened${settings.iconSuffix}.${FileFormat[folder.format]}`;
        const iconFilePath = path.join(iconsFolderPath, filename);
        expect(fs.existsSync(iconFilePath)).to.be.true;
      });
  });

  it('ensures each supported folder that has a light theme version, ' +
    'has an associated opened icon file',
    function () {
      folders.supported
        .filter(folder => folder.light)
        .forEach(folder => {
          const filename =
            `${settings.folderLightPrefix}${folder.icon}_opened${settings.iconSuffix}.${FileFormat[folder.format]}`;
          const iconFilePath = path.join(iconsFolderPath, filename);
          expect(fs.existsSync(iconFilePath)).to.be.true;
        });
    });

  it('ensures each supported file extension has a definition', function () {
    const schema = getIconGenerator().generateJson(files, getEmptyFolderCollection());
    files.supported
      .filter(file => !file.disabled)
      .forEach(file => {
        const definition = `${settings.manifestFilePrefix}${file.icon}`;
        expect(schema.iconDefinitions[definition]).exist;
      });
  });

  it('ensures each supported file extension that has a light theme version, has a \'light\' definition',
    function () {
      const schema = getIconGenerator().generateJson(files, getEmptyFolderCollection());
      files.supported
        .filter(file => file.light && !file.disabled)
        .forEach(file => {
          const definition = `${settings.manifestFileLightPrefix}${file.icon}`;
          expect(schema.iconDefinitions[definition]).exist;
        });
    });

  it('ensures each supported file extension has an icon path', function () {
    const schema = getIconGenerator().generateJson(files, getEmptyFolderCollection());
    files.supported
      .filter(file => !file.disabled)
      .forEach(file => {
        const definition = `${settings.manifestFilePrefix}${file.icon}`;
        expect(schema.iconDefinitions[definition].iconPath).not.to.be.equal('');
      });
  });

  it('ensures each supported file extension that has a light theme version, has an icon path',
    function () {
      const schema = getIconGenerator().generateJson(files, getEmptyFolderCollection());
      files.supported
        .filter(file => file.light && !file.disabled)
        .forEach(file => {
          const definition = `${settings.manifestFileLightPrefix}${file.icon}`;
          expect(schema.iconDefinitions[definition].iconPath).not.to.be.equal('');
        });
    });

  it('ensures each supported folder has a definition', function () {
    const schema = getIconGenerator().generateJson(getEmptyFileCollection(), folders);
    folders.supported
      .filter(folder => !folder.disabled)
      .forEach(folder => {
        const definition = `${settings.manifestFolderPrefix}${folder.icon}`;
        expect(schema.iconDefinitions[definition]).exist;
      });
  });

  it('ensures each supported folder that has a light theme version, has a \'light\' definition',
    function () {
      const schema = getIconGenerator().generateJson(getEmptyFileCollection(), folders);
      folders.supported
        .filter(folder => folder.light && !folder.disabled)
        .forEach(folder => {
          const definition = `${settings.manifestFolderLightPrefix}${folder.icon}`;
          expect(schema.iconDefinitions[definition]).exist;
        });
    });

  it('ensures each supported folder has an open definition', function () {
    const schema = getIconGenerator().generateJson(getEmptyFileCollection(), folders);
    folders.supported
      .filter(folder => !folder.disabled)
      .forEach(folder => {
        const definition = `${settings.manifestFolderPrefix}${folder.icon}_open`;
        expect(schema.iconDefinitions[definition]).exist;
      });
  });

  it('ensures each supported folder that has a light theme version, has a open \'light\' definition',
    function () {
      const schema = getIconGenerator().generateJson(getEmptyFileCollection(), folders);
      folders.supported
        .filter(folder => folder.light && !folder.disabled)
        .forEach(folder => {
          const definition = `${settings.manifestFolderLightPrefix}${folder.icon}_open`;
          expect(schema.iconDefinitions[definition]).exist;
        });
    });

  it('ensures each supported folder has an icon path', function () {
    const schema = getIconGenerator().generateJson(getEmptyFileCollection(), folders);
    folders.supported
      .filter(folder => !folder.disabled)
      .forEach(folder => {
        const definition = `${settings.manifestFolderPrefix}${folder.icon}`;
        expect(schema.iconDefinitions[definition].iconPath).not.to.be.equal('');
      });
  });

  it('ensures each supported folder that has a light theme version, has an icon path',
    function () {
      const schema = getIconGenerator().generateJson(getEmptyFileCollection(), folders);
      folders.supported
        .filter(folder => folder.light && !folder.disabled)
        .forEach(folder => {
          const definition = `${settings.manifestFolderLightPrefix}${folder.icon}`;
          expect(schema.iconDefinitions[definition].iconPath).not.to.be.equal('');
        });
    });

  it('ensures each supported folder has an open icon path', function () {
    const schema = getIconGenerator().generateJson(getEmptyFileCollection(), folders);
    folders.supported
      .filter(folder => !folder.disabled)
      .forEach(folder => {
        const definition = `${settings.manifestFolderPrefix}${folder.icon}_open`;
        expect(schema.iconDefinitions[definition].iconPath).not.to.be.equal('');
      });
  });

  it('ensures each supported folder that has a light theme version, has an open icon path',
    function () {
      const schema = getIconGenerator().generateJson(getEmptyFileCollection(), folders);
      folders.supported
        .filter(folder => folder.light && !folder.disabled)
        .forEach(folder => {
          const definition = `${settings.manifestFolderLightPrefix}${folder.icon}_open`;
          expect(schema.iconDefinitions[definition].iconPath).not.to.be.equal('');
        });
    });

  it('ensures each supported folder has a folder name referencing its definition',
    function () {
      const schema = getIconGenerator().generateJson(getEmptyFileCollection(), folders);
      folders.supported
        .filter(folder => !folder.disabled)
        .forEach(folder => {
          const definition = `${settings.manifestFolderPrefix}${folder.icon}`;
          folder.extensions.forEach(function (extension) {
            expect(schema.folderNames[extension]).equals(definition);
          });
        });
    });

  it('ensures each supported folder that has a light theme version, ' +
    'has a folder name referencing its \'light\' definition',
    function () {
      const schema = getIconGenerator().generateJson(getEmptyFileCollection(), folders);
      folders.supported
        .filter(folder => folder.light && !folder.disabled)
        .forEach(folder => {
          const definition = `${settings.manifestFolderLightPrefix}${folder.icon}`;
          folder.extensions.forEach(function (extension) {
            expect(schema.light.folderNames[extension]).equal(definition);
          });
        });
    });

  it('ensures each supported folder has a folder name expanded referencing its definition',
    function () {
      const schema = getIconGenerator().generateJson(getEmptyFileCollection(), folders);
      folders.supported
        .filter(folder => !folder.disabled)
        .forEach(folder => {
          const definition = `${settings.manifestFolderPrefix}${folder.icon}_open`;
          folder.extensions.forEach(function (extension) {
            expect(schema.folderNamesExpanded[extension]).equal(definition);
          });
        });
    });

  it('ensures each supported folder that has a light theme version, ' +
    'has a folder name expanded referencing its open \'light\' definition',
    function () {
      const schema = getIconGenerator().generateJson(getEmptyFileCollection(), folders);
      folders.supported
        .filter(folder => folder.light && !folder.disabled)
        .forEach(folder => {
          const definition = `${settings.manifestFolderLightPrefix}${folder.icon}_open`;
          folder.extensions.forEach(function (extension) {
            expect(schema.light.folderNamesExpanded[extension]).equal(definition);
          });
        });
    });

  it('ensures each supported file extension that is not a filename, ' +
    'has a file extension referencing its definition',
    function () {
      const schema = getIconGenerator().generateJson(files, getEmptyFolderCollection());
      files.supported
        .filter(file => !file.filename && !file.disabled)
        .forEach(file => {
          const definition = `${settings.manifestFilePrefix}${file.icon}`;
          file.extensions.forEach(function (extension) {
            expect(schema.fileExtensions[extension]).equal(definition);
          });
        });
    });

  it('ensures each supported file extension that is not a filename and has a light theme version, ' +
    'has a file extension referencing its \'light\' definition',
    function () {
      const schema = getIconGenerator().generateJson(files, getEmptyFolderCollection());
      files.supported
        .filter(file => !file.filename && file.light && !file.disabled)
        .forEach(file => {
          const definition = `${settings.manifestFileLightPrefix}${file.icon}`;
          file.extensions.forEach(function (extension) {
            expect(schema.light.fileExtensions[extension]).equal(definition);
          });
        });
    });

  it('ensures each supported file extension that is a filename, ' +
    'has a file name referencing its definition',
    function () {
      const schema = getIconGenerator().generateJson(files, getEmptyFolderCollection());
      files.supported
        .filter(file => file.filename && !file.languages && !file.disabled)
        .forEach(file => {
          const definition = `${settings.manifestFilePrefix}${file.icon}`;
          file.extensions.forEach(function (extension) {
            expect(schema.fileNames[extension]).equal(definition);
          });
        });
    });

  it('ensures each supported file extension that is a filename and has a light theme version, ' +
    'has a file name referencing its \'light\' definition',
    function () {
      const schema = getIconGenerator().generateJson(files, getEmptyFolderCollection());
      files.supported
        .filter(file => file.filename && !file.languages && file.light && !file.disabled)
        .forEach(file => {
          const definition = `${settings.manifestFileLightPrefix}${file.icon}`;
          file.extensions.forEach(function (extension) {
            expect(schema.light.fileNames[extension]).equal(definition);
          });
        });
    });

  it('ensures each supported file extension that is supported by language ids, ' +
    'has a language id referencing its definition',
    function () {
      const schema = getIconGenerator().generateJson(files, getEmptyFolderCollection());
      files.supported
        .filter(file => file.languages && !file.disabled)
        .forEach(file => {
          const definition = `${settings.manifestFilePrefix}${file.icon}`;
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

  it('ensures each supported file extension that is supported by language ids and has a light theme version, ' +
    'has a language id referencing its \'light\' definition',
    function () {
      const schema = getIconGenerator().generateJson(files, getEmptyFolderCollection());
      files.supported
        .filter(file => file.languages && file.light && !file.disabled)
        .forEach(file => {
          const definition = `${settings.manifestFileLightPrefix}${file.icon}`;
          const assertLanguageLight = function (language) {
            expect(schema.light.languageIds[language]).equal(definition);
          };

          file.languages.forEach(function (langIds) {
            if (Array.isArray(langIds.ids)) {
              langIds.ids.forEach(function (id) { assertLanguageLight(id); });
            } else {
              assertLanguageLight(langIds.ids);
            }
          });
        });
    });

  it('ensures each supported file extension that is supported by language ids and has not a light theme version, ' +
    'if a default file icon for light theme is specified, ' +
    'has a \'light\' language id referencing its inherited definition',
    function () {
      const dSchema = Object.assign({}, defaultSchema) as IIconSchema;
      dSchema.iconDefinitions._file_light.iconPath = 'light_icon';
      const schema = getIconGenerator(dSchema).generateJson(files, getEmptyFolderCollection());
      files.supported
        .filter(file => file.languages && !file.light && !file.disabled)
        .forEach(file => {
          const definition = `${settings.manifestFilePrefix}${file.icon}`;
          const assignLanguagesLight = function (language) {
            expect(schema.light.languageIds[language]).equal(definition);
          };

          file.languages.forEach(function (langIds) {
            if (Array.isArray(langIds.ids)) {
              langIds.ids.forEach(function (id) { assignLanguagesLight(id); });
            } else {
              assignLanguagesLight(langIds.ids);
            }
          });
        });
    });

  it('ensures each supported file extension that has not a light theme version, ' +
    'if a default file icon for light theme is specified, has a \'light\' definition',
    function () {
      const dSchema = Object.assign({}, defaultSchema) as IIconSchema;
      dSchema.iconDefinitions._file_light.iconPath = 'light_icon';
      const schema = getIconGenerator(dSchema).generateJson(files, getEmptyFolderCollection());
      files.supported
        .filter(file => !file.light && !file.disabled)
        .forEach(file => {
          const definition = `${settings.manifestFileLightPrefix}${file.icon}`;
          expect(schema.iconDefinitions[definition]).exist;
        });
    });

  it('ensures each supported folder that has not a light theme version, ' +
    'if a default folder icon for light theme is specified, has a \'light\' definition',
    function () {
      const dSchema = Object.assign({}, defaultSchema) as IIconSchema;
      dSchema.iconDefinitions._folder_light.iconPath = 'light_icon';
      const schema = getIconGenerator(dSchema).generateJson(getEmptyFileCollection(), folders);
      folders.supported
        .filter(folder => !folder.light && !folder.disabled)
        .forEach(folder => {
          const definition = `${settings.manifestFolderLightPrefix}${folder.icon}`;
          expect(schema.iconDefinitions[definition]).exist;
        });
    });

  it('ensures each supported folder that has not a light theme version, ' +
    'if a default folder open icon for light theme is specified, has an open \'light\' definition',
    function () {
      const dSchema = Object.assign({}, defaultSchema) as IIconSchema;
      dSchema.iconDefinitions._folder_light.iconPath = 'light_icon';
      const schema = getIconGenerator(dSchema).generateJson(getEmptyFileCollection(), folders);
      folders.supported
        .filter(folder => !folder.light && !folder.disabled)
        .forEach(folder => {
          const definition = `${settings.manifestFolderLightPrefix}${folder.icon}_open`;
          expect(schema.iconDefinitions[definition]).exist;
        });
    });

  it('ensures each supported folder that has not a light theme version, ' +
    'if a default folder icon for light theme is specified, ' +
    'has a folder name referencing its inherited definition',
    function () {
      const dSchema = Object.assign({}, defaultSchema) as IIconSchema;
      dSchema.iconDefinitions._folder_light.iconPath = 'light_icon';
      const schema = getIconGenerator(dSchema).generateJson(getEmptyFileCollection(), folders);
      folders.supported
        .filter(folder => !folder.light && !folder.disabled)
        .forEach(folder => {
          const definition = `${settings.manifestFolderPrefix}${folder.icon}`;
          folder.extensions.forEach(function (extension) {
            expect(schema.light.folderNames[extension]).equals(definition);
          });
        });
    });

  it('ensures each supported folder that has not a light theme version, ' +
    'if a default folder icon for light theme is specified, ' +
    'has a folder name expanded referencing its inherited definition',
    function () {
      const dSchema = Object.assign({}, defaultSchema) as IIconSchema;
      dSchema.iconDefinitions._folder_light.iconPath = 'light_icon';
      const schema = getIconGenerator(dSchema).generateJson(getEmptyFileCollection(), folders);
      folders.supported
        .filter(folder => !folder.light && !folder.disabled)
        .forEach(folder => {
          const definition = `${settings.manifestFolderPrefix}${folder.icon}_open`;
          folder.extensions.forEach(function (extension) {
            expect(schema.light.folderNamesExpanded[extension]).equals(definition);
          });
        });
    });

  it('ensures each supported file extension that is not a filename and has not a light theme version, ' +
    'has a file extension referencing its inherited definition',
    function () {
      const dSchema = Object.assign({}, defaultSchema) as IIconSchema;
      dSchema.iconDefinitions._file_light.iconPath = 'light_icon';
      const schema = getIconGenerator(dSchema).generateJson(files, getEmptyFolderCollection());
      files.supported
        .filter(file => !file.filename && !file.light && !file.disabled)
        .forEach(file => {
          const definition = `${settings.manifestFilePrefix}${file.icon}`;
          file.extensions.forEach(function (extension) {
            expect(schema.light.fileExtensions[extension]).equals(definition);
          });
        });
    });

  it('ensures each supported file extension that is a filename and has a light theme version, ' +
    'has a file name referencing its inherited definition',
    function () {
      const dSchema = Object.assign({}, defaultSchema) as IIconSchema;
      dSchema.iconDefinitions._file_light.iconPath = 'light_icon';
      const schema = getIconGenerator(dSchema).generateJson(files, getEmptyFolderCollection());
      files.supported
        .filter(file => file.filename && !file.languages && !file.light && !file.disabled)
        .forEach(file => {
          const definition = `${settings.manifestFilePrefix}${file.icon}`;
          file.extensions.forEach(function (extension) {
            expect(schema.light.fileNames[extension]).equals(definition);
          });
        });
    });

});

describe('IconGenerator: functionality', function () {

  it('ensures disabled file extensions are not included into the manifest', function () {
    const custom = getEmptyFileCollection();
    custom.supported.push({ icon: 'actionscript', extensions: [], disabled: true, format: 'svg' });
    const json = getIconGenerator().generateJson(custom, getEmptyFolderCollection());
    const extendedPath = json.iconDefinitions['_f_actionscript'];
    expect(extendedPath).not.to.exist;
  });

  it('ensures disabled folder extensions are not included into the manifest', function () {
    const custom = getEmptyFolderCollection();
    custom.supported.push({ icon: 'aws', extensions: ['aws'], disabled: true, format: 'svg' });
    const json = getIconGenerator().generateJson(getEmptyFileCollection(), custom);
    const extendedPath = json.iconDefinitions['_fd_aws'];
    expect(extendedPath).not.to.exist;
  });

  it('ensures default file icon paths are always defined when disabled', function () {
    const custom = getEmptyFileCollection();
    custom.default.file.disabled = true;
    const json = getIconGenerator().generateJson(custom, getEmptyFolderCollection());
    const ext = json.iconDefinitions._file;
    expect(ext).to.exist;
    expect(ext.iconPath).to.exist;
    expect(ext.iconPath).to.be.empty;
  });

  it('ensures default folder icon paths are always defined when disabled', function () {
    const custom = getEmptyFolderCollection();
    custom.default.folder.disabled = true;
    const json = getIconGenerator().generateJson(getEmptyFileCollection(), custom);
    const ext = json.iconDefinitions._folder;
    expect(ext).to.exist;
    expect(ext.iconPath).to.exist;
    expect(ext.iconPath).to.be.empty;
  });

  it('ensures file extensions are not included into the manifest when no icon is provided', function () {
    const custom = getEmptyFileCollection();
    custom.supported.push({ icon: '', extensions: ['as'], format: 'svg' });
    const json = getIconGenerator().generateJson(custom, getEmptyFolderCollection());
    const ext = json.iconDefinitions[settings.manifestFilePrefix];
    expect(ext).not.to.exist;
  });

  it('ensures folder extensions are not included into the manifest when no icon is provided', function () {
    const custom = getEmptyFolderCollection();
    custom.supported.push({ icon: '', extensions: ['aws'], format: 'svg' });
    const json = getIconGenerator().generateJson(getEmptyFileCollection(), custom);
    const ext = json.iconDefinitions[settings.manifestFolderPrefix];
    expect(ext).not.to.exist;
  });

  it('ensures new file extensions are included into the manifest', function () {
    const custom = getEmptyFileCollection();
    custom.supported.push({ icon: 'actionscript', extensions: ['as'], format: 'svg' });
    const json = getIconGenerator().generateJson(custom, getEmptyFolderCollection());
    const def = `${settings.manifestFilePrefix}actionscript`;
    const ext = json.iconDefinitions[def];
    expect(ext).to.exist;
    expect(ext.iconPath).not.to.be.empty;
    expect(json.fileExtensions['as']).to.be.equal(def);
  });

  it('ensures new folder extensions are included into the manifest', function () {
    const custom = getEmptyFolderCollection();
    custom.supported.push({ icon: 'aws', extensions: ['aws'], format: 'svg' });
    const json = getIconGenerator().generateJson(getEmptyFileCollection(), custom);
    const def = `${settings.manifestFolderPrefix}aws`;
    const ext = json.iconDefinitions[def];
    expect(ext).to.exist;
    expect(ext.iconPath).not.to.be.empty;
    expect(json.folderNames['aws']).to.be.equal(def);
    expect(json.folderNamesExpanded['aws']).to.be.equal(`${def}_open`);
  });

  it('ensures filenames extensions are included into the manifest', function () {
    const custom = getEmptyFileCollection();
    custom.supported.push({
      icon: 'webpack',
      extensions: ['webpack.config.js'],
      filename: true,
      format: 'svg',
    });
    const json = getIconGenerator().generateJson(custom, getEmptyFolderCollection());
    const def = `${settings.manifestFilePrefix}webpack`;
    const ext = json.iconDefinitions[def];
    expect(ext).to.exist;
    expect(ext.iconPath).not.to.be.empty;
    expect(json.fileNames['webpack.config.js']).to.be.equal(def);
  });

  it('ensures languageIds extensions are included into the manifest', function () {
    const custom = getEmptyFileCollection();
    custom.supported.push({
      icon: 'c',
      extensions: [],
      languages: [{ ids: 'c', defaultExtension: 'c' }],
      format: 'svg',
    });
    const json = getIconGenerator().generateJson(custom, getEmptyFolderCollection());
    const def = `${settings.manifestFilePrefix}c`;
    const ext = json.iconDefinitions[def];
    expect(ext).to.exist;
    expect(ext.iconPath).not.to.be.empty;
    expect(json.languageIds['c']).to.be.equal(def);
  });

  it('ensures icon paths are always using Unix style', function () {
    const custom = getEmptyFileCollection();
    custom.supported.push({
      icon: 'c',
      extensions: ['c'],
      format: 'svg',
    });
    const json = getIconGenerator().generateJson(custom, getEmptyFolderCollection());
    const def = `${settings.manifestFilePrefix}c`;
    const ext = json.iconDefinitions[def];
    expect(ext).to.exist;
    expect(ext.iconPath).not.to.be.empty;
    expect(ext.iconPath).not.contain('\\');
  });

  it('ensures extensions always use the iconSuffix', function () {
    const custom = getEmptyFileCollection();
    custom.supported.push({
      icon: 'c',
      extensions: ['c'],
      format: 'svg',
    });
    const json = getIconGenerator().generateJson(custom, getEmptyFolderCollection());
    const def = `${settings.manifestFilePrefix}c`;
    const ext = json.iconDefinitions[def];
    expect(ext).to.exist;
    expect(ext.iconPath).not.to.be.empty;
    expect(ext.iconPath).contains(settings.iconSuffix);
  });

  it('ensures default always use the iconSuffix', function () {
    const custom = getEmptyFileCollection();
    const json = getIconGenerator().generateJson(custom, getEmptyFolderCollection());
    const ext = json.iconDefinitions._file;
    expect(ext).to.exist;
    expect(ext.iconPath).not.to.be.empty;
    expect(ext.iconPath).contains(settings.iconSuffix);
  });

});
