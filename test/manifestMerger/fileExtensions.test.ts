// tslint:disable only-arrow-functions
import * as fs from 'fs';
import * as path from 'path';
import { expect } from 'chai';
import { extensions as fileExtensions } from '../support/supportedExtensions';
import { extensions as folderExtensions } from '../support/supportedFolders';
import { vscode } from '../../src/utils';
import { extensionSettings } from '../../src/settings';
import { IconGenerator, mergeConfig, schema } from '../../src/icon-manifest';
import { IFileCollection } from '../../src/models';
import { deleteDirectoryRecursively, tempPath } from '../../src/utils';

describe('FileExtensions: merging configuration documents', function () {

  const tempFolderPath = tempPath();

  before(() => {
    // ensure the tests write to the temp folder
    process.chdir(tempFolderPath);

    if (!fs.existsSync(extensionSettings.customIconFolderName)) {
      fs.mkdirSync(extensionSettings.customIconFolderName);
    }
  });

  after(() => {
    deleteDirectoryRecursively(extensionSettings.customIconFolderName);
  });

  let iconGenerator: IconGenerator;

  beforeEach(() => {
    iconGenerator = new IconGenerator(vscode, schema);
    iconGenerator.settings.vscodeAppData = tempFolderPath;
  });

  afterEach(() => {
    iconGenerator = null;
  });

  context('ensures', function () {

    it('new extensions are added to existing file extension and respect the extension type', function () {
      const custom: IFileCollection = {
        default: null,
        supported: [
          { icon: 'actionscript', extensions: ['as2'], format: 'svg' },
        ],
      };
      const json = mergeConfig(custom, fileExtensions, null, folderExtensions, iconGenerator);
      const def = json.iconDefinitions['_f_actionscript'];
      expect(def).exist;
      expect(def.iconPath).exist;
      expect(json.fileExtensions['as2']).equals('_f_actionscript');
      expect(path.extname(def.iconPath)).equal('.svg');
    });

    it('overrides removes the specified extension', function () {
      const custom: IFileCollection = {
        default: null,
        supported: [
          { icon: 'actionscript2', extensions: ['as2'], overrides: 'actionscript', format: 'svg' },
        ],
      };

      const json = mergeConfig(custom, fileExtensions, null, folderExtensions, iconGenerator);
      const overridenPath = json.iconDefinitions['_f_actionscript'];
      const newPath: string = json.iconDefinitions['_f_actionscript2'].iconPath;
      expect(overridenPath).to.not.exist;
      expect(newPath).exist;
    });

    it('extends replaces the extension', function () {
      const custom: IFileCollection = {
        default: null,
        supported: [
          { icon: 'newExt', extensions: ['mynew'], extends: 'actionscript', format: 'png' },
        ],
      };

      const json = mergeConfig(custom, fileExtensions, null, folderExtensions, iconGenerator);
      const extendedPath = json.iconDefinitions['_f_actionscript'];
      const newPath: string = json.iconDefinitions['_f_newExt'].iconPath;
      expect(extendedPath).not.to.exist;
      expect(newPath).exist;
      expect(json.fileExtensions['as']).equal('_f_newExt');
      expect(json.fileExtensions['mynew']).equal('_f_newExt');
      expect(path.extname(newPath)).not.equals('.svg');
    });

    it('disabled extensions are not included into the manifest', function () {
      const custom: IFileCollection = {
        default: null,
        supported: [
          { icon: 'actionscript', extensions: [], disabled: true, format: 'svg' },
        ],
      };
      const json = mergeConfig(custom, fileExtensions, null, folderExtensions, iconGenerator);
      const extendedPath = json.iconDefinitions['_f_actionscript'];
      expect(extendedPath).not.to.exist;
      expect(json.iconDefinitions['_f_newExt']).not.to.exist;
    });

    context('existing extensions', function () {

      it('of second set are getting enabled', function () {
        const custom: IFileCollection = {
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
        const ngGroup = Object.keys(json.iconDefinitions).filter(x => x.startsWith('_f_ng_') && x.endsWith('2'));
        expect(ngGroup.length).equals(14);
      });

      it('are removed from the original extension', function () {
        const custom: IFileCollection = {
          default: null,
          supported: [
            { icon: 'newExt', extensions: ['bin', 'o'], format: 'svg' },
          ],
        };
        const json = mergeConfig(custom, fileExtensions, null, folderExtensions, iconGenerator);
        expect(json.iconDefinitions['_f_newExt']).exist;
        expect(json.fileExtensions['bin']).equals('_f_newExt');
        expect(json.fileExtensions['o']).equals('_f_newExt');
      });

      it('accept languageId', function () {
        const custom: IFileCollection = {
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
        expect(json.languageIds['newlang']).equals('_f_actionscript');
      });

    });

    context('custom icon', function () {

      it('keeps the correct extension', function () {
        const custom: IFileCollection = {
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
        const icon = json.iconDefinitions['_f_custom_icon'];
        expect(icon).exist;
        expect(path.extname(icon.iconPath)).equals('.svg');
      });

      it('has a custom path', function () {
        const custom: IFileCollection = {
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
          const icon = json.iconDefinitions['_f_custom_icon'];
          expect(icon).exist;
          expect(icon.iconPath).contains(extensionSettings.customIconFolderName);
          expect(json.fileExtensions['custom']).equals('_f_custom_icon');
        } finally {
          if (fs.existsSync(iconNamePath)) {
            fs.unlinkSync(iconNamePath);
          }
        }
      });

    });

  });

});
