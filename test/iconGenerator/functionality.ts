/* tslint:disable only-arrow-functions */
import { expect } from 'chai';
import { schema as defaultSchema, IconGenerator } from '../../src/icon-manifest';
import { IFileCollection, IFolderCollection } from '../../src/models';
import { vscode } from '../../src/utils';
import { extensionSettings as settings } from '../../src/settings';

describe('IconGenerator: functionality test', function () {

  context('ensures', function () {

    let iconGenerator: IconGenerator;
    let emptyFileCollection: IFileCollection;
    let emptyFolderCollection: IFolderCollection;

    beforeEach(() => {
      iconGenerator = new IconGenerator(vscode, defaultSchema);
      emptyFileCollection = { default: { file: { icon: 'file', format: 'svg' } }, supported: [] };
      emptyFolderCollection = { default: { folder: { icon: 'folder', format: 'svg' } }, supported: [] };
    });

    afterEach(() => {
      iconGenerator = null;
    });

    it('disabled file extensions are not included into the manifest', function () {
      const custom = emptyFileCollection;
      custom.supported.push({ icon: 'actionscript', extensions: [], disabled: true, format: 'svg' });
      const json = iconGenerator.generateJson(custom, emptyFolderCollection);
      const extendedPath = json.iconDefinitions['_f_actionscript'];
      expect(extendedPath).not.to.exist;
    });

    it('disabled folder extensions are not included into the manifest', function () {
      const custom = emptyFolderCollection;
      custom.supported.push({ icon: 'aws', extensions: ['aws'], disabled: true, format: 'svg' });
      const json = iconGenerator.generateJson(emptyFileCollection, custom);
      const extendedPath = json.iconDefinitions['_fd_aws'];
      expect(extendedPath).not.to.exist;
    });

    it('default file icon paths are always defined when disabled', function () {
      const custom = emptyFileCollection;
      custom.default.file.disabled = true;
      const json = iconGenerator.generateJson(custom, emptyFolderCollection);
      const ext = json.iconDefinitions._file;
      expect(ext).to.exist;
      expect(ext.iconPath).to.exist;
      expect(ext.iconPath).to.be.empty;
    });

    it('default folder icon paths are always defined when disabled', function () {
      const custom = emptyFolderCollection;
      custom.default.folder.disabled = true;
      const json = iconGenerator.generateJson(emptyFileCollection, custom);
      const ext = json.iconDefinitions._folder;
      expect(ext).to.exist;
      expect(ext.iconPath).to.exist;
      expect(ext.iconPath).to.be.empty;
    });

    it('file extensions are not included into the manifest when no icon is provided', function () {
      const custom = emptyFileCollection;
      custom.supported.push({ icon: '', extensions: ['as'], format: 'svg' });
      const json = iconGenerator.generateJson(custom, emptyFolderCollection);
      const ext = json.iconDefinitions[settings.manifestFilePrefix];
      expect(ext).not.to.exist;
    });

    it('folder extensions are not included into the manifest when no icon is provided', function () {
      const custom = emptyFolderCollection;
      custom.supported.push({ icon: '', extensions: ['aws'], format: 'svg' });
      const json = iconGenerator.generateJson(emptyFileCollection, custom);
      const ext = json.iconDefinitions[settings.manifestFolderPrefix];
      expect(ext).not.to.exist;
    });

    it('new file extensions are included into the manifest', function () {
      const custom = emptyFileCollection;
      custom.supported.push({ icon: 'actionscript', extensions: ['as'], format: 'svg' });
      const json = iconGenerator.generateJson(custom, emptyFolderCollection);
      const def = `${settings.manifestFilePrefix}actionscript`;
      const ext = json.iconDefinitions[def];
      expect(ext).to.exist;
      expect(ext.iconPath).not.to.be.empty;
      expect(json.fileExtensions['as']).to.be.equal(def);
    });

    it('new folder extensions are included into the manifest', function () {
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

    it('filenames extensions are included into the manifest', function () {
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

    it('languageIds extensions are included into the manifest', function () {
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

    it('icon paths are always using Unix style', function () {
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

    it('extensions always use the iconSuffix', function () {
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

    it('default always use the iconSuffix', function () {
      const custom = emptyFileCollection;
      const json = iconGenerator.generateJson(custom, emptyFolderCollection);
      const ext = json.iconDefinitions._file;
      expect(ext).to.exist;
      expect(ext.iconPath).not.to.be.empty;
      expect(ext.iconPath).contains(settings.iconSuffix);
    });

  });

});
