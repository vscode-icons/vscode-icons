// tslint:disable only-arrow-functions
// tslint:disable no-unused-expression
import { expect } from 'chai';
import * as helper from '../../src/commands/helper';
import { IIconSchema, IconNames, PresetNames } from '../../src/models';

describe('Helper: tests', function () {

  context('ensures that', function () {

    it('function \'isFolders\' returns proper state',
      function () {
        expect(helper.isFolders(PresetNames[PresetNames.hideFolders])).to.be.true;
        expect(helper.isFolders(PresetNames[PresetNames.jsOfficial])).to.be.false;
      });

    context('function \'getIconName\'', function () {

      it('throws an Error if a preset is not covered',
        function () {
          expect(helper.getIconName.bind(helper)).to.throw(Error, /Not Implemented/);
        });

      it('returns expected values',
        function () {
          expect(helper.getIconName(PresetNames[PresetNames.angular])).to.be.equal(IconNames.angular);
          expect(helper.getIconName(PresetNames[PresetNames.jsOfficial])).to.be.equal(IconNames.jsOfficial);
          expect(helper.getIconName(PresetNames[PresetNames.tsOfficial])).to.be.equal(IconNames.tsOfficial);
          expect(helper.getIconName(PresetNames[PresetNames.jsonOfficial])).to.be.equal(IconNames.jsonOfficial);
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
          expect(helper.getFunc.bind(helper, PresetNames[PresetNames.jsOfficial])).to.throw(Error, /Not Implemented/);
        });

      it('return \'true\' when folder icons are hidden',
        function () {
          const func = helper.getFunc(PresetNames[PresetNames.hideFolders]);
          expect(func).to.be.instanceof(Function);
          expect(func(iconsJson)).to.be.true;
        });

      it('return \'false\' when folder icons are visible',
        function () {
          iconsJson.folderNames = { _fd_folderName: '' };
          const func = helper.getFunc(PresetNames[PresetNames.hideFolders]);
          expect(func).to.be.instanceof(Function);
          expect(func(iconsJson)).to.be.false;
        });

      it('return \'true\' when specific folder icons are disabled',
        function () {
          iconsJson.iconDefinitions._folder.iconPath = 'pathToDefaultFolderIcon';
          const func = helper.getFunc(PresetNames[PresetNames.foldersAllDefaultIcon]);
          expect(func).to.be.instanceof(Function);
          expect(func(iconsJson)).to.be.true;
        });

      it('return \'false\' when specific folder icons are enabled',
        function () {
          iconsJson.folderNames = { _fd_folderName: '' };
          iconsJson.iconDefinitions._folder.iconPath = 'pathToDefaultFolderIcon';
          const func = helper.getFunc(PresetNames[PresetNames.foldersAllDefaultIcon]);
          expect(func).to.be.instanceof(Function);
          expect(func(iconsJson)).to.be.false;
        });
    });

  });

});
