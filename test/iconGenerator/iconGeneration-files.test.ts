// tslint:disable only-arrow-functions
import * as fs from 'fs';
import * as path from 'path';
import { expect } from 'chai';
import { schema as defaultSchema, IconGenerator } from '../../src/icon-manifest';
import { extensions as files } from '../../src/icon-manifest/supportedExtensions';
import { FileFormat, IFileCollection, IFolderCollection, IIconSchema } from '../../src/models';
import { vscode } from '../../src/utils';
import { extensionSettings as settings } from '../../src/settings';

describe('IconGenerator: files icon generation test', function () {

  context('ensures that', function () {

    let emptyFileCollection: IFileCollection;
    let emptyFolderCollection: IFolderCollection;

    beforeEach(() => {
      emptyFileCollection = { default: { file: { icon: 'file', format: 'svg' } }, supported: [] };
      emptyFolderCollection = { default: { folder: { icon: 'folder', format: 'svg' } }, supported: [] };
    });

    it('filename extension should not have a leading dot',
      function () {
        files.supported
          .filter(file => !file.filename && !file.disabled)
          .forEach(file => {
            file.extensions.forEach(extension => {
              // tslint:disable-next-line:no-unused-expression
              expect(extension.startsWith('.')).to.be.false;
            });
          });

      });

    context('default', function () {

      let iconGenerator: IconGenerator;

      beforeEach(() => {
        iconGenerator = new IconGenerator(vscode, defaultSchema);
      });

      afterEach(() => {
        iconGenerator = null;
      });

      it('file has an icon path',
        function () {
          const schema = iconGenerator.generateJson(files, emptyFolderCollection);
          // tslint:disable-next-line:no-unused-expression
          expect(schema.iconDefinitions._file.iconPath).not.to.be.empty;
        });

      context('if a default \'light\' icon is NOT defined', function () {

        context('each supported', function () {

          const iconsFolderPath = path.join(__dirname, '../../../icons');

          context('file extension', function () {

            it('has an associated icon file', function () {
              files.supported
                .forEach(file => {
                  const filename = `${settings.filePrefix}${file.icon}` +
                    `${settings.iconSuffix}.${FileFormat[file.format]}`;
                  const iconFilePath = path.join(iconsFolderPath, filename);
                  // tslint:disable-next-line:no-unused-expression
                  expect(fs.existsSync(iconFilePath)).to.be.true;
                });
            });

            it('has a definition',
              function () {
                const schema = iconGenerator.generateJson(files, emptyFolderCollection);
                files.supported
                  .filter(file => !file.disabled)
                  .forEach(file => {
                    const definition = `${settings.manifestFilePrefix}${file.icon}`;
                    // tslint:disable-next-line:no-unused-expression
                    expect(schema.iconDefinitions[definition]).exist;
                  });
              });

            it('has an icon path',
              function () {
                const schema = iconGenerator.generateJson(files, emptyFolderCollection);
                files.supported
                  .filter(file => !file.disabled)
                  .forEach(file => {
                    const definition = `${settings.manifestFilePrefix}${file.icon}`;
                    expect(schema.iconDefinitions[definition].iconPath).not.to.be.equal('');
                  });
              });

            it('that has a light theme version, has an associated icon file',
              function () {
                files.supported
                  .filter(file => file.light)
                  .forEach(file => {
                    const filename =
                      `${settings.fileLightPrefix}${file.icon}${settings.iconSuffix}.${FileFormat[file.format]}`;
                    const iconFilePath = path.join(iconsFolderPath, filename);
                    // tslint:disable-next-line:no-unused-expression
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
                    // tslint:disable-next-line:no-unused-expression
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
                    file.extensions.forEach(extension => {
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
                    file.extensions.forEach(extension => {
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
                    file.extensions.forEach(extension => {
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
                    file.extensions.forEach(extension => {
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
                    const assertLanguage = language => {
                      expect(schema.languageIds[language]).equal(definition);
                    };

                    file.languages.forEach(langIds => {
                      if (Array.isArray(langIds.ids)) {
                        langIds.ids.forEach(id => assertLanguage(id));
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
                    const assertLanguageLight = language => {
                      expect(schema.light.languageIds[language]).equal(definition);
                    };

                    file.languages.forEach(langIds => {
                      if (Array.isArray(langIds.ids)) {
                        langIds.ids.forEach(id => assertLanguageLight(id));
                      } else {
                        assertLanguageLight(langIds.ids);
                      }
                    });
                  });

              });

          });

        });

      });

    });

    context('if a default \'light\' icon is defined', function () {

      context('each supported', function () {

        context('file extension', function () {

          context('that has not a light theme version', function () {

            it('and is supported by language ids, has a \'light\' language id referencing its inherited definition',
              function () {
                const dSchema: IIconSchema = { ...defaultSchema };
                dSchema.iconDefinitions._file_light.iconPath = 'light_icon';
                const schema = new IconGenerator(vscode, dSchema).generateJson(files, emptyFolderCollection);
                files.supported
                  .filter(file => file.languages && !file.light && !file.disabled)
                  .forEach(file => {
                    const definition = `${settings.manifestFilePrefix}${file.icon}`;
                    const assignLanguagesLight = language => {
                      expect(schema.light.languageIds[language]).equal(definition);
                    };

                    file.languages.forEach(langIds => {
                      if (Array.isArray(langIds.ids)) {
                        langIds.ids.forEach(id => assignLanguagesLight(id));
                      } else {
                        assignLanguagesLight(langIds.ids);
                      }
                    });
                  });
              });

            it('and is not a filename, has a file extension referencing its inherited definition',
              function () {
                const dSchema: IIconSchema = { ...defaultSchema };
                dSchema.iconDefinitions._file_light.iconPath = 'light_icon';
                const schema = new IconGenerator(vscode, dSchema).generateJson(files, emptyFolderCollection);
                files.supported
                  .filter(file => !file.filename && !file.light && !file.disabled)
                  .forEach(file => {
                    const definition = `${settings.manifestFilePrefix}${file.icon}`;
                    file.extensions.forEach(extension => {
                      expect(schema.light.fileExtensions[extension]).equals(definition);
                    });
                  });
              });

            it('has a \'light\' definition',
              function () {
                const dSchema: IIconSchema = { ...defaultSchema };
                dSchema.iconDefinitions._file_light.iconPath = 'light_icon';
                const schema = new IconGenerator(vscode, dSchema).generateJson(files, emptyFolderCollection);
                files.supported
                  .filter(file => !file.light && !file.disabled)
                  .forEach(file => {
                    const definition = `${settings.manifestFileLightPrefix}${file.icon}`;
                    // tslint:disable-next-line:no-unused-expression
                    expect(schema.iconDefinitions[definition]).exist;
                  });
              });

          });

          it('that has a light theme version and is a filename, ' +
            'has a file name referencing its inherited definition',
            function () {
              const dSchema: IIconSchema = { ...defaultSchema };
              dSchema.iconDefinitions._file_light.iconPath = 'light_icon';
              const schema = new IconGenerator(vscode, dSchema).generateJson(files, emptyFolderCollection);
              files.supported
                .filter(file => file.filename && !file.languages && !file.light && !file.disabled)
                .forEach(file => {
                  const definition = `${settings.manifestFilePrefix}${file.icon}`;
                  file.extensions.forEach(extension => {
                    expect(schema.light.fileNames[extension]).equals(definition);
                  });
                });
            });

        });

      });

    });

  });

});
