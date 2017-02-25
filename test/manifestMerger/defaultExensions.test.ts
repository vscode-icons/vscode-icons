// tslint:disable only-arrow-functions
import * as fs from 'fs';
import * as path from 'path';
import { expect } from 'chai';
import { extensions as fileExtensions } from '../support/supportedExtensions';
import { extensions as folderExtensions } from '../support/supportedFolders';
import { vscode } from '../../src/utils';
import { extensionSettings } from '../../src/settings';
import { IconGenerator, mergeConfig, schema } from '../../src/icon-manifest';
import { IFileCollection, IFolderCollection } from '../../src/models';
import { deleteDirectoryRecursively, tempPath } from '../../src/utils';

describe('DefaultExtensions: merging configuration documents', function () {

  const tempFolderPath = tempPath();

  before(() => {
    // ensure the tests write to the temp folder
    process.chdir(tempFolderPath);

    if (fs.existsSync(extensionSettings.customIconFolderName)) {
      return;
    }

    fs.mkdir(extensionSettings.customIconFolderName);
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

    context('default file icons can be', function () {

      it('added', function () {

        const custom: IFileCollection = {
          default: {
            file_light: { icon: 'customIconLight', format: 'svg' },
          },
          supported: [],
        };
        const iconName =
          `${extensionSettings.defaultExtensionPrefix}${custom.default.file_light.icon}` +
          `${extensionSettings.iconSuffix}.${custom.default.file_light.format}`;

        try {
          fs.writeFileSync(path.join(extensionSettings.customIconFolderName, iconName), '');

          const json = mergeConfig(custom, fileExtensions, null, folderExtensions, iconGenerator);
          const def = json.iconDefinitions._file_light;
          expect(def).exist;
          expect(def.iconPath).exist;
          expect(def.iconPath).contain(iconName);
          expect(def.iconPath).contain(extensionSettings.customIconFolderName);
        } finally {
          fs.unlinkSync(path.join(extensionSettings.customIconFolderName, iconName));
        }
      });

      it('overriden', function () {
        const custom: IFileCollection = {
          default: {
            file: { icon: 'customIcon', format: 'svg' },
          },
          supported: [],
        };
        const iconName =
          `${extensionSettings.defaultExtensionPrefix}${custom.default.file.icon}` +
          `${extensionSettings.iconSuffix}.${custom.default.file.format}`;

        try {
          fs.writeFileSync(path.join(extensionSettings.customIconFolderName, iconName), '');

          const json = mergeConfig(custom, fileExtensions, null, folderExtensions, iconGenerator);
          const def = json.iconDefinitions._file;
          expect(def).exist;
          expect(def.iconPath).exist;
          expect(def.iconPath).contain(iconName);
          expect(def.iconPath).contain(extensionSettings.customIconFolderName);
        } finally {
          fs.unlinkSync(path.join(extensionSettings.customIconFolderName, iconName));
        }
      });

      it('disabled', function () {
        const custom: IFileCollection = {
          default: {
            file: { icon: '', format: 'svg', disabled: true },
          },
          supported: [],
        };
        const json = mergeConfig(custom, fileExtensions, null, folderExtensions, iconGenerator);
        const def = json.iconDefinitions._file;
        expect(def).exist;
        expect(def.iconPath).to.be.empty;
      });

    });

    context('default folder icons can be', function () {

      it('added', function () {
        const custom: IFolderCollection = {
          default: {
            folder_light: { icon: 'customIconLight', format: 'svg' },
          },
          supported: [],
        };
        const iconName =
          `${extensionSettings.defaultExtensionPrefix}${custom.default.folder_light.icon}` +
          `${extensionSettings.iconSuffix}.${custom.default.folder_light.format}`;
        const iconNameOpen =
          `${extensionSettings.defaultExtensionPrefix}${custom.default.folder_light.icon}_opened` +
          `${extensionSettings.iconSuffix}.${custom.default.folder_light.format}`;

        try {
          fs.writeFileSync(path.join(extensionSettings.customIconFolderName, iconName), '');
          fs.writeFileSync(path.join(extensionSettings.customIconFolderName, iconNameOpen), '');

          const json = mergeConfig(null, fileExtensions, custom, folderExtensions, iconGenerator);
          const def = json.iconDefinitions._folder_light;
          const defOpen = json.iconDefinitions._folder_light_open;
          expect(def).exist;
          expect(defOpen).exist;
          expect(def.iconPath).exist;
          expect(defOpen.iconPath).exist;
          expect(def.iconPath).contain(iconName);
          expect(defOpen.iconPath).contain(iconNameOpen);
          expect(def.iconPath).contain(extensionSettings.customIconFolderName);
          expect(defOpen.iconPath).contain(extensionSettings.customIconFolderName);
        } finally {
          fs.unlinkSync(path.join(extensionSettings.customIconFolderName, iconName));
          fs.unlinkSync(path.join(extensionSettings.customIconFolderName, iconNameOpen));
        }
      });

      it('overriden', function () {
        const custom: IFolderCollection = {
          default: {
            folder: { icon: 'customIcon', format: 'svg' },
          },
          supported: [],
        };
        const iconName =
          `${extensionSettings.defaultExtensionPrefix}${custom.default.folder.icon}` +
          `${extensionSettings.iconSuffix}.${custom.default.folder.format}`;
        const iconNameOpen =
          `${extensionSettings.defaultExtensionPrefix}${custom.default.folder.icon}_opened` +
          `${extensionSettings.iconSuffix}.${custom.default.folder.format}`;

        try {
          fs.writeFileSync(path.join(extensionSettings.customIconFolderName, iconName), '');
          fs.writeFileSync(path.join(extensionSettings.customIconFolderName, iconNameOpen), '');

          const json = mergeConfig(null, fileExtensions, custom, folderExtensions, iconGenerator);
          const def = json.iconDefinitions._folder;
          const defOpen = json.iconDefinitions._folder_open;
          expect(def).exist;
          expect(defOpen).exist;
          expect(def.iconPath).exist;
          expect(defOpen.iconPath).exist;
          expect(def.iconPath).contain(iconName);
          expect(defOpen.iconPath).contain(iconNameOpen);
          expect(def.iconPath).contain(extensionSettings.customIconFolderName);
          expect(defOpen.iconPath).contain(extensionSettings.customIconFolderName);
        } finally {
          fs.unlinkSync(path.join(extensionSettings.customIconFolderName, iconName));
          fs.unlinkSync(path.join(extensionSettings.customIconFolderName, iconNameOpen));
        }
      });

      it('disabled', function () {
        const custom: IFolderCollection = {
          default: {
            folder: { icon: 'customIcon', format: 'svg', disabled: true },
          },
          supported: [],
        };
        const json = mergeConfig(null, fileExtensions, custom, folderExtensions, iconGenerator);
        const def = json.iconDefinitions._folder;
        const defOpen = json.iconDefinitions._folder_open;
        expect(def).exist;
        expect(defOpen).exist;
        expect(def.iconPath).to.be.empty;
        expect(defOpen.iconPath).to.be.empty;
      });

    });

  });

});
