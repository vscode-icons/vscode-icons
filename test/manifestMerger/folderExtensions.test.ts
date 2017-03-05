// tslint:disable only-arrow-functions
import * as fs from 'fs';
import * as path from 'path';
import { expect } from 'chai';
import { extensions as fileExtensions } from '../support/supportedExtensions';
import { extensions as folderExtensions } from '../support/supportedFolders';
import { vscode } from '../../src/utils';
import { extensionSettings } from '../../src/settings';
import { IconGenerator, mergeConfig, schema } from '../../src/icon-manifest';
import { IFolderCollection } from '../../src/models';
import { deleteDirectoryRecursively, tempPath } from '../../src/utils';

describe('FolderExtensions: merging configuration documents', function () {

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
      const custom: IFolderCollection = {
        default: null,
        supported: [
          { icon: 'aws', extensions: ['aws3'], format: 'svg' },
        ],
      };

      const json = mergeConfig(null, fileExtensions, custom, folderExtensions, iconGenerator);
      const def = json.iconDefinitions['_fd_aws'];
      expect(def).exist;
      expect(def.iconPath).exist;
      expect(json.folderNames['aws3']).equals('_fd_aws');
      expect(json.folderNamesExpanded['aws3']).equals('_fd_aws_open');
      expect(def.iconPath.substr(def.iconPath.length - 3, 3)).equal('svg');
    });

    it('overrides removes the specified extension', function () {
      const custom: IFolderCollection = {
        default: null,
        supported: [
          { icon: 'aws2', extensions: ['aws2'], overrides: 'aws', format: 'svg' },
        ],
      };

      const json = mergeConfig(null, fileExtensions, custom, folderExtensions, iconGenerator);
      const overridenPath = json.iconDefinitions['_fd_aws'];
      const newPath: string = json.iconDefinitions['_fd_aws2'].iconPath;
      expect(overridenPath).to.not.exist;
      expect(newPath).exist;
    });

    it('extends replaces the extension', function () {
      const custom: IFolderCollection = {
        default: null,
        supported: [
          { icon: 'newExt', extensions: ['mynew'], extends: 'aws', format: 'png' },
        ],
      };

      const json = mergeConfig(null, fileExtensions, custom, folderExtensions, iconGenerator);
      const extendedPath = json.iconDefinitions['_fd_aws'];
      const newPath: string = json.iconDefinitions['_fd_newExt'].iconPath;
      expect(extendedPath).not.to.exist;
      expect(newPath).exist;
      expect(json.folderNames['aws']).equal('_fd_newExt');
      expect(json.folderNamesExpanded['aws']).equal('_fd_newExt_open');
      expect(json.folderNames['mynew']).equal('_fd_newExt');
      expect(json.folderNamesExpanded['mynew']).equal('_fd_newExt_open');
      expect(newPath.substr(newPath.length - 3, 3)).not.equals('svg');
    });

    it('disabled extensions are not included into the manifest', function () {
      const custom: IFolderCollection = {
        default: null,
        supported: [
          { icon: 'aws', extensions: [], disabled: true, format: 'svg' },
        ],
      };
      const json = mergeConfig(null, fileExtensions, custom, folderExtensions, iconGenerator);
      const extendedPath = json.iconDefinitions['_fd_aws'];
      expect(extendedPath).not.to.exist;
      expect(json.iconDefinitions['_fd_newExt']).not.to.exist;
    });

    it('existing extensions are removed from the original extension', function () {
      const custom: IFolderCollection = {
        default: null,
        supported: [
          { icon: 'newExt', extensions: ['aws'], format: 'svg' },
        ],
      };
      const json = mergeConfig(null, fileExtensions, custom, folderExtensions, iconGenerator);
      expect(json.iconDefinitions['_fd_newExt']).exist;
      expect(json.folderNames['aws']).equals('_fd_newExt');
    });

    context('custom icon', function () {

      it('keeps the correct extension', function () {
        const custom: IFolderCollection = {
          default: null,
          supported: [
            {
              icon: 'custom_icon',
              extensions: ['custom'],
              format: 'svg',
            },
          ],
        };
        const json = mergeConfig(null, fileExtensions, custom, folderExtensions, iconGenerator);
        const icon = json.iconDefinitions['_fd_custom_icon'];
        expect(icon).exist;
        expect(path.extname(icon.iconPath)).equals('.svg');
      });

      it('has a custom path', function () {
        const custom: IFolderCollection = {
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
          `${extensionSettings.folderPrefix}${custom.supported[0].icon}` +
          `${extensionSettings.iconSuffix}.${custom.supported[0].format}`;
        const iconNameOpen =
          `${extensionSettings.folderPrefix}${custom.supported[0].icon}_opened` +
          `${extensionSettings.iconSuffix}.${custom.supported[0].format}`;
        const iconNamePath = path.join(extensionSettings.customIconFolderName, iconName);
        const iconNameOpenPath = path.join(extensionSettings.customIconFolderName, iconNameOpen);

        try {
          fs.writeFileSync(iconNamePath, '');
          fs.writeFileSync(iconNameOpenPath, '');

          const json = mergeConfig(null, fileExtensions, custom, folderExtensions, iconGenerator);
          const icon = json.iconDefinitions['_fd_custom_icon'];
          expect(icon).exist;
          expect(icon.iconPath).contains(extensionSettings.customIconFolderName);
          expect(json.folderNames['custom']).equals('_fd_custom_icon');
          expect(json.folderNamesExpanded['custom']).equals('_fd_custom_icon_open');
        } finally {
          if (fs.existsSync(iconNamePath)) {
            fs.unlinkSync(iconNamePath);
          }
          if (fs.existsSync(iconNamePath)) {
            fs.unlinkSync(iconNameOpenPath);
          }
        }
      });

    });

  });

});
