// tslint:disable only-arrow-functions
// tslint:disable no-unused-expression
import { expect } from 'chai';
import * as sinon from 'sinon';
import { manageAutoApplyCustomizations } from '../src/init/autoApplyCustomizations';
import { IVSIcons } from '../src/models';

describe('AutoApplyCustomizations: tests', function () {

  context('ensures that', function () {

    let userConfig: IVSIcons;

    beforeEach(() => {
      userConfig = {
        dontShowNewVersionMessage: false,
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
        },
        associations: {
          files: [],
          folders: [],
          fileDefault: { file: undefined, file_light: undefined },
          folderDefault: { folder: undefined, folder_light: undefined },
        },
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
