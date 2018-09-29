// tslint:disable only-arrow-functions
// tslint:disable no-unused-expression
import { expect } from 'chai';
import * as fs from 'fs';
import * as sinon from 'sinon';
import {
  IVSCodeManager,
  IProjectAutoDetectionManager,
  Projects,
  IConfigManager,
} from '../../src/models';
import { VSCodeManager } from '../../src/vscode/vscodeManager';
import { ProjectAutoDetectionManager } from '../../src/pad/projectAutoDetectionManager';
import { ConfigManager } from '../../src/configuration/configManager';
import { ManifestReader } from '../../src/iconsManifest';
import { ErrorHandler } from '../../src/errorHandler';
import { Utils } from '../../src/utils';
import { vsicons } from '../fixtures/vsicons';

describe('ProjectAutoDetectionManager: tests', function () {
  context('ensures that', function () {
    let sandbox: sinon.SinonSandbox;
    let configManagerStub: sinon.SinonStubbedInstance<IConfigManager>;
    let vscodeManagerStub: sinon.SinonStubbedInstance<IVSCodeManager>;
    let findFilesStub: sinon.SinonStub;
    let getPresetStub: sinon.SinonStub;
    let parseJSONStub: sinon.SinonStub;
    let logErrorStub: sinon.SinonStub;
    let padManager: IProjectAutoDetectionManager;

    beforeEach(() => {
      sandbox = sinon.createSandbox();

      configManagerStub = sandbox.createStubInstance<IConfigManager>(
        ConfigManager
      );

      sandbox.stub(configManagerStub, 'vsicons').get(() => vsicons);
      getPresetStub = configManagerStub.getPreset;

      vscodeManagerStub = sandbox.createStubInstance<IVSCodeManager>(
        VSCodeManager
      );

      findFilesStub = sandbox.stub();
      sandbox.stub(vscodeManagerStub, 'workspace').get(() => ({
        findFiles: findFilesStub,
      }));

      padManager = new ProjectAutoDetectionManager(
        vscodeManagerStub,
        configManagerStub
      );

      logErrorStub = sandbox.stub(ErrorHandler, 'logError');
      parseJSONStub = sandbox.stub(Utils, 'parseJSON');
    });

    afterEach(function () {
      padManager = null;
      sandbox.restore();
    });

    it(`an Error gets thrown, when 'vscodeManager' is NOT instantiated`, function () {
      expect(() => new ProjectAutoDetectionManager(null, configManagerStub))
        .to.throw(ReferenceError)
        .that.matches(/'vscodeManager' not set to an instance/);
    });

    it(`an Error gets thrown, when 'configManager' is NOT instantiated`, function () {
      expect(() => new ProjectAutoDetectionManager(vscodeManagerStub, null))
        .to.throw(ReferenceError)
        .that.matches(/'configManager' not set to an instance/);
    });

    it(`logs an Error when searching for a 'package.json' fails`, function () {
      const reason = new Error('failure');
      findFilesStub.rejects(reason);

      return padManager
        .detectProjects([Projects.angular])
        .then(() => expect(logErrorStub.calledOnceWith(reason)).to.be.true);
    });

    context('does NOT detect a project when', function () {
      it(`project names are 'undefined'`, function () {
        return padManager
          .detectProjects(undefined)
          .then(res => expect(res).to.not.be.an('object'));
      });

      it(`no project names are given`, function () {
        return padManager
          .detectProjects([])
          .then(res => expect(res).to.not.be.an('object'));
      });

      it(`detection fails`, function () {
        findFilesStub.resolves(undefined);

        return padManager
          .detectProjects([Projects.angular])
          .then(res => expect(res).to.not.be.an('object'));
      });

      it(`no 'package.json' exists`, function () {
        findFilesStub.resolves([]);

        return padManager
          .detectProjects([Projects.angular])
          .then(res => expect(res).to.not.be.an('object'));
      });

      it(`no 'package.json' exists`, function () {
        findFilesStub.resolves([]);

        return padManager
          .detectProjects([Projects.angular])
          .then(res => expect(res).to.not.be.an('object'));
      });

      it('detection is disabled', function () {
        vsicons.projectDetection.disableDetect = true;

        return padManager
          .detectProjects([Projects.angular])
          .then(res => expect(res).to.not.be.an('object'));
      });
    });

    context('when detection is enabled', function () {
      let readFileStub: sinon.SinonStub;
      let iconsDisabledStub: sinon.SinonStub;
      let packageJsonPath: string = 'package.json';

      beforeEach(function () {
        vsicons.projectDetection.disableDetect = false;
        findFilesStub.resolves([{ fsPath: packageJsonPath }]);
        readFileStub = sandbox.stub(fs, 'readFileSync');
        iconsDisabledStub = sandbox.stub(ManifestReader, 'iconsDisabled');
      });

      context(`detects a 'package.json' file`, function () {
        beforeEach(function () {
          parseJSONStub.returns({ name: 'project' });
        });

        it('on the root directory', function () {
          getPresetStub.returns({ workspaceValue: undefined });
          iconsDisabledStub.returns(true);

          return padManager.detectProjects([Projects.angular]).then(res => {
            expect(readFileStub.calledOnceWithExactly(packageJsonPath , 'utf8')).to.be.true;
            expect(Reflect.ownKeys(res)).to.have.lengthOf(1);
            expect(res)
              .to.be.an('object')
              .and.to.have.all.keys('apply')
              .and.ownProperty('apply').to.be.false;
          });
        });

        it('in a sub folder', function () {
          packageJsonPath = 'f1/f2/f3/package.json';

          findFilesStub.resolves([{ fsPath: packageJsonPath }]);
          getPresetStub.returns({ workspaceValue: undefined });
          iconsDisabledStub.returns(true);

          return padManager.detectProjects([Projects.angular]).then(res => {
            expect(readFileStub.calledOnceWithExactly(packageJsonPath, 'utf8')).to.be
              .true;
            expect(Reflect.ownKeys(res)).to.have.lengthOf(1);
            expect(res)
              .to.be.an('object')
              .and.to.have.all.keys('apply')
              .and.ownProperty('apply').to.be.false;
          });
        });
      });

      context(`detects an Angular project from`, function () {
        it('dependencies', function () {
          parseJSONStub.returns({ dependencies: { '@angular/core': '1.0.0' } });
          getPresetStub.returns({ workspaceValue: undefined });
          iconsDisabledStub.returns(true);

          return padManager.detectProjects([Projects.angular]).then(res => {
            expect(readFileStub.calledOnceWithExactly(packageJsonPath, 'utf8')).to.be
              .true;
            expect(Reflect.ownKeys(res)).to.have.lengthOf(4);
            expect(res)
              .to.be.an('object')
              .and.to.have.all.keys(
                'apply',
                'projectName',
                'langResourceKey',
                'value'
              );
            expect(res).ownProperty('apply').to.be.true;
            expect(res)
              .ownProperty('projectName')
              .to.equal(Projects.angular);
            expect(res).ownProperty('value').to.be.true;
          });
        });

        it('devDependencies', function () {
          parseJSONStub.returns({
            devDependencies: { '@angular/core': '1.0.0' },
          });
          getPresetStub.returns({ workspaceValue: undefined });
          iconsDisabledStub.returns(true);

          return padManager.detectProjects([Projects.angular]).then(res => {
            expect(readFileStub.calledOnceWith(packageJsonPath, 'utf8')).to.be
              .true;
            expect(Reflect.ownKeys(res)).to.have.lengthOf(4);
            expect(res)
              .to.be.an('object')
              .and.to.have.all.keys(
                'apply',
                'projectName',
                'langResourceKey',
                'value'
              );
            expect(res).ownProperty('apply').to.be.true;
            expect(res)
              .ownProperty('projectName')
              .to.equal(Projects.angular);
            expect(res).ownProperty('value').to.be.true;
          });
        });
      });

      context(`detects an non Angular project from`, function () {
        beforeEach(function () {
          parseJSONStub.returns({ dependencies: { vscode: '' } });
        });

        it('dependencies', function () {
          getPresetStub.returns({ workspaceValue: undefined });
          iconsDisabledStub.returns(true);

          return padManager.detectProjects([Projects.angular]).then(res => {
            expect(readFileStub.calledOnceWith(packageJsonPath, 'utf8')).to.be
              .true;
            expect(Reflect.ownKeys(res)).to.have.lengthOf(1);
            expect(res)
              .to.be.an('object')
              .and.to.have.all.keys('apply')
              .and.ownProperty('apply').to.be.false;
          });
        });

        it('devDependencies', function () {
          getPresetStub.returns({ workspaceValue: undefined });
          iconsDisabledStub.returns(true);

          return padManager.detectProjects([Projects.angular]).then(res => {
            expect(readFileStub.calledOnceWith(packageJsonPath, 'utf8')).to.be
              .true;
            expect(Reflect.ownKeys(res)).to.have.lengthOf(1);
            expect(res)
              .to.be.an('object')
              .and.to.have.all.keys('apply')
              .and.ownProperty('apply').to.be.false;
          });
        });
      });

      context(`does NOT detect a project when`, function () {
        it('it does NOT exist', function () {
          parseJSONStub.returns({
            dependencies: {
              '@angular/core': '',
              vscode: '',
            },
          });
          getPresetStub.returns({ workspaceValue: undefined });
          iconsDisabledStub.returns(true);

          return padManager.detectProjects([Projects.angular]).then(res => {
            expect(readFileStub.calledOnceWith(packageJsonPath, 'utf8')).to.be
              .true;
            expect(Reflect.ownKeys(res)).to.have.lengthOf(1);
            expect(res)
              .to.be.an('object')
              .and.to.have.all.keys('apply')
              .and.ownProperty('apply').to.be.false;
          });
        });

        it('no project json object is provided', function () {
          parseJSONStub.returns(null);
          getPresetStub.returns({ workspaceValue: undefined });
          iconsDisabledStub.returns(true);

          return padManager.detectProjects([Projects.angular]).then(res => {
            expect(readFileStub.calledOnceWith(packageJsonPath, 'utf8')).to.be
              .true;
            expect(Reflect.ownKeys(res)).to.have.lengthOf(1);
            expect(res)
              .to.be.an('object')
              .and.to.have.all.keys('apply')
              .and.ownProperty('apply').to.be.false;
          });
        });

        it('no dependencies and devDependecies exists', function () {
          parseJSONStub.returns({});
          getPresetStub.returns({ workspaceValue: undefined });
          iconsDisabledStub.returns(true);

          return padManager.detectProjects([Projects.angular]).then(res => {
            expect(readFileStub.calledOnceWith(packageJsonPath, 'utf8')).to.be
              .true;
            expect(Reflect.ownKeys(res)).to.have.lengthOf(1);
            expect(res)
              .to.be.an('object')
              .and.to.have.all.keys('apply');
            expect(res).ownProperty('apply').to.be.false;
          });
        });

        it('project name does NOT exists', function () {
          parseJSONStub.returns({
            dependencies: {
              '@angular/core': '0.0.0',
            },
          });
          getPresetStub.returns({ workspaceValue: undefined });
          iconsDisabledStub.returns(true);

          return padManager.detectProjects([Projects.angularjs]).then(res => {
            expect(readFileStub.calledOnceWith(packageJsonPath, 'utf8')).to.be
              .true;
            expect(Reflect.ownKeys(res)).to.have.lengthOf(1);
            expect(res)
              .to.be.an('object')
              .and.to.have.all.keys('apply')
              .and.ownProperty('apply').to.be.false;
          });
        });
      });

      context('enables the Angular icons when', function () {
        context(`Angular icons are disabled and the workspace is`, function () {
          context('an Angular project and', function () {
            beforeEach(function () {
              parseJSONStub.returns({
                dependencies: { '@angular/core': '0.0.0' },
              });
            });

            it(`Angular preset is 'true'`, function () {
              getPresetStub.returns({ workspaceValue: true });
              iconsDisabledStub.returns(true);

              return padManager.detectProjects([Projects.angular]).then(res => {
                expect(readFileStub.calledOnceWith(packageJsonPath, 'utf8')).to
                  .be.true;
                expect(Reflect.ownKeys(res)).to.have.lengthOf(4);
                expect(res)
                  .to.be.an('object')
                  .and.to.have.all.keys(
                    'apply',
                    'projectName',
                    'langResourceKey',
                    'value'
                  );
                expect(res).ownProperty('apply').to.be.true;
                expect(res)
                  .ownProperty('projectName')
                  .to.equal(Projects.angular);
                expect(res).ownProperty('value').to.be.true;
              });
            });

            it(`Angular preset is 'undefined'`, function () {
              getPresetStub.returns({ workspaceValue: undefined });
              iconsDisabledStub.returns(true);

              return padManager.detectProjects([Projects.angular]).then(res => {
                expect(readFileStub.calledOnceWith(packageJsonPath, 'utf8')).to
                  .be.true;
                expect(Reflect.ownKeys(res)).to.have.lengthOf(4);
                expect(res)
                  .to.be.an('object')
                  .and.to.have.all.keys(
                    'apply',
                    'projectName',
                    'langResourceKey',
                    'value'
                  );
                expect(res).ownProperty('apply').to.be.true;
                expect(res)
                  .ownProperty('projectName')
                  .to.equal(Projects.angular);
                expect(res).ownProperty('value').to.be.true;
              });
            });
          });

          context('not an Angular project and', function () {
            beforeEach(function () {
              parseJSONStub.returns({ dependencies: { vscode: '0.0.0' } });
            });

            it(`Angular preset is 'true'`, function () {
              getPresetStub.returns({ workspaceValue: true });
              iconsDisabledStub.returns(true);

              return padManager.detectProjects([Projects.angular]).then(res => {
                expect(readFileStub.calledOnceWith(packageJsonPath, 'utf8')).to
                  .be.true;
                expect(Reflect.ownKeys(res)).to.have.lengthOf(4);
                expect(res)
                  .to.be.an('object')
                  .and.to.have.all.keys(
                    'apply',
                    'projectName',
                    'langResourceKey',
                    'value'
                  );
                expect(res).ownProperty('apply').to.be.true;
                expect(res)
                  .ownProperty('projectName')
                  .to.equal(Projects.angular);
                expect(res).ownProperty('value').to.be.true;
              });
            });
          });
        });
      });

      context('disables the Angular icons when', function () {
        context('Angular icons are enabled and the workspace is', function () {
          context('not an Angular project and', function () {
            beforeEach(function () {
              parseJSONStub.returns({ dependencies: { vscode: '0.0.0' } });
            });

            it(`Angular preset is 'false'`, function () {
              getPresetStub.returns({ workspaceValue: false });
              iconsDisabledStub.returns(false);

              return padManager.detectProjects([Projects.angular]).then(res => {
                expect(readFileStub.calledOnceWith(packageJsonPath, 'utf8')).to
                  .be.true;
                expect(Reflect.ownKeys(res)).to.have.lengthOf(4);
                expect(res)
                  .to.be.an('object')
                  .and.to.have.all.keys(
                    'apply',
                    'projectName',
                    'langResourceKey',
                    'value'
                  );
                expect(res).ownProperty('apply').to.be.true;
                expect(res)
                  .ownProperty('projectName')
                  .to.equal(Projects.angular);
                expect(res).ownProperty('value').to.be.false;
              });
            });

            it(`Angular preset is 'undefined'`, function () {
              getPresetStub.returns({ workspaceValue: undefined });
              iconsDisabledStub.returns(false);

              return padManager.detectProjects([Projects.angular]).then(res => {
                expect(readFileStub.calledOnceWith(packageJsonPath, 'utf8')).to
                  .be.true;
                expect(Reflect.ownKeys(res)).to.have.lengthOf(4);
                expect(res)
                  .to.be.an('object')
                  .and.to.have.all.keys(
                    'apply',
                    'projectName',
                    'langResourceKey',
                    'value'
                  );
                expect(res).ownProperty('apply').to.be.true;
                expect(res)
                  .ownProperty('projectName')
                  .to.equal(Projects.angular);
                expect(res).ownProperty('value').to.be.false;
              });
            });
          });

          context('an Angular project and', function () {
            beforeEach(function () {
              parseJSONStub.returns({
                dependencies: { '@angular/core': '0.0.0' },
              });
            });

            it(`Angular preset is 'false'`, function () {
              getPresetStub.returns({ workspaceValue: false });
              iconsDisabledStub.returns(false);

              return padManager.detectProjects([Projects.angular]).then(res => {
                expect(readFileStub.calledOnceWith(packageJsonPath, 'utf8')).to
                  .be.true;
                expect(Reflect.ownKeys(res)).to.have.lengthOf(4);
                expect(res)
                  .to.be.an('object')
                  .and.to.have.all.keys(
                    'apply',
                    'projectName',
                    'langResourceKey',
                    'value'
                  );
                expect(res).ownProperty('apply').to.be.true;
                expect(res)
                  .ownProperty('projectName')
                  .to.equal(Projects.angular);
                expect(res).ownProperty('value').to.be.false;
              });
            });
          });
        });
      });

      context('does not toggle the Angular icons when', function () {
        context('Angular icons are enabled and the workspace is', function () {
          beforeEach(function () {
            iconsDisabledStub.returns(false);
          });

          context('an Angular project and', function () {
            beforeEach(function () {
              parseJSONStub.returns({
                dependencies: { '@angular/core': '0.0.0' },
              });
            });

            it(`Angular preset is 'true'`, function () {
              getPresetStub.returns({ workspaceValue: true });

              return padManager.detectProjects([Projects.angular]).then(res => {
                expect(readFileStub.called).to.be.false;
                expect(Reflect.ownKeys(res)).to.have.lengthOf(1);
                expect(res)
                  .to.be.an('object')
                  .and.to.have.all.keys('apply')
                  .and.ownProperty('apply').to.be.false;
              });
            });

            it(`Angular preset is 'undefined'`, function () {
              getPresetStub.returns({ workspaceValue: undefined });

              return padManager.detectProjects([Projects.angular]).then(res => {
                expect(readFileStub.calledOnceWith(packageJsonPath, 'utf8')).to
                  .be.true;
                expect(Reflect.ownKeys(res)).to.have.lengthOf(1);
                expect(res)
                  .to.be.an('object')
                  .and.to.have.all.keys('apply')
                  .and.ownProperty('apply').to.be.false;
              });
            });
          });

          context('not an Angular project and', function () {
            beforeEach(function () {
              parseJSONStub.returns({ dependencies: { vscode: '0.0.0' } });
            });

            it(`Angular preset is 'true'`, function () {
              getPresetStub.returns({ workspaceValue: true });

              return padManager.detectProjects([Projects.angular]).then(res => {
                expect(readFileStub.called).to.be.false;
                expect(Reflect.ownKeys(res)).to.have.lengthOf(1);
                expect(res)
                  .to.be.an('object')
                  .and.to.have.all.keys('apply')
                  .and.ownProperty('apply').to.be.false;
              });
            });
          });
        });

        context('Angular icons are disabled and the workspace is', function () {
          beforeEach(function () {
            iconsDisabledStub.returns(true);
          });

          context('not an Angular project and', function () {
            beforeEach(function () {
              parseJSONStub.returns({ dependencies: { vscode: '0.0.0' } });
            });

            it(`Angular preset is 'false'`, function () {
              getPresetStub.returns({ workspaceValue: false });

              return padManager.detectProjects([Projects.angular]).then(res => {
                expect(readFileStub.called).to.be.false;
                expect(Reflect.ownKeys(res)).to.have.lengthOf(1);
                expect(res)
                  .to.be.an('object')
                  .and.to.have.all.keys('apply')
                  .and.ownProperty('apply').to.be.false;
              });
            });

            it(`Angular preset is 'undefined'`, function () {
              getPresetStub.returns({ workspaceValue: undefined });

              return padManager.detectProjects([Projects.angular]).then(res => {
                expect(readFileStub.calledOnceWith(packageJsonPath, 'utf8')).to
                  .be.true;
                expect(Reflect.ownKeys(res)).to.have.lengthOf(1);
                expect(res)
                  .to.be.an('object')
                  .and.to.have.all.keys('apply')
                  .and.ownProperty('apply').to.be.false;
              });
            });
          });

          context('an Angular project and', function () {
            beforeEach(function () {
              parseJSONStub.returns({
                dependencies: { '@angular/core': '0.0.0' },
              });
            });

            it(`Angular preset is 'false'`, function () {
              getPresetStub.returns({ workspaceValue: false });

              return padManager.detectProjects([Projects.angular]).then(res => {
                expect(readFileStub.called).to.be.false;
                expect(Reflect.ownKeys(res)).to.have.lengthOf(1);
                expect(res)
                  .to.be.an('object')
                  .and.to.have.all.keys('apply')
                  .and.ownProperty('apply').to.be.false;
              });
            });
          });
        });
      });
    });
  });
});
