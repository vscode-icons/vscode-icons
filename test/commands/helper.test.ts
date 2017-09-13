// tslint:disable only-arrow-functions
// tslint:disable no-unused-expression
import { expect } from 'chai';
import * as helper from '../../src/commands/helper';
import { IIconSchema } from '../../src/models/index';

describe('Helper: tests', function () {

  context('ensures that', function () {

    it('function \'isFolders\' returns proper state',
      function () {
        expect(helper.isFolders('hideFolders')).to.be.true;
        expect(helper.isFolders('default')).to.be.false;
      });

    context('function \'getIconName\'', function () {

      it('throws an Error if a preset is not covered',
        function () {
          expect(helper.getIconName.bind(helper)).to.throw(Error, /Not Implemented/);
        });

      it('returns expected responses',
        function () {
          expect(helper.getIconName('angular')).to.be.equal('ng');
          expect(helper.getIconName('jsOfficial')).to.be.equal('js_official');
          expect(helper.getIconName('tsOfficial')).to.be.equal('typescript_official');
          expect(helper.getIconName('jsonOfficial')).to.be.equal('json_official');
        });

    });

    context('function \'getFunc\'', function () {

      let iconsJson: IIconSchema;

      beforeEach(() => {
        iconsJson = {
          iconDefinitions: {
            _file: { iconPath: '' },
            _folder: { iconPath: '' },
            _folder_open: { iconPath: '' },
            _file_light: { iconPath: '' },
            _folder_light: { iconPath: '' },
            _folder_light_open: { iconPath: '' },
            iconDefinition: { iconPath: '' },
          },
          file: '',
          folder: '',
          folderExpanded: '',
          folderNames: {},
          folderNamesExpanded: {},
          fileExtensions: {},
          fileNames: {},
          languageIds: {},
          light: {
            file: '',
            folder: '',
            folderExpanded: '',
            folderNames: {},
            folderNamesExpanded: {},
            fileExtensions: {},
            fileNames: {},
            languageIds: {},
          },
        };
      });

      it('throws an Error if a preset is not covered',
        function () {
          expect(helper.getFunc.bind(helper, 'default')).to.throw(Error, /Not Implemented/);
        });

      it('return \'true\' when folder icons are hidden',
        function () {
          const func = helper.getFunc('hideFolders');
          expect(func).to.be.instanceof(Function);
          expect(func(iconsJson)).to.be.true;
        });

      it('return \'false\' when folder icons are visible',
        function () {
          iconsJson.folderNames = { _fd_folderName: '' };
          const func = helper.getFunc('hideFolders');
          expect(func).to.be.instanceof(Function);
          expect(func(iconsJson)).to.be.false;
        });

      it('return \'true\' when specific folder icons are disabled',
        function () {
          iconsJson.iconDefinitions._folder.iconPath = 'pathToDefaultFolderIcon';
          const func = helper.getFunc('foldersAllDefaultIcon');
          expect(func).to.be.instanceof(Function);
          expect(func(iconsJson)).to.be.true;
        });

      it('return \'false\' when specific folder icons are enabled',
        function () {
          iconsJson.folderNames = { _fd_folderName: '' };
          iconsJson.iconDefinitions._folder.iconPath = 'pathToDefaultFolderIcon';
          const func = helper.getFunc('foldersAllDefaultIcon');
          expect(func).to.be.instanceof(Function);
          expect(func(iconsJson)).to.be.false;
        });
    });

  });

});
