// tslint:disable only-arrow-functions
// tslint:disable no-unused-expression
import fs from 'fs';
import path from 'path';
import { expect } from 'chai';
import { extensions as fileExtensions } from '../support/supportedExtensions';
import { extensions as folderExtensions } from '../support/supportedFolders';
import { extensionSettings } from '../../src/settings';
import { IconGenerator, mergeConfig, schema } from '../../src/icon-manifest';
import * as utils from '../../src/utils';

describe('FileExtensions: merging configuration documents', function () {

  const tempFolderPath = utils.tempPath();
  const customIconFolderPath = 'some/custom/icons/folder/path';
  const customIconFolderPathFull = utils.pathUnixJoin(customIconFolderPath, extensionSettings.customIconFolderName);

  before(() => {
    // ensure the tests write to the temp folder
    process.chdir(tempFolderPath);
    utils.createDirectoryRecursively(extensionSettings.customIconFolderName);
    utils.createDirectoryRecursively(customIconFolderPathFull);
  });

  after(() => {
    utils.deleteDirectoryRecursively(extensionSettings.customIconFolderName);
    utils.deleteDirectoryRecursively(customIconFolderPathFull);
  });

  let iconGenerator: IconGenerator;

  beforeEach(() => {
    iconGenerator = new IconGenerator(utils.vscode, schema);
    iconGenerator.settings.vscodeAppData = tempFolderPath;
  });

  afterEach(() => {
    iconGenerator = null;
  });

  context('ensures that', function () {

    it('new extensions are added to existing file extension and respect the extension type',
      function () {
        const custom: any = {
          default: null,
          supported: [
            { icon: 'actionscript', extensions: ['as2'], format: 'svg' },
          ],
        };
        const json = mergeConfig(custom, fileExtensions, null, folderExtensions, iconGenerator);
        const def = json.iconDefinitions['_f_actionscript'];
        expect(def).exist;
        expect(def.iconPath).exist;
        expect(json.fileExtensions['as2']).to.equals('_f_actionscript');
        expect(path.extname(def.iconPath)).to.equals('.svg');
      });

    it('overrides removes the specified extension',
      function () {
        const custom: any = {
          default: null,
          supported: [
            { icon: 'actionscript2', extensions: ['as2'], overrides: 'actionscript', format: 'svg' },
          ],
        };

        const json = mergeConfig(custom, fileExtensions, null, folderExtensions, iconGenerator);
        const overridenDef = json.iconDefinitions['_f_actionscript'];
        const newPath = json.iconDefinitions['_f_actionscript2'].iconPath;
        expect(overridenDef).to.not.exist;
        expect(newPath).exist;
      });

    it('extends replaces the extension',
      function () {
        const custom: any = {
          default: null,
          supported: [
            { icon: 'newExt', extensions: ['mynew'], extends: 'actionscript', format: 'png' },
          ],
        };

        const json = mergeConfig(custom, fileExtensions, null, folderExtensions, iconGenerator);
        const extendedDef = json.iconDefinitions['_f_actionscript'];
        const newPath = json.iconDefinitions['_f_newExt'].iconPath;
        expect(extendedDef).not.to.exist;
        expect(newPath).exist;
        expect(json.fileExtensions['as']).to.equals('_f_newExt');
        expect(json.fileExtensions['mynew']).to.equals('_f_newExt');
        expect(path.extname(newPath)).not.to.equals('.svg');
      });

    it('disabled extensions are not included into the manifest',
      function () {
        const custom: any = {
          default: null,
          supported: [
            { icon: 'actionscript', extensions: [], disabled: true, format: 'svg' },
          ],
        };
        const json = mergeConfig(custom, fileExtensions, null, folderExtensions, iconGenerator);
        const def = json.iconDefinitions['_f_actionscript'];
        expect(def).not.to.exist;
      });

    it('not disabled extensions are included into the manifest',
      function () {
        const custom: any = {
          default: null,
          supported: [
            { icon: 'actionscript', extensions: [], disabled: false, format: 'svg' },
          ],
        };
        const json = mergeConfig(custom, fileExtensions, null, folderExtensions, iconGenerator);
        const def = json.iconDefinitions['_f_actionscript'];
        expect(def).to.exist;
      });

    it('if extensions is not defined, it gets added internally',
      function () {
        const custom: any = {
          default: null,
          supported: [
            { icon: 'actionscript', disabled: false, format: 'svg' },
          ],
        };
        const json = mergeConfig(custom, fileExtensions, null, folderExtensions, iconGenerator);
        const def = json.iconDefinitions['_f_actionscript'];
        expect(def).to.exist;
      });

    context('existing extensions', function () {

      it('of second set are getting enabled',
        function () {
          const custom: any = {
            default: null,
            supported: [
              { icon: 'ng_component_ts2', extensions: ['component.ts'], format: 'svg' },
              { icon: 'ng_component_js2', extensions: ['component.js'], format: 'svg' },
              { icon: 'ng_smart_component_ts2', extensions: ['page.ts', 'container.ts'], format: 'svg' },
              { icon: 'ng_smart_component_js2', extensions: ['page.js', 'container.js'], format: 'svg' },
              { icon: 'ng_directive_ts2', extensions: ['directive.ts'], format: 'svg' },
              { icon: 'ng_directive_js2', extensions: ['directive.js'], format: 'svg' },
              { icon: 'ng_pipe_ts2', extensions: ['pipe.ts'], format: 'svg' },
              { icon: 'ng_pipe_js2', extensions: ['pipe.js'], format: 'svg' },
              { icon: 'ng_service_ts2', extensions: ['service.ts'], format: 'svg' },
              { icon: 'ng_service_js2', extensions: ['service.js'], format: 'svg' },
              { icon: 'ng_module_ts2', extensions: ['module.ts'], format: 'svg' },
              { icon: 'ng_module_js2', extensions: ['module.js'], format: 'svg' },
              { icon: 'ng_routing_ts2', extensions: ['routing.ts'], format: 'svg' },
              { icon: 'ng_routing_js2', extensions: ['routing.js'], format: 'svg' },
            ],
          };
          const json = mergeConfig(custom, fileExtensions, null, folderExtensions, iconGenerator);
          const ngGroup = Object.keys(json.iconDefinitions).filter(x => /^_f_ng_.*2$/.test(x));
          expect(ngGroup.length).to.equals(14);
        });

      it('are removed from the original extension',
        function () {
          const custom: any = {
            default: null,
            supported: [
              { icon: 'newExt', extensions: ['bin', 'o'], format: 'svg' },
            ],
          };
          const json = mergeConfig(custom, fileExtensions, null, folderExtensions, iconGenerator);
          expect(json.iconDefinitions['_f_newExt']).exist;
          expect(json.fileExtensions['bin']).to.equals('_f_newExt');
          expect(json.fileExtensions['o']).to.equals('_f_newExt');
        });

      it('accept languageId',
        function () {
          const custom: any = {
            default: null,
            supported: [
              {
                icon: 'actionscript',
                extensions: [],
                format: 'svg',
                languages: [{ ids: 'newlang', defaultExtension: 'newlang' }],
              },
            ],
          };
          const json = mergeConfig(custom, fileExtensions, null, folderExtensions, iconGenerator);
          expect(json.iconDefinitions['_f_actionscript']).exist;
          expect(json.languageIds['newlang']).to.equals('_f_actionscript');
        });

    });

    context('custom icon', function () {

      it('keeps the correct extension',
        function () {
          const custom: any = {
            default: null,
            supported: [
              {
                icon: 'custom_icon',
                extensions: ['custom'],
                format: 'svg',
              },
            ],
          };
          const json = mergeConfig(custom, fileExtensions, null, folderExtensions, iconGenerator);
          const customDef = json.iconDefinitions['_f_custom_icon'];
          expect(customDef).exist;
          expect(path.extname(customDef.iconPath)).to.equals('.svg');
        });

      it('has a custom path',
        function () {
          const custom: any = {
            default: null,
            supported: [
              {
                icon: 'custom_icon',
                extensions: ['custom'],
                format: 'svg',
              },
            ],
          };
          const iconName =
            `${extensionSettings.filePrefix}${custom.supported[0].icon}` +
            `${extensionSettings.iconSuffix}.${custom.supported[0].format}`;
          const iconNamePath = path.join(extensionSettings.customIconFolderName, iconName);

          try {
            fs.writeFileSync(iconNamePath, '');

            const json = mergeConfig(custom, fileExtensions, null, folderExtensions, iconGenerator);
            const customDef = json.iconDefinitions['_f_custom_icon'];
            expect(customDef).exist;
            expect(customDef.iconPath).to.contain(extensionSettings.customIconFolderName);
            expect(json.fileExtensions['custom']).to.equals('_f_custom_icon');
          } finally {
            fs.unlinkSync(iconNamePath);
          }
        });

    });

    context('the manifest generator', function () {

      it('uses the custom icon folder path, when provided',
        function () {
          const custom: any = {
            default: null,
            supported: [
              {
                icon: 'custom_icon',
                extensions: ['custom'],
                format: 'svg',
              },
            ],
          };

          iconGenerator = new IconGenerator(utils.vscode, schema, customIconFolderPath);
          iconGenerator.settings.vscodeAppData = tempFolderPath;

          const iconName =
            `${extensionSettings.filePrefix}${custom.supported[0].icon}` +
            `${extensionSettings.iconSuffix}.${custom.supported[0].format}`;
          const iconNamePath = path.join(customIconFolderPathFull, iconName);

          try {
            fs.writeFileSync(iconNamePath, '');

            const json = mergeConfig(custom, fileExtensions, null, folderExtensions, iconGenerator);
            const customDef = json.iconDefinitions['_f_custom_icon'];
            expect(customDef).exist;
            expect(customDef.iconPath).to.contain(customIconFolderPathFull);
          } finally {
            fs.unlinkSync(iconNamePath);
          }
        });

      it('avoids custom icons detection',
        function () {
          const custom: any = {
            default: null,
            supported: [
              {
                icon: 'custom_icon',
                extensions: ['custom'],
                format: 'svg',
              },
            ],
          };

          iconGenerator = new IconGenerator(utils.vscode, schema, customIconFolderPath, /*avoidCustomDetection*/ true);
          iconGenerator.settings.vscodeAppData = tempFolderPath;

          const iconName =
            `${extensionSettings.filePrefix}${custom.supported[0].icon}` +
            `${extensionSettings.iconSuffix}.${custom.supported[0].format}`;
          const iconNamePath = path.join(customIconFolderPathFull, iconName);

          try {
            fs.writeFileSync(iconNamePath, '');

            const json = mergeConfig(custom, fileExtensions, null, folderExtensions, iconGenerator);
            const customDef = json.iconDefinitions['_f_custom_icon'];
            expect(customDef).exist;
            expect(customDef.iconPath.startsWith(iconGenerator.iconsFolderBasePath)).to.be.true;
          } finally {
            fs.unlinkSync(iconNamePath);
          }
        });

    });

  });

});
