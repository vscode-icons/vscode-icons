// tslint:disable only-arrow-functions
// tslint:disable no-unused-expression
import fs from 'fs';
import path from 'path';
import { expect } from 'chai';
import { extensions as fileExtensions } from '../support/supportedExtensions';
import { extensions as folderExtensions } from '../support/supportedFolders';
import { extensionSettings } from '../../src/settings';
import { IconGenerator, mergeConfig, schema } from '../../src/icon-manifest';
import { IFileCollection, IFolderCollection } from '../../src/models';
import * as utils from '../../src/utils';

describe('DefaultExtensions: merging configuration documents', function () {

  const tempFolderPath = utils.tempPath();

  before(() => {
    // ensure the tests write to the temp folder
    process.chdir(tempFolderPath);

    utils.createDirectoryRecursively(extensionSettings.customIconFolderName);
  });

  after(() => {
    utils.deleteDirectoryRecursively(extensionSettings.customIconFolderName);
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

    context('default file icons can be', function () {

      it('added',
        function () {

          const custom: IFileCollection = {
            default: {
              file_light: { icon: 'customFileIconLight', format: 'svg' },
            },
            supported: [],
          };
          const iconName =
            `${extensionSettings.defaultExtensionPrefix}${custom.default.file_light.icon}` +
            `${extensionSettings.iconSuffix}.${custom.default.file_light.format}`;
          const iconNamePath = path.join(extensionSettings.customIconFolderName, iconName);

          try {
            fs.writeFileSync(iconNamePath, '');

            const json = mergeConfig(custom, fileExtensions, null, folderExtensions, iconGenerator);
            const def = json.iconDefinitions._file_light;
            expect(def).exist;
            expect(def.iconPath).exist;
            expect(def.iconPath).to.contain(iconName);
            expect(def.iconPath).to.contain(extensionSettings.customIconFolderName);
          } finally {
            fs.unlinkSync(iconNamePath);
          }
        });

      it('overriden',
        function () {
          const custom: IFileCollection = {
            default: {
              file: { icon: 'customFileIcon', format: 'svg' },
            },
            supported: [],
          };
          const iconName =
            `${extensionSettings.defaultExtensionPrefix}${custom.default.file.icon}` +
            `${extensionSettings.iconSuffix}.${custom.default.file.format}`;
          const iconNamePath = path.join(extensionSettings.customIconFolderName, iconName);

          try {
            fs.writeFileSync(iconNamePath, '');

            const json = mergeConfig(custom, fileExtensions, null, folderExtensions, iconGenerator);
            const def = json.iconDefinitions._file;
            expect(def).exist;
            expect(def.iconPath).exist;
            expect(def.iconPath).to.contain(iconName);
            expect(def.iconPath).to.contain(extensionSettings.customIconFolderName);
          } finally {
            fs.unlinkSync(iconNamePath);
          }
        });

      it('disabled',
        function () {
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

      it('added',
        function () {
          const custom: IFolderCollection = {
            default: {
              folder_light: { icon: 'customFolderIconLight', format: 'svg' },
            },
            supported: [],
          };
          const iconName =
            `${extensionSettings.defaultExtensionPrefix}${custom.default.folder_light.icon}` +
            `${extensionSettings.iconSuffix}.${custom.default.folder_light.format}`;
          const iconNameOpen =
            `${extensionSettings.defaultExtensionPrefix}${custom.default.folder_light.icon}_opened` +
            `${extensionSettings.iconSuffix}.${custom.default.folder_light.format}`;
          const iconNamePath = path.join(extensionSettings.customIconFolderName, iconName);
          const iconNameOpenPath = path.join(extensionSettings.customIconFolderName, iconNameOpen);

          try {
            fs.writeFileSync(iconNamePath, '');
            fs.writeFileSync(iconNameOpenPath, '');

            const json = mergeConfig(null, fileExtensions, custom, folderExtensions, iconGenerator);
            const def = json.iconDefinitions._folder_light;
            const defOpen = json.iconDefinitions._folder_light_open;
            expect(def).exist;
            expect(defOpen).exist;
            expect(def.iconPath).exist;
            expect(defOpen.iconPath).exist;
            expect(def.iconPath).to.contain(iconName);
            expect(defOpen.iconPath).to.contain(iconNameOpen);
            expect(def.iconPath).to.contain(extensionSettings.customIconFolderName);
            expect(defOpen.iconPath).to.contain(extensionSettings.customIconFolderName);
          } finally {
            fs.unlinkSync(iconNamePath);
            fs.unlinkSync(iconNameOpenPath);
          }
        });

      it('overriden',
        function () {
          const custom: IFolderCollection = {
            default: {
              folder: { icon: 'customFolderIcon', format: 'svg' },
            },
            supported: [],
          };
          const iconName =
            `${extensionSettings.defaultExtensionPrefix}${custom.default.folder.icon}` +
            `${extensionSettings.iconSuffix}.${custom.default.folder.format}`;
          const iconNameOpen =
            `${extensionSettings.defaultExtensionPrefix}${custom.default.folder.icon}_opened` +
            `${extensionSettings.iconSuffix}.${custom.default.folder.format}`;
          const iconNamePath = path.join(extensionSettings.customIconFolderName, iconName);
          const iconNameOpenPath = path.join(extensionSettings.customIconFolderName, iconNameOpen);

          try {
            fs.writeFileSync(iconNamePath, '');
            fs.writeFileSync(iconNameOpenPath, '');

            const json = mergeConfig(null, fileExtensions, custom, folderExtensions, iconGenerator);
            const def = json.iconDefinitions._folder;
            const defOpen = json.iconDefinitions._folder_open;
            expect(def).exist;
            expect(defOpen).exist;
            expect(def.iconPath).exist;
            expect(defOpen.iconPath).exist;
            expect(def.iconPath).to.contain(iconName);
            expect(defOpen.iconPath).to.contain(iconNameOpen);
            expect(def.iconPath).to.contain(extensionSettings.customIconFolderName);
            expect(defOpen.iconPath).to.contain(extensionSettings.customIconFolderName);
          } finally {
            fs.unlinkSync(iconNamePath);
            fs.unlinkSync(iconNameOpenPath);
          }
        });

      it('disabled',
        function () {
          const custom: IFolderCollection = {
            default: {
              folder: { icon: '', format: 'svg', disabled: true },
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

    context('default root folder icons can be', function () {

      it('added',
        function () {
          const custom: IFolderCollection = {
            default: {
              root_folder_light: { icon: 'customRootFolderIconLight', format: 'svg' },
            },
            supported: [],
          };
          const iconName =
            `${extensionSettings.defaultExtensionPrefix}${custom.default.root_folder_light.icon}` +
            `${extensionSettings.iconSuffix}.${custom.default.root_folder_light.format}`;
          const iconNameOpen =
            `${extensionSettings.defaultExtensionPrefix}${custom.default.root_folder_light.icon}_opened` +
            `${extensionSettings.iconSuffix}.${custom.default.root_folder_light.format}`;
          const iconNamePath = path.join(extensionSettings.customIconFolderName, iconName);
          const iconNameOpenPath = path.join(extensionSettings.customIconFolderName, iconNameOpen);

          try {
            fs.writeFileSync(iconNamePath, '');
            fs.writeFileSync(iconNameOpenPath, '');

            const json = mergeConfig(null, fileExtensions, custom, folderExtensions, iconGenerator);
            const def = json.iconDefinitions._root_folder_light;
            const defOpen = json.iconDefinitions._root_folder_light_open;
            expect(def).exist;
            expect(defOpen).exist;
            expect(def.iconPath).exist;
            expect(defOpen.iconPath).exist;
            expect(def.iconPath).to.contain(iconName);
            expect(defOpen.iconPath).to.contain(iconNameOpen);
            expect(def.iconPath).to.contain(extensionSettings.customIconFolderName);
            expect(defOpen.iconPath).to.contain(extensionSettings.customIconFolderName);
          } finally {
            fs.unlinkSync(iconNamePath);
            fs.unlinkSync(iconNameOpenPath);
          }
        });

      it('overriden',
        function () {
          const custom: IFolderCollection = {
            default: {
              root_folder: { icon: 'customRootFolderIcon', format: 'svg' },
            },
            supported: [],
          };
          const iconName =
            `${extensionSettings.defaultExtensionPrefix}${custom.default.root_folder.icon}` +
            `${extensionSettings.iconSuffix}.${custom.default.root_folder.format}`;
          const iconNameOpen =
            `${extensionSettings.defaultExtensionPrefix}${custom.default.root_folder.icon}_opened` +
            `${extensionSettings.iconSuffix}.${custom.default.root_folder.format}`;
          const iconNamePath = path.join(extensionSettings.customIconFolderName, iconName);
          const iconNameOpenPath = path.join(extensionSettings.customIconFolderName, iconNameOpen);

          try {
            fs.writeFileSync(iconNamePath, '');
            fs.writeFileSync(iconNameOpenPath, '');

            const json = mergeConfig(null, fileExtensions, custom, folderExtensions, iconGenerator);
            const def = json.iconDefinitions._root_folder;
            const defOpen = json.iconDefinitions._root_folder_open;
            expect(def).exist;
            expect(defOpen).exist;
            expect(def.iconPath).exist;
            expect(defOpen.iconPath).exist;
            expect(def.iconPath).to.contain(iconName);
            expect(defOpen.iconPath).to.contain(iconNameOpen);
            expect(def.iconPath).to.contain(extensionSettings.customIconFolderName);
            expect(defOpen.iconPath).to.contain(extensionSettings.customIconFolderName);
          } finally {
            fs.unlinkSync(iconNamePath);
            fs.unlinkSync(iconNameOpenPath);
          }
        });

      it('disabled',
        function () {
          const custom: IFolderCollection = {
            default: {
              root_folder: { icon: '', format: 'svg', disabled: true },
            },
            supported: [],
          };
          const json = mergeConfig(null, fileExtensions, custom, folderExtensions, iconGenerator);
          const def = json.iconDefinitions._root_folder;
          const defOpen = json.iconDefinitions._root_folder_open;
          expect(def).exist;
          expect(defOpen).exist;
          expect(def.iconPath).to.be.empty;
          expect(defOpen.iconPath).to.be.empty;
        });

    });

  });

});
