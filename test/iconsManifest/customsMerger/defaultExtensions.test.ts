/* eslint-disable prefer-arrow-callback */
/* eslint-disable no-unused-expressions */
import { expect } from 'chai';
import * as sinon from 'sinon';
import { CustomsMerger } from '../../../src/iconsManifest/customsMerger';
import { IFileCollection, IFolderCollection } from '../../../src/models';
import { extensions as extFiles } from '../../fixtures/supportedExtensions';
import { extensions as extFolders } from '../../fixtures/supportedFolders';
import { vsicons } from '../../fixtures/vsicons';

describe('CustomsMerger: default extensions tests', function () {
  context('ensures that', function () {
    let sandbox: sinon.SinonSandbox;

    beforeEach(function () {
      sandbox = sinon.createSandbox();
    });

    afterEach(function () {
      sandbox.restore();
    });

    context('default file icons can be', function () {
      it('added', async function () {
        const customFiles: IFileCollection = {
          default: {
            file_light: { icon: 'customFileIconLight', format: 'svg' },
          },
          supported: [],
        };

        const def = (
          await CustomsMerger.merge(
            customFiles,
            extFiles,
            null,
            extFolders,
            vsicons.presets,
          )
        ).files.default.file_light;

        expect(def).to.be.an('object').with.keys('icon', 'format');
        expect(def.icon).to.equal(customFiles.default.file_light.icon);
        expect(def.format).to.equal(customFiles.default.file_light.format);
      });

      it('overriden', async function () {
        const customFiles: IFileCollection = {
          default: {
            file: { icon: 'customFileIcon', format: 'svg' },
          },
          supported: [],
        };

        const def = (
          await CustomsMerger.merge(
            customFiles,
            extFiles,
            null,
            extFolders,
            vsicons.presets,
          )
        ).files.default.file;

        expect(def).to.be.an('object').with.keys('icon', 'format');
        expect(def.icon).to.equal(customFiles.default.file.icon);
        expect(def.format).to.equal(customFiles.default.file.format);
      });

      it('disabled', async function () {
        const customFiles: IFileCollection = {
          default: {
            file: { icon: '', format: 'svg', disabled: true },
          },
          supported: [],
        };
        const def = (
          await CustomsMerger.merge(
            customFiles,
            extFiles,
            null,
            extFolders,
            vsicons.presets,
          )
        ).files.default.file;

        expect(def).to.be.an('object').with.keys('icon', 'format', 'disabled');
        expect(def.icon).to.equal(customFiles.default.file.icon);
        expect(def.format).to.equal(customFiles.default.file.format);
        expect(def.disabled).to.equal(customFiles.default.file.disabled);
      });
    });

    context('default folder icons can be', function () {
      it('added', async function () {
        const customFolders: IFolderCollection = {
          default: {
            folder_light: { icon: 'customFolderIconLight', format: 'svg' },
          },
          supported: [],
        };

        const def = (
          await CustomsMerger.merge(
            null,
            extFiles,
            customFolders,
            extFolders,
            vsicons.presets,
          )
        ).folders.default.folder_light;

        expect(def).to.be.an('object').with.keys('icon', 'format', 'disabled');
        expect(def.icon).to.equal(customFolders.default.folder_light.icon);
        expect(def.format).to.equal(customFolders.default.folder_light.format);
        expect(def.disabled).to.be.false;
      });

      it('overriden', async function () {
        const customFolders: IFolderCollection = {
          default: {
            folder: { icon: 'customFolderIcon', format: 'svg' },
          },
          supported: [],
        };

        const def = (
          await CustomsMerger.merge(
            null,
            extFiles,
            customFolders,
            extFolders,
            vsicons.presets,
          )
        ).folders.default.folder;

        expect(def).to.be.an('object').with.keys('icon', 'format', 'disabled');
        expect(def.icon).to.equal(customFolders.default.folder.icon);
        expect(def.format).to.equal(customFolders.default.folder.format);
        expect(def.disabled).to.be.false;
      });

      it('disabled', async function () {
        const customFolders: IFolderCollection = {
          default: {
            folder: { icon: '', format: 'svg', disabled: true },
          },
          supported: [],
        };
        const def = (
          await CustomsMerger.merge(
            null,
            extFiles,
            customFolders,
            extFolders,
            vsicons.presets,
          )
        ).folders.default.folder;

        expect(def).to.be.an('object').with.keys('icon', 'format', 'disabled');
        expect(def.icon).to.equal(customFolders.default.folder.icon);
        expect(def.format).to.equal(customFolders.default.folder.format);
        expect(def.disabled).to.equal(customFolders.default.folder.disabled);
      });
    });

    context('default root folder icons can be', function () {
      it('added', async function () {
        const customFolders: IFolderCollection = {
          default: {
            root_folder_light: {
              icon: 'customRootFolderIconLight',
              format: 'svg',
            },
          },
          supported: [],
        };

        const def = (
          await CustomsMerger.merge(
            null,
            extFiles,
            customFolders,
            extFolders,
            vsicons.presets,
          )
        ).folders.default.root_folder_light;

        expect(def).to.be.an('object').with.keys('icon', 'format', 'disabled');
        expect(def.icon).to.equal(customFolders.default.root_folder_light.icon);
        expect(def.format).to.equal(
          customFolders.default.root_folder_light.format,
        );
        expect(def.disabled).to.be.false;
      });

      it('overriden', async function () {
        const customFolders: IFolderCollection = {
          default: {
            root_folder: { icon: 'customRootFolderIcon', format: 'svg' },
          },
          supported: [],
        };

        const def = (
          await CustomsMerger.merge(
            null,
            extFiles,
            customFolders,
            extFolders,
            vsicons.presets,
          )
        ).folders.default.root_folder;

        expect(def).to.be.an('object').with.keys('icon', 'format', 'disabled');
        expect(def.icon).to.equal(customFolders.default.root_folder.icon);
        expect(def.format).to.equal(customFolders.default.root_folder.format);
        expect(def.disabled).to.be.false;
      });

      it('disabled', async function () {
        const customFolders: IFolderCollection = {
          default: {
            root_folder: { icon: '', format: 'svg', disabled: true },
          },
          supported: [],
        };
        const def = (
          await CustomsMerger.merge(
            null,
            extFiles,
            customFolders,
            extFolders,
            vsicons.presets,
          )
        ).folders.default.root_folder;

        expect(def).to.be.an('object').with.keys('icon', 'format', 'disabled');
        expect(def.icon).to.equal(customFolders.default.root_folder.icon);
        expect(def.format).to.equal(customFolders.default.root_folder.format);
        expect(def.disabled).to.equal(
          customFolders.default.root_folder.disabled,
        );
      });
    });
  });
});
