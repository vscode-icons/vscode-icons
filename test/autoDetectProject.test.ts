// tslint:disable only-arrow-functions
import { expect, use } from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import * as sinon from 'sinon';
import { IVSIcons, IVSCodeUri } from '../src/models';
import {
  detectProject,
  checkForAngularProject,
  isProject,
  applyDetection,
} from '../src/init/autoDetectProject';
import { LanguageResourceManager } from './../src/i18n';

use(chaiAsPromised);

const packageJson = {
  name: "test",
  version: "",
  dependencies: {
    '@angular/core': "",
  },
};

function getUserConfig(): IVSIcons {
  return {
    dontShowNewVersionMessage: false,
    projectDetection: {
      autoReload: false,
      disableDetect: false,
    },
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
}

describe('AutoDetectProject: tests', function () {

  it('ensures that the extension does not detect a project when detection is disabled',
    function () {
      const config = getUserConfig();
      config.projectDetection.disableDetect = true;
      return expect(detectProject(null, config)).to.eventually.be.an('array');
    });

  it('ensures that the extension can detect a project when detection is enabled, ' +
    'but it has not detected a \'package.json\' file',
    function () {
      const findFiles = sinon.stub().returns(Promise.resolve([]));
      const config = getUserConfig();
      config.projectDetection.disableDetect = false;
      return expect(detectProject(findFiles, config)).to.eventually.be.an('array').with.lengthOf(0);
    });

  it('ensures that the extension can detect a project when detection is enabled ' +
    'and has detected a \'package.json\' file',
    function () {
      const path = 'package.json';
      const findFiles = sinon.stub().returns(Promise.resolve([{ fsPath: path }] as IVSCodeUri[]));
      const config = getUserConfig();
      config.projectDetection.disableDetect = false;
      return detectProject(findFiles, config)
        .then((res) => {
          expect(res).to.be.an('array').with.length.greaterThan(0);
          expect(res[0]).to.have.property('fsPath').that.equals(path);
        });
    });

  it('ensures that the extension can detect a sub project when detection is enabled ' +
    'and has detected a \'package.json\' file in a sub folder',
    function () {
      const path1 = 'package.json';
      const path2 = 'f1/f2/f3/package.json';
      const findFiles = sinon.stub().returns(Promise.resolve([{ fsPath: path1 }, { fsPath: path2 }] as IVSCodeUri[]));
      const config = getUserConfig();
      config.projectDetection.disableDetect = false;
      return detectProject(findFiles, config)
        .then((res) => {
          expect(res).to.be.an('array').with.length.greaterThan(0);
          expect(res[0]).to.have.property('fsPath').that.equals(path1);
          expect(res[1]).to.have.property('fsPath').that.equals(path2);
        });
    });

  it('ensures that the extension can detect an Angular project',
    function () {
      expect(isProject(packageJson, 'ng')).to.be.true;
    });

  it('ensures that the extension enables the Angular icons when the workspace is ' +
    'an Angular project and Angular preset is false or Angular icons are disabled',
    function () {
      const isNgProject = true;
      const angularPreset = false;
      const ngIconsDisabled = true;
      const i18nManager = new LanguageResourceManager();
      const res = checkForAngularProject(angularPreset, ngIconsDisabled, isNgProject, undefined, i18nManager);
      expect(res).to.have.property('apply').that.is.true;
      expect(res).to.have.property('value').that.is.true;
    });

  it('ensures that the extension enables the Angular icons when the workspace is ' +
    'an Angular project and Angular preset is true or Angular icons are disabled',
    function () {
      const isNgProject = true;
      const angularPreset = true;
      const ngIconsDisabled = true;
      const i18nManager = new LanguageResourceManager();
      const res = checkForAngularProject(angularPreset, ngIconsDisabled, isNgProject, undefined, i18nManager);
      expect(res).to.have.property('apply').that.is.true;
      expect(res).to.have.property('value').that.is.true;
    });

  it('ensures that the extension disables the Angular icons when the workspace is ' +
    'not an Angular project and Angular preset is true or Angular icons are enabled',
    function () {
      const isNgProject = false;
      const angularPreset = true;
      const ngIconsDisabled = false;
      const i18nManager = new LanguageResourceManager();
      const res = checkForAngularProject(angularPreset, ngIconsDisabled, isNgProject, undefined, i18nManager);
      expect(res).to.have.property('apply').that.is.true;
      expect(res).to.have.property('value').that.is.false;
    });

  it('ensures that the extension disables the Angular icons when the workspace is ' +
    'not an Angular project and Angular preset is false or Angular icons are enabled',
    function () {
      const isNgProject = false;
      const angularPreset = false;
      const ngIconsDisabled = false;
      const i18nManager = new LanguageResourceManager();
      const res = checkForAngularProject(angularPreset, ngIconsDisabled, isNgProject, undefined, i18nManager);
      expect(res).to.have.property('apply').that.is.true;
      expect(res).to.have.property('value').that.is.false;
    });

  it('ensures that the extension does not toggle the Angular icons when the workspace is ' +
    'an Angular project and the Angular preset is true or Angular icons are enabled',
    function () {
      const isNgProject = true;
      const angularPreset = true;
      const ngIconsDisabled = false;
      const i18nManager = new LanguageResourceManager();
      expect(checkForAngularProject(angularPreset, ngIconsDisabled, isNgProject, undefined, i18nManager))
        .to.have.property('apply').that.is.false;
    });

  it('ensures that the extension does not toggle the Angular icons when the workspace is ' +
    'not an Angular project and the Angular preset is false or Angular icons are disabled',
    function () {
      const isNgProject = false;
      const angularPreset = false;
      const ngIconsDisabled = true;
      const i18nManager = new LanguageResourceManager();
      expect(checkForAngularProject(angularPreset, ngIconsDisabled, isNgProject, undefined, i18nManager))
        .to.have.property('apply').that.is.false;
    });

  it('ensures that the extension when user has selected to auto restart ' +
    'applies the changes and restarts',
    function () {
      const clock = sinon.useFakeTimers();

      const autoReload = true;
      const updatePreset = sinon.stub().returns(Promise.resolve());
      const applyCustomization = sinon.spy();
      const reload = sinon.spy();
      const cancel = sinon.stub();
      const showCustomizationMessage = sinon.spy();
      const i18nManager = new LanguageResourceManager();

      return applyDetection(undefined, undefined, undefined, undefined, undefined, autoReload,
        updatePreset, applyCustomization, reload, cancel, showCustomizationMessage, undefined, i18nManager)
        .then(() => {
          // No functions should have been called before 1s
          clock.tick(999);
          expect(applyCustomization.called).to.be.false;
          expect(reload.called).to.be.false;
          expect(showCustomizationMessage.called).to.be.false;

          // Only 'applyCustomization' and 'reload' functions should have been called on 1s
          clock.tick(1);
          expect(applyCustomization.called).to.be.true;
          expect(reload.called).to.be.true;
          expect(showCustomizationMessage.called).to.be.false;

          clock.restore();
        });
    });

  it('ensures that the extension when user has selected not to auto restart ' +
    'shows the customization message',
    function () {
      const autoReload = false;
      const updatePreset = sinon.stub().returns(Promise.resolve());
      const applyCustomization = sinon.spy();
      const reload = sinon.spy();
      const cancel = sinon.spy();
      const showCustomizationMessage = sinon.spy();
      const i18nManager = new LanguageResourceManager();

      return applyDetection(undefined, undefined, undefined, undefined, undefined, autoReload,
        updatePreset, applyCustomization, reload, cancel, showCustomizationMessage, undefined, i18nManager)
        .then(() => {
          expect(showCustomizationMessage.called).to.be.true;
        });
    });

});
