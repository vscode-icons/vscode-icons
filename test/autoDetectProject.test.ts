// tslint:disable only-arrow-functions
// tslint:disable no-unused-expression
import { expect, use } from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import * as fs from 'fs';
import * as sinon from 'sinon';
import { IVSIcons, IVSCodeUri } from '../src/models';
import * as adp from '../src/init/autoDetectProject';
import { LanguageResourceManager } from '../src/i18n';

use(chaiAsPromised);

describe('AutoDetectProject: tests', function () {

  context('ensures that', function () {

    context('the extension', function () {

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

      it('returns a rejection when searching for a \'package.json\' fails',
        function () {
          const reason = 'failure';
          const findFiles = sinon.stub().returns(Promise.reject(reason));
          return adp.detectProject(findFiles, userConfig)
            .then(rej => expect(rej).to.be.an('array').with.members([reason]));
        });

      it('detects a sub project when detection is enabled and has detected a \'package.json\' file in a sub folder',
        function () {
          const path1 = 'package.json';
          const path2 = 'f1/f2/f3/package.json';
          const findFiles = sinon.stub()
            .returns(Promise.resolve([{ fsPath: path1 }, { fsPath: path2 }] as IVSCodeUri[]));
          return adp.detectProject(findFiles, userConfig)
            .then(res => {
              expect(res).to.be.an('array').with.length.greaterThan(0);
              expect(res[0]).to.have.property('fsPath').that.equals(path1);
              expect(res[1]).to.have.property('fsPath').that.equals(path2);
            });
        });

      it('does not detect a project when detection is disabled',
        function () {
          userConfig.projectDetection.disableDetect = true;
          return expect(adp.detectProject(null, userConfig)).to.eventually.be.an('array');
        });

      it('detects an Angular project from dependencies',
        function () {
          const packageJson = {
            dependencies: {
              '@angular/core': "",
            },
          };
          expect(adp.isProject(packageJson, 'ng')).to.be.true;
        });

      it('detects an Angular project from devDependencies',
        function () {
          const packageJson = {
            devDependencies: {
              '@angular/core': "",
            },
          };
          expect(adp.isProject(packageJson, 'ng')).to.be.true;
        });

      it('detects a non Angular project from dependencies',
        function () {
          const packageJson = {
            dependencies: {
              vscode: "",
            },
          };
          expect(adp.isProject(packageJson, 'ng')).to.be.false;
        });

      it('detects a non Angular project from devDependencies',
        function () {
          const packageJson = {
            devDependencies: {
              vscode: "",
            },
          };
          expect(adp.isProject(packageJson, 'ng')).to.be.false;
        });

      it('does not detect a project when it does not exist',
        function () {
          const packageJson = {
            dependencies: {
              '@angular/core': "",
              'vscode': "",
            },
          };
          expect(adp.isProject(packageJson, 'meteor')).to.be.false;
        });

      context('detects that special icons are', function () {

        let sandbox: sinon.SinonSandbox;

        beforeEach(() => {
          sandbox = sinon.sandbox.create();
        });

        afterEach(() => {
          sandbox.restore();
        });

        it('enabled',
          function () {
            const iconManifest = '{ "iconDefinitions": { "_f_ng_": {} } }';
            sandbox.stub(fs, 'readFileSync').returns(iconManifest);
            expect(adp.iconsDisabled('ng')).to.be.false;
          });

        it('disabled',
          function () {
            const iconManifest = '{ "iconDefinitions": { "_f_codecov": {} } }';
            sandbox.stub(fs, 'readFileSync').returns(iconManifest);
            expect(adp.iconsDisabled('ng')).to.be.true;
          });

        it('disabled if they do not exist',
          function () {
            const iconManifest = '';
            sandbox.stub(fs, 'readFileSync').returns(iconManifest);
            expect(adp.iconsDisabled('ng')).to.be.true;
          });

        it('assumed disabled if icon manifest file fails to be loaded',
          function () {
            sandbox.stub(fs, 'readFileSync').throws(Error);
            expect(adp.iconsDisabled('ng')).to.be.true;
          });
      });

      context('detects that special folder icons are', function () {

        let sandbox: sinon.SinonSandbox;

        beforeEach(() => {
          sandbox = sinon.sandbox.create();
        });

        afterEach(() => {
          sandbox.restore();
        });

        it('enabled',
          function () {
            const iconManifest = '{ "iconDefinitions": { "_fd_aws": {} } }';
            sandbox.stub(fs, 'readFileSync').returns(iconManifest);
            expect(adp.iconsDisabled('aws', false)).to.be.false;
          });

        it('disabled',
          function () {
            const iconManifest = '{ "iconDefinitions": { "_fd_git": {} } }';
            sandbox.stub(fs, 'readFileSync').returns(iconManifest);
            expect(adp.iconsDisabled('aws', false)).to.be.true;
          });

        it('disabled if they do not exist',
          function () {
            const iconManifest = '';
            sandbox.stub(fs, 'readFileSync').returns(iconManifest);
            expect(adp.iconsDisabled('aws', false)).to.be.true;
          });

        it('assumed disabled if icon manifest file fails to be loaded',
          function () {
            sandbox.stub(fs, 'readFileSync').throws(Error);
            expect(adp.iconsDisabled('aws', false)).to.be.true;
          });
      });

      context('detects that specific folders icons are', function () {

        let sandbox: sinon.SinonSandbox;

        beforeEach(() => {
          sandbox = sinon.sandbox.create();
        });

        afterEach(() => {
          sandbox.restore();
        });

        it('enabled',
          function () {
            const iconManifest = '{ "iconDefinitions": { "_fd_aws": {} } }';
            const func = sinon.stub().returns(true);
            sandbox.stub(fs, 'readFileSync').returns(iconManifest);
            expect(adp.folderIconsDisabled(func)).to.be.false;
          });

        it('disabled',
          function () {
            const iconManifest = '{ "iconDefinitions": { "_fd_git": {} } }';
            const func = sinon.stub().returns(false);
            sandbox.stub(fs, 'readFileSync').returns(iconManifest);
            expect(adp.folderIconsDisabled(func)).to.be.true;
          });

        it('disabled if they do not exist',
          function () {
            const iconManifest = '';
            const func = sinon.stub();
            sandbox.stub(fs, 'readFileSync').returns(iconManifest);
            expect(adp.folderIconsDisabled(func)).to.be.true;
          });

        it('assumed disabled if icon manifest file fails to be loaded',
          function () {
            const func = sinon.stub();
            sandbox.stub(fs, 'readFileSync').throws(Error);
            expect(adp.folderIconsDisabled(func)).to.be.true;
          });
      });

      context('detect a project when detection is enabled', function () {

        it('but it has not detected a \'package.json\' file',
          function () {
            const findFiles = sinon.stub().returns(Promise.resolve([]));
            userConfig.projectDetection.disableDetect = false;
            return expect(adp.detectProject(findFiles, userConfig))
              .to.eventually.be.an('array').with.lengthOf(0);
          });

        it('and has detected a \'package.json\' file',
          function () {
            const path = 'package.json';
            const findFiles = sinon.stub().returns(Promise.resolve([{ fsPath: path }] as IVSCodeUri[]));
            userConfig.projectDetection.disableDetect = false;
            return adp.detectProject(findFiles, userConfig)
              .then(res => {
                expect(res).to.be.an('array').with.length.greaterThan(0);
                expect(res[0]).to.have.property('fsPath').that.equals(path);
              });
          });

      });

    });

    context('enables the Angular icons when the workspace is an Angular project and Angular icons are disabled',
      function () {

        it('or Angular preset is false',
          function () {
            const isNgProject = true;
            const ngIconsDisabled = true;
            const i18nManager = sinon.createStubInstance(LanguageResourceManager);
            const res = adp.checkForAngularProject(ngIconsDisabled, isNgProject, i18nManager);
            expect(res).to.have.property('apply').that.is.true;
            expect(res).to.have.property('value').that.is.true;
          });

        it('or Angular preset is true',
          function () {
            const isNgProject = true;
            const ngIconsDisabled = true;
            const i18nManager = sinon.createStubInstance(LanguageResourceManager);
            const res = adp.checkForAngularProject(ngIconsDisabled, isNgProject, i18nManager);
            expect(res).to.have.property('apply').that.is.true;
            expect(res).to.have.property('value').that.is.true;
          });

      });

    context('disables the Angular icons when the workspace is not an Angular project and Angular icons are enabled',
      function () {

        it('or Angular preset is true',
          function () {
            const isNgProject = false;
            const ngIconsDisabled = false;
            const i18nManager = sinon.createStubInstance(LanguageResourceManager);
            const res = adp.checkForAngularProject(ngIconsDisabled, isNgProject, i18nManager);
            expect(res).to.have.property('apply').that.is.true;
            expect(res).to.have.property('value').that.is.false;
          });

        it('or Angular preset is false',
          function () {
            const isNgProject = false;
            const ngIconsDisabled = false;
            const i18nManager = sinon.createStubInstance(LanguageResourceManager);
            const res = adp.checkForAngularProject(ngIconsDisabled, isNgProject, i18nManager);
            expect(res).to.have.property('apply').that.is.true;
            expect(res).to.have.property('value').that.is.false;
          });

      });

    context('does not toggle the Angular icons when the workspace is', function () {

      it('an Angular project and the Angular preset is true or Angular icons are enabled',
        function () {
          const isNgProject = true;
          const ngIconsDisabled = false;
          expect(adp.checkForAngularProject(ngIconsDisabled, isNgProject, undefined))
            .to.have.property('apply').that.is.false;
        });

      it('not an Angular project and the Angular preset is false or Angular icons are disabled',
        function () {
          const isNgProject = false;
          const ngIconsDisabled = true;
          expect(adp.checkForAngularProject(ngIconsDisabled, isNgProject, undefined))
            .to.have.property('apply').that.is.false;
        });

    });

    context('when user has selected', function () {

      it('to auto restart, applies the changes and restarts',
        function () {

          const autoReload = true;
          const applyCustomizationFn = sinon.spy();
          const reloadFn = sinon.spy();
          const showCustomizationMessageFn = sinon.spy();

          return adp.applyDetection(undefined, undefined, undefined, undefined, autoReload,
            applyCustomizationFn, showCustomizationMessageFn, reloadFn)
            .then(() => {
              expect(applyCustomizationFn.called).to.be.true;
              expect(reloadFn.called).to.be.true;
              expect(showCustomizationMessageFn.called).to.be.false;
            });
        });

      it('not to auto restart, shows the customization message',
        function () {
          const autoReload = false;
          const applyCustomizationFn = sinon.spy();
          const reloadFn = sinon.spy();
          const showCustomizationMessageFn = sinon.spy();
          const i18nManager = sinon.createStubInstance(LanguageResourceManager);

          return adp.applyDetection(i18nManager, undefined, undefined, undefined, autoReload,
            applyCustomizationFn, showCustomizationMessageFn, reloadFn)
            .then(() => {
              expect(applyCustomizationFn.called).to.be.false;
              expect(reloadFn.called).to.be.false;
              expect(showCustomizationMessageFn.called).to.be.true;
            });
        });

    });

  });

});
