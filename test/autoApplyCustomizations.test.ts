// tslint:disable only-arrow-functions
import { expect } from 'chai';
import * as sinon from 'sinon';
import { manageAutoApplyCustomizations } from '../src/init/autoApplyCustomizations';
import { IVSIcons } from '../src/models';

function getUserConfig() {
  const userConfig: IVSIcons = {
    dontShowNewVersionMessage: false,
    presets: {
      angular: true,
      jsOfficial: false,
      tsOfficial: false,
      jsonOfficial: false,
      hideFolders: false,
    },
    associations: {
      files: [],
      folders: [],
      fileDefault: { file: undefined, file_light: undefined },
      folderDefault: { folder: undefined, folder_light: undefined },
    },
  };
  return userConfig;
}

describe('autoApplyCustomizations: tests', function () {

  it('ensures that if the extension has not been updated the callback will not be called', function () {
    const spy = sinon.spy();
    manageAutoApplyCustomizations(false, getUserConfig(), spy);
    expect(spy.called).to.not.be.true;
  });

  it('ensures that if the extension has been updated but there are no changes '
    + 'in package.json the callback will not be called', function () {
      const spy = sinon.spy();
      manageAutoApplyCustomizations(true, getUserConfig(), spy);
      expect(spy.called).to.not.be.true;
    });

  it('ensures that if the extension has been updated and there are changes '
    + 'in package.json the callback will be called', function () {
      const spy = sinon.spy();
      const config = getUserConfig();
      config.presets.angular = false;
      manageAutoApplyCustomizations(true, config, spy);
      expect(spy.called).to.be.true;
    });

  it('ensures that changes in array are detected', function () {
    const spy = sinon.spy();
    const config = getUserConfig();
    config.associations.files = [{ icon: 'dummy', format: 'svg', extensions: ['dummy'] }];
    manageAutoApplyCustomizations(true, config, spy);
    expect(spy.called).to.be.true;
  });

});
