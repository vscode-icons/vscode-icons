// tslint:disable only-arrow-functions
// tslint:disable no-unused-expression
import { expect } from 'chai';
import * as fs from 'fs';
import * as sinon from 'sinon';
import { ConfigManager } from '../../src/configuration/configManager';
import { ManifestReader } from '../../src/iconsManifest';
import {
  IConfigManager,
  IProjectAutoDetectionManager,
  IVSCodeManager,
  Projects,
} from '../../src/models';
import { ProjectAutoDetectionManager } from '../../src/pad/projectAutoDetectionManager';
import { Utils } from '../../src/utils';
import { VSCodeManager } from '../../src/vscode/vscodeManager';
import { vsicons } from '../fixtures/vsicons';

describe('ProjectAutoDetectionManager: Angular project tests', function () {
  context('ensures that', function () {
    let sandbox: sinon.SinonSandbox;
    let configManagerStub: sinon.SinonStubbedInstance<IConfigManager>;
    let vscodeManagerStub: sinon.SinonStubbedInstance<IVSCodeManager>;
    let findFilesStub: sinon.SinonStub;
    let getPresetStub: sinon.SinonStub;
    let parseJSONStub: sinon.SinonStub;
    let padManager: IProjectAutoDetectionManager;

    beforeEach(() => {
      sandbox = sinon.createSandbox();

      configManagerStub = sandbox.createStubInstance<IConfigManager>(
        ConfigManager,
      );

      sandbox.stub(configManagerStub, 'vsicons').get(() => vsicons);
      getPresetStub = configManagerStub.getPreset;

      vscodeManagerStub = sandbox.createStubInstance<IVSCodeManager>(
        VSCodeManager,
      );

      findFilesStub = sandbox.stub();
      sandbox.stub(vscodeManagerStub, 'workspace').get(() => ({
        findFiles: findFilesStub,
      }));

      padManager = new ProjectAutoDetectionManager(
        vscodeManagerStub,
        configManagerStub,
      );

      parseJSONStub = sandbox.stub(Utils, 'parseJSON');
    });

    afterEach(function () {
      padManager = null;
      sandbox.restore();
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
            expect(readFileStub.calledOnceWithExactly(packageJsonPath, 'utf8'))
              .to.be.true;
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
            expect(readFileStub.calledOnceWithExactly(packageJsonPath, 'utf8'))
              .to.be.true;
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
            expect(readFileStub.calledWithExactly(packageJsonPath, 'utf8')).to
              .be.true;
            expect(Reflect.ownKeys(res)).to.have.lengthOf(5);
            expect(res)
              .to.be.an('object')
              .and.to.have.all.keys(
                'apply',
                'project',
                'conflictingProjects',
                'langResourceKey',
                'value',
              );
            expect(res).ownProperty('apply').to.be.true;
            expect(res)
              .ownProperty('project')
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
            expect(readFileStub.calledWithExactly(packageJsonPath, 'utf8')).to
              .be.true;
            expect(Reflect.ownKeys(res)).to.have.lengthOf(5);
            expect(res)
              .to.be.an('object')
              .and.to.have.all.keys(
                'apply',
                'project',
                'conflictingProjects',
                'langResourceKey',
                'value',
              );
            expect(res).ownProperty('apply').to.be.true;
            expect(res)
              .ownProperty('project')
              .to.equal(Projects.angular);
            expect(res).ownProperty('value').to.be.true;
          });
        });
      });

      context(`detects a non Angular project from`, function () {
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
            expect(readFileStub.calledOnceWithExactly(packageJsonPath, 'utf8'))
              .to.be.true;
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
            expect(readFileStub.calledOnceWithExactly(packageJsonPath, 'utf8'))
              .to.be.true;
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
            expect(readFileStub.calledOnceWithExactly(packageJsonPath, 'utf8'))
              .to.be.true;
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

      context('the icons get enabled when', function () {
        context(`the icons are disabled and the workspace is`, function () {
          context('an Angular project and', function () {
            beforeEach(function () {
              parseJSONStub.returns({
                dependencies: { '@angular/core': '0.0.0' },
              });
            });

            it(`preset is 'true'`, function () {
              getPresetStub.returns({ workspaceValue: true });
              iconsDisabledStub.returns(true);

              return padManager.detectProjects([Projects.angular]).then(res => {
                expect(readFileStub.calledOnceWith(packageJsonPath, 'utf8')).to
                  .be.true;
                expect(Reflect.ownKeys(res)).to.have.lengthOf(5);
                expect(res)
                  .to.be.an('object')
                  .and.to.have.all.keys(
                    'apply',
                    'project',
                    'conflictingProjects',
                    'langResourceKey',
                    'value',
                  );
                expect(res).ownProperty('apply').to.be.true;
                expect(res)
                  .ownProperty('project')
                  .to.equal(Projects.angular);
                expect(res).ownProperty('value').to.be.true;
              });
            });

            it(`preset is 'undefined'`, function () {
              getPresetStub.returns({ workspaceValue: undefined });
              iconsDisabledStub.returns(true);

              return padManager.detectProjects([Projects.angular]).then(res => {
                expect(readFileStub.calledWithExactly(packageJsonPath, 'utf8'))
                  .to.be.true;
                expect(Reflect.ownKeys(res)).to.have.lengthOf(5);
                expect(res)
                  .to.be.an('object')
                  .and.to.have.all.keys(
                    'apply',
                    'project',
                    'conflictingProjects',
                    'langResourceKey',
                    'value',
                  );
                expect(res).ownProperty('apply').to.be.true;
                expect(res)
                  .ownProperty('project')
                  .to.equal(Projects.angular);
                expect(res).ownProperty('value').to.be.true;
              });
            });
          });

          context('not an Angular project and', function () {
            beforeEach(function () {
              parseJSONStub.returns({ dependencies: { vscode: '0.0.0' } });
            });

            it(`preset is 'true'`, function () {
              getPresetStub.returns({ workspaceValue: true });
              iconsDisabledStub.returns(true);

              return padManager.detectProjects([Projects.angular]).then(res => {
                expect(readFileStub.calledOnceWith(packageJsonPath, 'utf8')).to
                  .be.true;
                expect(Reflect.ownKeys(res)).to.have.lengthOf(5);
                expect(res)
                  .to.be.an('object')
                  .and.to.have.all.keys(
                    'apply',
                    'project',
                    'conflictingProjects',
                    'langResourceKey',
                    'value',
                  );
                expect(res).ownProperty('apply').to.be.true;
                expect(res)
                  .ownProperty('project')
                  .to.equal(Projects.angular);
                expect(res).ownProperty('value').to.be.true;
              });
            });
          });
        });
      });

      context('the icons get disabled when', function () {
        context('the icons are enabled and the workspace is', function () {
          context('not an Angular project and', function () {
            beforeEach(function () {
              parseJSONStub.returns({ dependencies: { vscode: '0.0.0' } });
            });

            it(`preset is 'false'`, function () {
              getPresetStub.returns({ workspaceValue: false });
              iconsDisabledStub.returns(false);

              return padManager.detectProjects([Projects.angular]).then(res => {
                expect(readFileStub.calledOnceWith(packageJsonPath, 'utf8')).to
                  .be.true;
                expect(Reflect.ownKeys(res)).to.have.lengthOf(5);
                expect(res)
                  .to.be.an('object')
                  .and.to.have.all.keys(
                    'apply',
                    'project',
                    'conflictingProjects',
                    'langResourceKey',
                    'value',
                  );
                expect(res).ownProperty('apply').to.be.true;
                expect(res)
                  .ownProperty('project')
                  .to.equal(Projects.angular);
                expect(res).ownProperty('value').to.be.false;
              });
            });

            it(`preset is 'undefined'`, function () {
              getPresetStub.returns({ workspaceValue: undefined });
              iconsDisabledStub.returns(false);

              return padManager.detectProjects([Projects.angular]).then(res => {
                expect(readFileStub.calledOnceWith(packageJsonPath, 'utf8')).to
                  .be.true;
                expect(Reflect.ownKeys(res)).to.have.lengthOf(5);
                expect(res)
                  .to.be.an('object')
                  .and.to.have.all.keys(
                    'apply',
                    'project',
                    'conflictingProjects',
                    'langResourceKey',
                    'value',
                  );
                expect(res).ownProperty('apply').to.be.true;
                expect(res)
                  .ownProperty('project')
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

            it(`preset is 'false'`, function () {
              getPresetStub.returns({ workspaceValue: false });
              iconsDisabledStub.returns(false);

              return padManager.detectProjects([Projects.angular]).then(res => {
                expect(readFileStub.calledOnceWith(packageJsonPath, 'utf8')).to
                  .be.true;
                expect(Reflect.ownKeys(res)).to.have.lengthOf(5);
                expect(res)
                  .to.be.an('object')
                  .and.to.have.all.keys(
                    'apply',
                    'project',
                    'conflictingProjects',
                    'langResourceKey',
                    'value',
                  );
                expect(res).ownProperty('apply').to.be.true;
                expect(res)
                  .ownProperty('project')
                  .to.equal(Projects.angular);
                expect(res).ownProperty('value').to.be.false;
              });
            });
          });
        });
      });

      context('does not toggle the icons when', function () {
        context('the icons are enabled and the workspace is', function () {
          beforeEach(function () {
            iconsDisabledStub.returns(false);
          });

          context('an Angular project and', function () {
            beforeEach(function () {
              parseJSONStub.returns({
                dependencies: { '@angular/core': '0.0.0' },
              });
            });

            it(`preset is 'true'`, function () {
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

            it(`preset is 'undefined'`, function () {
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

            it(`preset is 'true'`, function () {
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

        context('the icons are disabled and the workspace is', function () {
          beforeEach(function () {
            iconsDisabledStub.returns(true);
          });

          context('not an Angular project and', function () {
            beforeEach(function () {
              parseJSONStub.returns({ dependencies: { vscode: '0.0.0' } });
            });

            it(`preset is 'false'`, function () {
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

            it(`preset is 'undefined'`, function () {
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

            it(`preset is 'false'`, function () {
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

        context('conflicting project icons are enabled and', function () {
          it('its preset is explicitly set', function () {
            parseJSONStub.returns({
              dependencies: {
                '@angular/core': '1.0.0',
                '@nestjs/core': '1.0.0',
              },
            });
            getPresetStub
              .onSecondCall()
              .returns({ workspaceValue: true })
              .returns({ workspaceValue: undefined });
            iconsDisabledStub
              .onSecondCall()
              .returns(false)
              .returns(true);

            return padManager.detectProjects([Projects.angular]).then(res => {
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
