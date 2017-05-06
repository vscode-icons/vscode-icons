// tslint:disable only-arrow-functions
// tslint:disable no-unused-expression
import { expect } from 'chai';
import * as fs from 'fs';
import * as sinon from 'sinon';
import { schema as defaultSchema, IconGenerator } from '../../src/icon-manifest';
import { IFileCollection, IFolderCollection } from '../../src/models';
import * as utils from '../../src/utils';
import { extensionSettings as settings } from '../../src/settings';
import { extensions as folderExtensions } from '../support/supportedFolders';
import * as packageJson from '../../../package.json';

describe('IconGenerator: functionality test', function () {

  context('ensures that', function () {

    let iconGenerator: IconGenerator;
    let emptyFileCollection: IFileCollection;
    let emptyFolderCollection: IFolderCollection;

    beforeEach(() => {
      iconGenerator = new IconGenerator(utils.vscode, defaultSchema);
      emptyFileCollection = { default: { file: { icon: 'file', format: 'svg' } }, supported: [] };
      emptyFolderCollection = { default: { folder: { icon: 'folder', format: 'svg' } }, supported: [] };
    });

    afterEach(() => {
      iconGenerator = null;
    });

    it('disabled file extensions are not included into the manifest',
      function () {
        const custom = emptyFileCollection;
        custom.supported.push({ icon: 'actionscript', extensions: [], disabled: true, format: 'svg' });
        const json = iconGenerator.generateJson(custom, emptyFolderCollection);
        const extendedPath = json.iconDefinitions['_f_actionscript'];
        expect(extendedPath).not.to.exist;
      });

    it('disabled folder extensions are not included into the manifest',
      function () {
        const custom = emptyFolderCollection;
        custom.supported.push({ icon: 'aws', extensions: ['aws'], disabled: true, format: 'svg' });
        const json = iconGenerator.generateJson(emptyFileCollection, custom);
        const extendedPath = json.iconDefinitions['_fd_aws'];
        expect(extendedPath).not.to.exist;
      });

    it('default file icon paths are always defined when disabled',
      function () {
        const custom = emptyFileCollection;
        custom.default.file.disabled = true;
        const json = iconGenerator.generateJson(custom, emptyFolderCollection);
        const ext = json.iconDefinitions._file;
        expect(ext).to.exist;
        expect(ext.iconPath).to.exist;
        expect(ext.iconPath).to.be.empty;
      });

    it('default folder icon paths are always defined when disabled',
      function () {
        const custom = emptyFolderCollection;
        custom.default.folder.disabled = true;
        const json = iconGenerator.generateJson(emptyFileCollection, custom);
        const ext = json.iconDefinitions._folder;
        expect(ext).to.exist;
        expect(ext.iconPath).to.exist;
        expect(ext.iconPath).to.be.empty;
      });

    it('file extensions are not included into the manifest when no icon is provided',
      function () {
        const custom = emptyFileCollection;
        custom.supported.push({ icon: '', extensions: ['as'], format: 'svg' });
        const json = iconGenerator.generateJson(custom, emptyFolderCollection);
        const ext = json.iconDefinitions[settings.manifestFilePrefix];
        expect(ext).not.to.exist;
      });

    it('folder extensions are not included into the manifest when no icon is provided',
      function () {
        const custom = emptyFolderCollection;
        custom.supported.push({ icon: '', extensions: ['aws'], format: 'svg' });
        const json = iconGenerator.generateJson(emptyFileCollection, custom);
        const ext = json.iconDefinitions[settings.manifestFolderPrefix];
        expect(ext).not.to.exist;
      });

    it('new file extensions are included into the manifest',
      function () {
        const custom = emptyFileCollection;
        custom.supported.push({ icon: 'actionscript', extensions: ['as'], format: 'svg' });
        const json = iconGenerator.generateJson(custom, emptyFolderCollection);
        const def = `${settings.manifestFilePrefix}actionscript`;
        const ext = json.iconDefinitions[def];
        expect(ext).to.exist;
        expect(ext.iconPath).not.to.be.empty;
        expect(json.fileExtensions['as']).to.be.equal(def);
      });

    it('new folder extensions are included into the manifest',
      function () {
        const custom = emptyFolderCollection;
        custom.supported.push({ icon: 'aws', extensions: ['aws'], format: 'svg' });
        const json = iconGenerator.generateJson(emptyFileCollection, custom);
        const def = `${settings.manifestFolderPrefix}aws`;
        const ext = json.iconDefinitions[def];
        expect(ext).to.exist;
        expect(ext.iconPath).not.to.be.empty;
        expect(json.folderNames['aws']).to.be.equal(def);
        expect(json.folderNamesExpanded['aws']).to.be.equal(`${def}_open`);
      });

    it('filenames extensions are included into the manifest',
      function () {
        const custom = emptyFileCollection;
        custom.supported.push({
          icon: 'webpack',
          extensions: ['webpack.config.js'],
          filename: true,
          format: 'svg',
        });
        const json = iconGenerator.generateJson(custom, emptyFolderCollection);
        const def = `${settings.manifestFilePrefix}webpack`;
        const ext = json.iconDefinitions[def];
        expect(ext).to.exist;
        expect(ext.iconPath).not.to.be.empty;
        expect(json.fileNames['webpack.config.js']).to.be.equal(def);
      });

    it('languageIds extensions are included into the manifest',
      function () {
        const custom = emptyFileCollection;
        custom.supported.push({
          icon: 'c',
          extensions: [],
          languages: [{ ids: 'c', defaultExtension: 'c' }],
          format: 'svg',
        });
        const json = iconGenerator.generateJson(custom, emptyFolderCollection);
        const def = `${settings.manifestFilePrefix}c`;
        const ext = json.iconDefinitions[def];
        expect(ext).to.exist;
        expect(ext.iconPath).not.to.be.empty;
        expect(json.languageIds['c']).to.be.equal(def);
      });

    it('icon paths are always using Unix style',
      function () {
        const custom = emptyFileCollection;
        custom.supported.push({
          icon: 'c',
          extensions: ['c'],
          format: 'svg',
        });
        const json = iconGenerator.generateJson(custom, emptyFolderCollection);
        const def = `${settings.manifestFilePrefix}c`;
        const ext = json.iconDefinitions[def];
        expect(ext).to.exist;
        expect(ext.iconPath).not.to.be.empty;
        expect(ext.iconPath).not.contain('\\');
      });

    it('extensions always use the iconSuffix',
      function () {
        const custom = emptyFileCollection;
        custom.supported.push({
          icon: 'c',
          extensions: ['c'],
          format: 'svg',
        });
        const json = iconGenerator.generateJson(custom, emptyFolderCollection);
        const def = `${settings.manifestFilePrefix}c`;
        const ext = json.iconDefinitions[def];
        expect(ext).to.exist;
        expect(ext.iconPath).not.to.be.empty;
        expect(ext.iconPath).contains(settings.iconSuffix);
      });

    it('default always use the iconSuffix',
      function () {
        const custom = emptyFileCollection;
        const json = iconGenerator.generateJson(custom, emptyFolderCollection);
        const ext = json.iconDefinitions._file;
        expect(ext).to.exist;
        expect(ext.iconPath).not.to.be.empty;
        expect(ext.iconPath).contains(settings.iconSuffix);
      });

    context('persisting the icon-manifest', function () {

      let sandbox: sinon.SinonSandbox;

      beforeEach(() => {
        sandbox = sinon.sandbox.create();
      });

      afterEach(() => {
        sandbox.restore();
      });

      it('throws an Error if the icons filename is not provided',
        function () {
          expect(iconGenerator.persist.bind(iconGenerator, null, defaultSchema))
            .to.throw(Error, /iconsFilename not defined./);
        });

      it('calls the \'updatePackageJson\' function when said to',
        function () {
          const writeJsonToFile = sandbox.stub(iconGenerator, 'writeJsonToFile');
          const updatePackageJson = sandbox.stub(iconGenerator, 'updatePackageJson');
          iconGenerator.persist('path/to/file', defaultSchema, true);
          expect(writeJsonToFile.called).to.be.true;
          expect(updatePackageJson.called).to.be.true;
        });

      it('doesn\'t call the \'updatePackageJson\' function when said not to',
        function () {
          const writeJsonToFile = sandbox.stub(iconGenerator, 'writeJsonToFile');
          const updatePackageJson = sandbox.stub(iconGenerator, 'updatePackageJson');
          iconGenerator.persist('path/to/file', defaultSchema);
          expect(writeJsonToFile.called).to.be.true;
          expect(updatePackageJson.called).to.be.false;
        });

      context('the \'updatePackageJson\' function', function () {

        it('logs an error if something goes wrong',
          function () {
            sandbox.stub(iconGenerator, 'writeJsonToFile');
            sandbox.stub(fs, 'writeFileSync').throws(new Error());
            const errorLog = sandbox.stub(console, 'error');
            packageJson.contributes.iconThemes[0].path = 'path/to/icons.json';
            iconGenerator.persist('path/to/file', defaultSchema, true);
            expect(errorLog.called).to.be.true;
          });

        context('updates the icon theme path in the \'package.json\' file', function () {

          it('if the icons folder path has changed',
            function () {
              const writeJsonToFile = sandbox.stub(iconGenerator, 'writeJsonToFile');
              const writeFileSync = sandbox.stub(fs, 'writeFileSync');
              sandbox.stub(console, 'info');
              packageJson.contributes.iconThemes[0].path = 'path/to/icons.json';
              iconGenerator.persist('path/to/file', defaultSchema, true);
              expect(writeJsonToFile.called).to.be.true;
              expect(writeFileSync.called).to.be.true;
            });

        });

        context('does not update the icon theme path in the \'package.json\' file', function () {

          it('if the icons folder path has not changed',
            function () {
              const writeJsonToFile = sandbox.stub(iconGenerator, 'writeJsonToFile');
              const writeFileSync = sandbox.stub(fs, 'writeFileSync');
              sandbox.stub(console, 'info');
              iconGenerator.persist('path/to/file', defaultSchema, true);
              expect(writeJsonToFile.called).to.be.true;
              expect(writeFileSync.called).to.be.false;
            });

          it('if the icons theme path does not exists',
            function () {
              const writeJsonToFile = sandbox.stub(iconGenerator, 'writeJsonToFile');
              const writeFileSync = sandbox.stub(fs, 'writeFileSync');
              sandbox.stub(console, 'info');
              packageJson.contributes.iconThemes[0].path = '';
              iconGenerator.persist('path/to/file', defaultSchema, true);
              expect(writeJsonToFile.called).to.be.true;
              expect(writeFileSync.called).to.be.false;
            });

        });

      });

      context('writes the icon-manifest to a file by', function () {

        it('creating the directory if it does not exist',
          function () {
            const existsSync = sandbox.stub(fs, 'existsSync').returns(false);
            const mkdirSync = sandbox.stub(fs, 'mkdirSync');
            const writeFileSync = sandbox.stub(fs, 'writeFileSync');
            sandbox.stub(console, 'info');
            iconGenerator.persist('path/to/file', defaultSchema);
            expect(existsSync.called).to.be.true;
            expect(mkdirSync.called).to.be.true;
            expect(writeFileSync.called).to.be.true;
          });

        it('not creating the directory if it exists',
          function () {
            const existsSync = sandbox.stub(fs, 'existsSync').returns(true);
            const mkdirSync = sandbox.stub(fs, 'mkdirSync');
            const writeFileSync = sandbox.stub(fs, 'writeFileSync');
            sandbox.stub(console, 'info');
            iconGenerator.persist('path/to/file', defaultSchema);
            expect(existsSync.called).to.be.true;
            expect(mkdirSync.called).to.be.false;
            expect(writeFileSync.called).to.be.true;
          });

        it('logs an error if something goes wrong',
          function () {
            sandbox.stub(fs, 'writeFileSync').throws(new Error());
            const errorLog = sandbox.stub(console, 'error');
            iconGenerator.persist('path/to/file', defaultSchema);
            expect(errorLog.called).to.be.true;
          });

      });

    });

    context('generating the icon-manifest object', function () {

      it('throws an Error if the paths for the folder and open folder icons do not match',
        function () {
          sinon.stub(iconGenerator, 'getIconPath')
            .callsFake((defaultPath: string, filename: string): string => /opened/g.test(filename) ? '' : defaultPath);
          expect(iconGenerator.generateJson
            .bind(iconGenerator, emptyFileCollection, folderExtensions))
            .to.throw(Error, /Folder icons for '.*' must be placed in the same directory/);
        });

      const testCase = (belongToSameDrive: boolean) => {
        const sandbox = sinon.sandbox.create();
        sinon.stub(iconGenerator, 'hasCustomIcon').returns(true);
        sandbox.stub(utils, 'belongToSameDrive').returns(belongToSameDrive);
        const json = iconGenerator.generateJson(emptyFileCollection, emptyFolderCollection);
        expect(json.iconDefinitions._file.iconPath)
          .to.include(iconGenerator.settings.extensionSettings.customIconFolderName);
        expect(json.iconDefinitions._folder.iconPath)
          .to.include(iconGenerator.settings.extensionSettings.customIconFolderName);
        expect(json.iconDefinitions._folder_open.iconPath)
          .to.include(iconGenerator.settings.extensionSettings.customIconFolderName);
        sandbox.restore();
      };

      it('uses the manifestFolderPath when custom icons folder is on the same drive',
        function () {
          testCase(true);
        });

      it('calls the overwriteDrive when custom icons folder is not on the same drive',
        function () {
          testCase(false);
        });

    });

  });

});
