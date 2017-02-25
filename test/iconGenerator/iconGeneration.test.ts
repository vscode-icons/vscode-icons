/* tslint:disable only-arrow-functions */
import * as fs from 'fs';
import * as path from 'path';
import { expect } from 'chai';
import { schema as defaultSchema, IconGenerator } from '../../src/icon-manifest';
import { extensions as files } from '../../src/icon-manifest/supportedExtensions';
import { extensions as folders } from '../../src/icon-manifest/supportedFolders';
import { FileFormat, IFileCollection, IFolderCollection, IIconSchema } from '../../src/models';
import { vscode } from '../../src/utils';
import { extensionSettings as settings } from '../../src/settings';

describe('IconGenerator: icon generation test', function () {

  describe('ensures', function () {

    let emptyFileCollection: IFileCollection;
    let emptyFolderCollection: IFolderCollection;

    beforeEach(() => {
      emptyFileCollection = { default: { file: { icon: 'file', format: 'svg' } }, supported: [] };
      emptyFolderCollection = { default: { folder: { icon: 'folder', format: 'svg' } }, supported: [] };
    });

    it('filename extension should not have a leading dot', function () {
      files.supported
        .filter(file => !file.filename && !file.disabled)
        .forEach(file => {
          file.extensions.forEach(extension => {
            expect(extension.startsWith('.')).to.be.false;
          });
        });

    });

    describe('default', function () {

      let iconGenerator: IconGenerator;

      beforeEach(() => {
        iconGenerator = new IconGenerator(vscode, defaultSchema);
      });

      afterEach(() => {
        iconGenerator = null;
      });

      it('file has an icon path', function () {
        const schema = iconGenerator.generateJson(files, emptyFolderCollection);
        expect(schema.iconDefinitions._file.iconPath).not.to.be.empty;
      });

      it('folder has an icon path', function () {
        const schema = iconGenerator.generateJson(emptyFileCollection, folders);
        expect(schema.iconDefinitions._folder.iconPath).not.to.be.empty;
      });

      it('folder has an open icon path', function () {
        const schema = iconGenerator.generateJson(emptyFileCollection, folders);
        expect(schema.iconDefinitions._folder_open.iconPath).not.to.be.equal('');
      });

      describe('if a default \'light\' icon is NOT defined', function () {

        describe('each supported', function () {

          const iconsFolderPath = path.join(__dirname, '../../../icons');

          describe('file extension', function () {

            it('has an associated icon file', function () {
              files.supported
                .forEach(file => {
                  const filename = `${settings.filePrefix}${file.icon}` +
                    `${settings.iconSuffix}.${FileFormat[file.format]}`;
                  const iconFilePath = path.join(iconsFolderPath, filename);
                  expect(fs.existsSync(iconFilePath)).to.be.true;
                });
            });

            it('has a definition', function () {
              const schema = iconGenerator.generateJson(files, emptyFolderCollection);
              files.supported
                .filter(file => !file.disabled)
                .forEach(file => {
                  const definition = `${settings.manifestFilePrefix}${file.icon}`;
                  expect(schema.iconDefinitions[definition]).exist;
                });
            });

            it('has an icon path', function () {
              const schema = iconGenerator.generateJson(files, emptyFolderCollection);
              files.supported
                .filter(file => !file.disabled)
                .forEach(file => {
                  const definition = `${settings.manifestFilePrefix}${file.icon}`;
                  expect(schema.iconDefinitions[definition].iconPath).not.to.be.equal('');
                });
            });

            it('that has a light theme version, has an associated icon file', function () {
              files.supported
                .filter(file => file.light)
                .forEach(file => {
                  const filename =
                    `${settings.fileLightPrefix}${file.icon}${settings.iconSuffix}.${FileFormat[file.format]}`;
                  const iconFilePath = path.join(iconsFolderPath, filename);
                  expect(fs.existsSync(iconFilePath)).to.be.true;
                });
            });

            it('that has a light theme version, has a \'light\' definition',
              function () {
                const schema = iconGenerator.generateJson(files, emptyFolderCollection);
                files.supported
                  .filter(file => file.light && !file.disabled)
                  .forEach(file => {
                    const definition = `${settings.manifestFileLightPrefix}${file.icon}`;
                    expect(schema.iconDefinitions[definition]).exist;
                  });
              });

            it('that has a light theme version, has an icon path',
              function () {
                const schema = iconGenerator.generateJson(files, emptyFolderCollection);
                files.supported
                  .filter(file => file.light && !file.disabled)
                  .forEach(file => {
                    const definition = `${settings.manifestFileLightPrefix}${file.icon}`;
                    expect(schema.iconDefinitions[definition].iconPath).not.to.be.equal('');
                  });
              });

            it('that is not a filename, has a file extension referencing its definition',
              function () {
                const schema = iconGenerator.generateJson(files, emptyFolderCollection);
                files.supported
                  .filter(file => !file.filename && !file.disabled)
                  .forEach(file => {
                    const definition = `${settings.manifestFilePrefix}${file.icon}`;
                    file.extensions.forEach(function (extension) {
                      expect(schema.fileExtensions[extension]).equal(definition);
                    });
                  });
              });

            it('that is not a filename and has a light theme version, ' +
              'has a file extension referencing its \'light\' definition',
              function () {
                const schema = iconGenerator.generateJson(files, emptyFolderCollection);
                files.supported
                  .filter(file => !file.filename && file.light && !file.disabled)
                  .forEach(file => {
                    const definition = `${settings.manifestFileLightPrefix}${file.icon}`;
                    file.extensions.forEach(function (extension) {
                      expect(schema.light.fileExtensions[extension]).equal(definition);
                    });
                  });
              });

            it('that is a filename, has a file name referencing its definition',
              function () {
                const schema = iconGenerator.generateJson(files, emptyFolderCollection);
                files.supported
                  .filter(file => file.filename && !file.languages && !file.disabled)
                  .forEach(file => {
                    const definition = `${settings.manifestFilePrefix}${file.icon}`;
                    file.extensions.forEach(function (extension) {
                      expect(schema.fileNames[extension]).equal(definition);
                    });
                  });
              });

            it('that is a filename and has a light theme version, has a file name referencing its \'light\' definition',
              function () {
                const schema = iconGenerator.generateJson(files, emptyFolderCollection);
                files.supported
                  .filter(file => file.filename && !file.languages && file.light && !file.disabled)
                  .forEach(file => {
                    const definition = `${settings.manifestFileLightPrefix}${file.icon}`;
                    file.extensions.forEach(function (extension) {
                      expect(schema.light.fileNames[extension]).equal(definition);
                    });
                  });
              });

            it('that is supported by language ids, has a language id referencing its definition',
              function () {
                const schema = iconGenerator.generateJson(files, emptyFolderCollection);
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

            it('that is supported by language ids and has a light theme version, ' +
              'has a language id referencing its \'light\' definition',
              function () {
                const schema = iconGenerator.generateJson(files, emptyFolderCollection);
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

          });

          describe('folder', function () {

            it('has an associated icon file', function () {
              folders.supported
                .forEach(folder => {
                  const filename =
                    `${settings.folderPrefix}${folder.icon}${settings.iconSuffix}.${FileFormat[folder.format]}`;
                  const iconFilePath = path.join(iconsFolderPath, filename);
                  expect(fs.existsSync(iconFilePath)).to.be.true;
                });
            });

            it('has an associated opened icon file', function () {
              folders.supported
                .forEach(folder => {
                  const filename =
                    `${settings.folderPrefix}${folder.icon}_opened${settings.iconSuffix}.${FileFormat[folder.format]}`;
                  const iconFilePath = path.join(iconsFolderPath, filename);
                  expect(fs.existsSync(iconFilePath)).to.be.true;
                });
            });

            it('has a definition', function () {
              const schema = iconGenerator.generateJson(emptyFileCollection, folders);
              folders.supported
                .filter(folder => !folder.disabled)
                .forEach(folder => {
                  const definition = `${settings.manifestFolderPrefix}${folder.icon}`;
                  expect(schema.iconDefinitions[definition]).exist;
                });
            });

            it('has an open definition', function () {
              const schema = iconGenerator.generateJson(emptyFileCollection, folders);
              folders.supported
                .filter(folder => !folder.disabled)
                .forEach(folder => {
                  const definition = `${settings.manifestFolderPrefix}${folder.icon}_open`;
                  expect(schema.iconDefinitions[definition]).exist;
                });
            });

            it('has an icon path', function () {
              const schema = iconGenerator.generateJson(emptyFileCollection, folders);
              folders.supported
                .filter(folder => !folder.disabled)
                .forEach(folder => {
                  const definition = `${settings.manifestFolderPrefix}${folder.icon}`;
                  expect(schema.iconDefinitions[definition].iconPath).not.to.be.equal('');
                });
            });

            it('has an open icon path', function () {
              const schema = iconGenerator.generateJson(emptyFileCollection, folders);
              folders.supported
                .filter(folder => !folder.disabled)
                .forEach(folder => {
                  const definition = `${settings.manifestFolderPrefix}${folder.icon}_open`;
                  expect(schema.iconDefinitions[definition].iconPath).not.to.be.equal('');
                });
            });

            it('has a folder name expanded referencing its definition',
              function () {
                const schema = iconGenerator.generateJson(emptyFileCollection, folders);
                folders.supported
                  .filter(folder => !folder.disabled)
                  .forEach(folder => {
                    const definition = `${settings.manifestFolderPrefix}${folder.icon}_open`;
                    folder.extensions.forEach(function (extension) {
                      expect(schema.folderNamesExpanded[extension]).equal(definition);
                    });
                  });
              });

            it('has a folder name referencing its definition',
              function () {
                const schema = iconGenerator.generateJson(emptyFileCollection, folders);
                folders.supported
                  .filter(folder => !folder.disabled)
                  .forEach(folder => {
                    const definition = `${settings.manifestFolderPrefix}${folder.icon}`;
                    folder.extensions.forEach(function (extension) {
                      expect(schema.folderNames[extension]).equals(definition);
                    });
                  });
              });

            describe('that has a light theme version', function () {

              it('has an associated icon file',
                function () {
                  folders.supported
                    .filter(folder => folder.light)
                    .forEach(folder => {
                      const filename =
                        `${settings.folderLightPrefix}${folder.icon}` +
                        `${settings.iconSuffix}.${FileFormat[folder.format]}`;
                      const iconFilePath = path.join(iconsFolderPath, filename);
                      expect(fs.existsSync(iconFilePath)).to.be.true;
                    });
                });

              it('has an associated opened icon file',
                function () {
                  folders.supported
                    .filter(folder => folder.light)
                    .forEach(folder => {
                      const filename =
                        `${settings.folderLightPrefix}${folder.icon}` +
                        `_opened${settings.iconSuffix}.${FileFormat[folder.format]}`;
                      const iconFilePath = path.join(iconsFolderPath, filename);
                      expect(fs.existsSync(iconFilePath)).to.be.true;
                    });
                });

              it('has a \'light\' definition',
                function () {
                  const schema = iconGenerator.generateJson(emptyFileCollection, folders);
                  folders.supported
                    .filter(folder => folder.light && !folder.disabled)
                    .forEach(folder => {
                      const definition = `${settings.manifestFolderLightPrefix}${folder.icon}`;
                      expect(schema.iconDefinitions[definition]).exist;
                    });
                });

              it('has a open \'light\' definition',
                function () {
                  const schema = iconGenerator.generateJson(emptyFileCollection, folders);
                  folders.supported
                    .filter(folder => folder.light && !folder.disabled)
                    .forEach(folder => {
                      const definition = `${settings.manifestFolderLightPrefix}${folder.icon}_open`;
                      expect(schema.iconDefinitions[definition]).exist;
                    });
                });

              it('has an icon path',
                function () {
                  const schema = iconGenerator.generateJson(emptyFileCollection, folders);
                  folders.supported
                    .filter(folder => folder.light && !folder.disabled)
                    .forEach(folder => {
                      const definition = `${settings.manifestFolderLightPrefix}${folder.icon}`;
                      expect(schema.iconDefinitions[definition].iconPath).not.to.be.equal('');
                    });
                });

              it('has an open icon path',
                function () {
                  const schema = iconGenerator.generateJson(emptyFileCollection, folders);
                  folders.supported
                    .filter(folder => folder.light && !folder.disabled)
                    .forEach(folder => {
                      const definition = `${settings.manifestFolderLightPrefix}${folder.icon}_open`;
                      expect(schema.iconDefinitions[definition].iconPath).not.to.be.equal('');
                    });
                });

              it('has a folder name referencing its \'light\' definition',
                function () {
                  const schema = iconGenerator.generateJson(emptyFileCollection, folders);
                  folders.supported
                    .filter(folder => folder.light && !folder.disabled)
                    .forEach(folder => {
                      const definition = `${settings.manifestFolderLightPrefix}${folder.icon}`;
                      folder.extensions.forEach(function (extension) {
                        expect(schema.light.folderNames[extension]).equal(definition);
                      });
                    });
                });

              it('has a folder name expanded referencing its open \'light\' definition',
                function () {
                  const schema = iconGenerator.generateJson(emptyFileCollection, folders);
                  folders.supported
                    .filter(folder => folder.light && !folder.disabled)
                    .forEach(folder => {
                      const definition = `${settings.manifestFolderLightPrefix}${folder.icon}_open`;
                      folder.extensions.forEach(function (extension) {
                        expect(schema.light.folderNamesExpanded[extension]).equal(definition);
                      });
                    });
                });

            });

          });

        });

      });

    });

    describe('if a default \'light\' icon is defined', function () {

      describe('each supported', function () {

        describe('file extension', function () {

          describe('that has not a light theme version', function () {

            it('and is supported by language ids, has a \'light\' language id referencing its inherited definition',
              function () {
                const dSchema = Object.assign({}, defaultSchema) as IIconSchema;
                dSchema.iconDefinitions._file_light.iconPath = 'light_icon';
                const schema = new IconGenerator(vscode, dSchema).generateJson(files, emptyFolderCollection);
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

            it('and is not a filename, has a file extension referencing its inherited definition',
              function () {
                const dSchema = Object.assign({}, defaultSchema) as IIconSchema;
                dSchema.iconDefinitions._file_light.iconPath = 'light_icon';
                const schema = new IconGenerator(vscode, dSchema).generateJson(files, emptyFolderCollection);
                files.supported
                  .filter(file => !file.filename && !file.light && !file.disabled)
                  .forEach(file => {
                    const definition = `${settings.manifestFilePrefix}${file.icon}`;
                    file.extensions.forEach(function (extension) {
                      expect(schema.light.fileExtensions[extension]).equals(definition);
                    });
                  });
              });

            it('has a \'light\' definition',
              function () {
                const dSchema = Object.assign({}, defaultSchema) as IIconSchema;
                dSchema.iconDefinitions._file_light.iconPath = 'light_icon';
                const schema = new IconGenerator(vscode, dSchema).generateJson(files, emptyFolderCollection);
                files.supported
                  .filter(file => !file.light && !file.disabled)
                  .forEach(file => {
                    const definition = `${settings.manifestFileLightPrefix}${file.icon}`;
                    expect(schema.iconDefinitions[definition]).exist;
                  });
              });

          });

          it('that has a light theme version and is a filename, ' +
            'has a file name referencing its inherited definition',
            function () {
              const dSchema = Object.assign({}, defaultSchema) as IIconSchema;
              dSchema.iconDefinitions._file_light.iconPath = 'light_icon';
              const schema = new IconGenerator(vscode, dSchema).generateJson(files, emptyFolderCollection);
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

        describe('folder that has not a light theme version', function () {

          describe('if a default folder icon for light theme is specified', function () {

            it('has a \'light\' definition',
              function () {
                const dSchema = Object.assign({}, defaultSchema) as IIconSchema;
                dSchema.iconDefinitions._folder_light.iconPath = 'light_icon';
                const schema = new IconGenerator(vscode, dSchema).generateJson(emptyFileCollection, folders);
                folders.supported
                  .filter(folder => !folder.light && !folder.disabled)
                  .forEach(folder => {
                    const definition = `${settings.manifestFolderLightPrefix}${folder.icon}`;
                    expect(schema.iconDefinitions[definition]).exist;
                  });
              });

            it('has a folder name referencing its inherited definition',
              function () {
                const dSchema = Object.assign({}, defaultSchema) as IIconSchema;
                dSchema.iconDefinitions._folder_light.iconPath = 'light_icon';
                const schema = new IconGenerator(vscode, dSchema).generateJson(emptyFileCollection, folders);
                folders.supported
                  .filter(folder => !folder.light && !folder.disabled)
                  .forEach(folder => {
                    const definition = `${settings.manifestFolderPrefix}${folder.icon}`;
                    folder.extensions.forEach(function (extension) {
                      expect(schema.light.folderNames[extension]).equals(definition);
                    });
                  });
              });

          });

          describe('if a default folder open icon for light theme is specified', function () {

            it('has an open \'light\' definition',
              function () {
                const dSchema = Object.assign({}, defaultSchema) as IIconSchema;
                dSchema.iconDefinitions._folder_light.iconPath = 'light_icon';
                const schema = new IconGenerator(vscode, dSchema).generateJson(emptyFileCollection, folders);
                folders.supported
                  .filter(folder => !folder.light && !folder.disabled)
                  .forEach(folder => {
                    const definition = `${settings.manifestFolderLightPrefix}${folder.icon}_open`;
                    expect(schema.iconDefinitions[definition]).exist;
                  });
              });

            it('has a folder name expanded referencing its inherited definition',
              function () {
                const dSchema = Object.assign({}, defaultSchema) as IIconSchema;
                dSchema.iconDefinitions._folder_light.iconPath = 'light_icon';
                const schema = new IconGenerator(vscode, dSchema).generateJson(emptyFileCollection, folders);
                folders.supported
                  .filter(folder => !folder.light && !folder.disabled)
                  .forEach(folder => {
                    const definition = `${settings.manifestFolderPrefix}${folder.icon}_open`;
                    folder.extensions.forEach(function (extension) {
                      expect(schema.light.folderNamesExpanded[extension]).equals(definition);
                    });
                  });
              });

          });

        });

      });

    });

  });

});
