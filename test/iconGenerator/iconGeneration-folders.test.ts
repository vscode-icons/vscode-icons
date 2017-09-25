// tslint:disable only-arrow-functions
import * as fs from 'fs';
import * as path from 'path';
import { expect } from 'chai';
import { schema as defaultSchema, IconGenerator } from '../../src/icon-manifest';
import { extensions as folders } from '../../src/icon-manifest/supportedFolders';
import { FileFormat, IFileCollection, IFolderCollection, IIconSchema } from '../../src/models';
import { vscode } from '../../src/utils';
import { extensionSettings as settings } from '../../src/settings';

describe('IconGenerator: folders icon generation test', function () {

  context('ensures that', function () {

    let emptyFileCollection: IFileCollection;
    let emptyFolderCollection: IFolderCollection;

    beforeEach(() => {
      emptyFileCollection = { default: { file: { icon: 'file', format: 'svg' } }, supported: [] };
      emptyFolderCollection = { default: { folder: { icon: 'folder', format: 'svg' } }, supported: [] };
    });

    context('default', function () {

      let schema: IIconSchema;

      beforeEach(() => {
        schema = new IconGenerator(vscode, defaultSchema).generateJson(emptyFileCollection, folders);
      });

      afterEach(() => {
        schema = null;
      });

      it('folder has an icon path',
        function () {
          // tslint:disable-next-line:no-unused-expression
          expect(schema.iconDefinitions._folder.iconPath).not.to.be.empty;
        });

      it('folder has an open icon path',
        function () {
          expect(schema.iconDefinitions._folder_open.iconPath).not.to.be.equal('');
        });

      it('root folder has an icon path',
        function () {
          // tslint:disable-next-line:no-unused-expression
          expect(schema.iconDefinitions._root_folder.iconPath).not.to.be.empty;
        });

      it('root folder has an open icon path',
        function () {
          expect(schema.iconDefinitions._root_folder_open.iconPath).not.to.be.equal('');
        });

      context('if a default \'light\' icon is NOT defined', function () {

        context('each supported', function () {

          const iconsFolderPath = path.join(__dirname, '../../../icons');

          context('folder', function () {

            it('has an associated icon file',
              function () {
                folders.supported
                  .forEach(folder => {
                    const filename =
                      `${settings.folderPrefix}${folder.icon}${settings.iconSuffix}.${FileFormat[folder.format]}`;
                    const iconFilePath = path.join(iconsFolderPath, filename);
                    // tslint:disable-next-line:no-unused-expression
                    expect(fs.existsSync(iconFilePath)).to.be.true;
                  });
              });

            it('has an associated opened icon file',
              function () {
                folders.supported
                  .forEach(folder => {
                    const filename =
                      `${settings.folderPrefix}${folder.icon}_opened` +
                      `${settings.iconSuffix}.${FileFormat[folder.format]}`;
                    const iconFilePath = path.join(iconsFolderPath, filename);
                    // tslint:disable-next-line:no-unused-expression
                    expect(fs.existsSync(iconFilePath)).to.be.true;
                  });
              });

            it('has a definition',
              function () {
                folders.supported
                  .filter(folder => !folder.disabled)
                  .forEach(folder => {
                    const definition = `${settings.manifestFolderPrefix}${folder.icon}`;
                    // tslint:disable-next-line:no-unused-expression
                    expect(schema.iconDefinitions[definition]).exist;
                  });
              });

            it('has an open definition',
              function () {
                folders.supported
                  .filter(folder => !folder.disabled)
                  .forEach(folder => {
                    const definition = `${settings.manifestFolderPrefix}${folder.icon}_open`;
                    // tslint:disable-next-line:no-unused-expression
                    expect(schema.iconDefinitions[definition]).exist;
                  });
              });

            it('has an icon path',
              function () {
                folders.supported
                  .filter(folder => !folder.disabled)
                  .forEach(folder => {
                    const definition = `${settings.manifestFolderPrefix}${folder.icon}`;
                    expect(schema.iconDefinitions[definition].iconPath).not.to.be.equal('');
                  });
              });

            it('has an open icon path',
              function () {
                folders.supported
                  .filter(folder => !folder.disabled)
                  .forEach(folder => {
                    const definition = `${settings.manifestFolderPrefix}${folder.icon}_open`;
                    expect(schema.iconDefinitions[definition].iconPath).not.to.be.equal('');
                  });
              });

            it('has a folder name expanded referencing its definition',
              function () {
                folders.supported
                  .filter(folder => !folder.disabled)
                  .forEach(folder => {
                    const definition = `${settings.manifestFolderPrefix}${folder.icon}_open`;
                    folder.extensions.forEach(extension => {
                      expect(schema.folderNamesExpanded[extension]).equal(definition);
                    });
                  });
              });

            it('has a folder name referencing its definition',
              function () {
                folders.supported
                  .filter(folder => !folder.disabled)
                  .forEach(folder => {
                    const definition = `${settings.manifestFolderPrefix}${folder.icon}`;
                    folder.extensions.forEach(extension => {
                      expect(schema.folderNames[extension]).equals(definition);
                    });
                  });
              });

            context('that has a light theme version', function () {

              it('has an associated icon file',
                function () {
                  folders.supported
                    .filter(folder => folder.light)
                    .forEach(folder => {
                      const filename =
                        `${settings.folderLightPrefix}${folder.icon}` +
                        `${settings.iconSuffix}.${FileFormat[folder.format]}`;
                      const iconFilePath = path.join(iconsFolderPath, filename);
                      // tslint:disable-next-line:no-unused-expression
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
                      // tslint:disable-next-line:no-unused-expression
                      expect(fs.existsSync(iconFilePath)).to.be.true;
                    });
                });

              it('has a \'light\' definition',
                function () {
                  folders.supported
                    .filter(folder => folder.light && !folder.disabled)
                    .forEach(folder => {
                      const definition = `${settings.manifestFolderLightPrefix}${folder.icon}`;
                      // tslint:disable-next-line:no-unused-expression
                      expect(schema.iconDefinitions[definition]).exist;
                    });
                });

              it('has a open \'light\' definition',
                function () {
                  folders.supported
                    .filter(folder => folder.light && !folder.disabled)
                    .forEach(folder => {
                      const definition = `${settings.manifestFolderLightPrefix}${folder.icon}_open`;
                      // tslint:disable-next-line:no-unused-expression
                      expect(schema.iconDefinitions[definition]).exist;
                    });
                });

              it('has an icon path',
                function () {
                  folders.supported
                    .filter(folder => folder.light && !folder.disabled)
                    .forEach(folder => {
                      const definition = `${settings.manifestFolderLightPrefix}${folder.icon}`;
                      expect(schema.iconDefinitions[definition].iconPath).not.to.be.equal('');
                    });
                });

              it('has an open icon path',
                function () {
                  folders.supported
                    .filter(folder => folder.light && !folder.disabled)
                    .forEach(folder => {
                      const definition = `${settings.manifestFolderLightPrefix}${folder.icon}_open`;
                      expect(schema.iconDefinitions[definition].iconPath).not.to.be.equal('');
                    });
                });

              it('has a folder name referencing its \'light\' definition',
                function () {
                  folders.supported
                    .filter(folder => folder.light && !folder.disabled)
                    .forEach(folder => {
                      const definition = `${settings.manifestFolderLightPrefix}${folder.icon}`;
                      folder.extensions.forEach(extension => {
                        expect(schema.light.folderNames[extension]).equal(definition);
                      });
                    });
                });

              it('has a folder name expanded referencing its open \'light\' definition',
                function () {
                  folders.supported
                    .filter(folder => folder.light && !folder.disabled)
                    .forEach(folder => {
                      const definition = `${settings.manifestFolderLightPrefix}${folder.icon}_open`;
                      folder.extensions.forEach(extension => {
                        expect(schema.light.folderNamesExpanded[extension]).equal(definition);
                      });
                    });
                });

            });

          });

        });

      });

    });

    context('if a default \'light\' icon is defined', function () {

      context('each supported', function () {

        context('folder that has not a light theme version', function () {

          let schema: IIconSchema;

          beforeEach(() => {
            const dSchema: IIconSchema = { ...defaultSchema };
            dSchema.iconDefinitions._folder_light.iconPath = 'light_icon';
            schema = new IconGenerator(vscode, dSchema).generateJson(emptyFileCollection, folders);
          });

          afterEach(() => {
            schema = null;
          });

          context('if a default folder icon for light theme is specified', function () {

            it('has a \'light\' definition',
              function () {
                folders.supported
                  .filter(folder => !folder.light && !folder.disabled)
                  .forEach(folder => {
                    const definition = `${settings.manifestFolderLightPrefix}${folder.icon}`;
                    // tslint:disable-next-line:no-unused-expression
                    expect(schema.iconDefinitions[definition]).exist;
                  });
              });

            it('has a folder name referencing its inherited definition',
              function () {
                folders.supported
                  .filter(folder => !folder.light && !folder.disabled)
                  .forEach(folder => {
                    const definition = `${settings.manifestFolderPrefix}${folder.icon}`;
                    folder.extensions.forEach(extension => {
                      expect(schema.light.folderNames[extension]).equals(definition);
                    });
                  });
              });

          });

          context('if a default folder open icon for light theme is specified', function () {

            it('has an open \'light\' definition',
              function () {
                folders.supported
                  .filter(folder => !folder.light && !folder.disabled)
                  .forEach(folder => {
                    const definition = `${settings.manifestFolderLightPrefix}${folder.icon}_open`;
                    // tslint:disable-next-line:no-unused-expression
                    expect(schema.iconDefinitions[definition]).exist;
                  });
              });

            it('has a folder name expanded referencing its inherited definition',
              function () {
                folders.supported
                  .filter(folder => !folder.light && !folder.disabled)
                  .forEach(folder => {
                    const definition = `${settings.manifestFolderPrefix}${folder.icon}_open`;
                    folder.extensions.forEach(extension => {
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
