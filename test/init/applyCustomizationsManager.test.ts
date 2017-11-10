// tslint:disable only-arrow-functions
// tslint:disable no-unused-expression
import { expect } from 'chai';
import * as sinon from 'sinon';
import { manageAutoApplyCustomizations, manageApplyCustomizations } from '../../src/init/applyCustomizationsManager';
import { IVSIcons } from '../../src/models';

describe('AutoApplyCustomizations: tests', function () {

  context('ensures that', function () {

    let userConfig: IVSIcons;

    beforeEach(() => {
      userConfig = {
        dontShowNewVersionMessage: false,
        dontShowConfigManuallyChangedMessage: false,
        projectDetection: {
          autoReload: false,
          disableDetect: false,
        },
        presets: {
          angular: false,
          jsOfficial: false,
          tsOfficial: false,
          jsonOfficial: false,
          hideFolders: false,
          foldersAllDefaultIcon: false,
          hideExplorerArrows: false,
        },
        associations: {
          files: [],
          folders: [],
          fileDefault: { file: null, file_light: null },
          folderDefault: { folder: null, folder_light: null },
        },
        customIconFolderPath: '',
      };
    });

    context('if the extension has been updated', function () {

      it('but there are no changes in package.json the callback will not be called', function () {
        const spy = sinon.spy();
        manageAutoApplyCustomizations(true, userConfig, spy);
        expect(spy.called).to.not.be.true;
      });

      it('and there are changes in package.json the callback will be called', function () {
        const spy = sinon.spy();
        userConfig.presets.angular = true;
        manageAutoApplyCustomizations(true, userConfig, spy);
        expect(spy.called).to.be.true;
      });

    });

    it('if the extension has not been updated the callback will not be called',
      function () {
        const spy = sinon.spy();
        manageAutoApplyCustomizations(false, userConfig, spy);
        expect(spy.called).to.not.be.true;
      });

    it('changes in array are detected', function () {
      const spy = sinon.spy();
      userConfig.associations.files = [{ icon: 'dummy', format: 'svg', extensions: ['dummy'] }];
      manageAutoApplyCustomizations(true, userConfig, spy);
      expect(spy.called).to.be.true;
    });

  });

});

describe('ApplyCustomizations: tests', function () {

  context('ensures that', function () {

    let userConfig: IVSIcons;

    beforeEach(() => {
      userConfig = {
        dontShowNewVersionMessage: false,
        dontShowConfigManuallyChangedMessage: false,
        projectDetection: {
          autoReload: false,
          disableDetect: false,
        },
        presets: {
          angular: false,
          jsOfficial: false,
          tsOfficial: false,
          jsonOfficial: false,
          hideFolders: false,
          foldersAllDefaultIcon: false,
          hideExplorerArrows: false,
        },
        associations: {
          files: [],
          folders: [],
          fileDefault: { file: null, file_light: null },
          folderDefault: { folder: null, folder_light: null },
        },
        customIconFolderPath: '',
      };
    });

    it('if the configuration has been manually changed, the callback will be called',
      function () {
        const spy = sinon.spy();
        const initConfig = JSON.parse(JSON.stringify(userConfig));
        userConfig.presets.tsOfficial = true;
        manageApplyCustomizations(initConfig, userConfig, spy);
        expect(spy.called).to.be.true;
      });

    it('if the configuration has not been manually changed, the callback will not be called',
      function () {
        const spy = sinon.spy();
        const initConfig = JSON.parse(JSON.stringify(userConfig));
        userConfig.presets.tsOfficial = false;
        manageApplyCustomizations(initConfig, userConfig, spy);
        expect(spy.called).to.not.be.true;
      });

    it('if the configuration has only moved its elements, the callback will not be called',
      function () {
        const spy = sinon.spy();
        userConfig.associations.files = [
          { icon: 'js', extensions: ['myExt1', 'myExt2.custom.js'], format: 'svg' },
          { icon: 'js2', extensions: ['myExt1', 'myExt2.custom.js'], format: 'svg' },
        ];
        const initConfig = JSON.parse(JSON.stringify(userConfig));
        userConfig.associations.files.reverse();
        manageApplyCustomizations(initConfig, userConfig, spy);
        expect(spy.called).to.not.be.true;
      });

    it('if the user disables the showing of the manually changed configuration message, ' +
      'the callback will not be called',
      function () {
        const spy = sinon.spy();
        const initConfig = JSON.parse(JSON.stringify(userConfig));
        userConfig.dontShowConfigManuallyChangedMessage = true;
        manageApplyCustomizations(initConfig, userConfig, spy);
        expect(spy.called).to.not.be.true;
      });

  });

});
