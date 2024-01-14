/* eslint-disable prefer-arrow-callback */
/* eslint-disable no-unused-expressions */
import { expect } from 'chai';
import * as sinon from 'sinon';
import * as fsAsync from '../../src/common/fsAsync';
import { ConfigManager } from '../../src/configuration/configManager';
import { ManifestReader } from '../../src/iconsManifest';
import {
  IConfigManager,
  IProjectAutoDetectionManager,
  IVSCodeManager,
  LangResourceKeys,
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

      configManagerStub =
        sandbox.createStubInstance<IConfigManager>(ConfigManager);

      sandbox.stub(configManagerStub, 'vsicons').get(() => vsicons);
      // eslint-disable-next-line @typescript-eslint/unbound-method
      getPresetStub = configManagerStub.getPreset;

      vscodeManagerStub =
        sandbox.createStubInstance<IVSCodeManager>(VSCodeManager);

      findFilesStub = sandbox.stub();
      sandbox.stub(vscodeManagerStub, 'workspace').get(() => ({
        findFiles: findFilesStub,
      }));

      padManager = new ProjectAutoDetectionManager(
        vscodeManagerStub,
        configManagerStub,
      );

      parseJSONStub = sandbox.stub(Utils, 'parseJSONSafe');
    });

    afterEach(function () {
      padManager = null;
      sandbox.restore();
    });

    context('when detection is enabled', function () {
      let readFileAsyncStub: sinon.SinonStub;
      let iconsDisabledStub: sinon.SinonStub;
      let packageJsonPath = 'package.json';

      beforeEach(function () {
        vsicons.projectDetection.disableDetect = false;
        findFilesStub.resolves([{ fsPath: packageJsonPath }]);
        readFileAsyncStub = sandbox.stub(fsAsync, 'readFileAsync');
        iconsDisabledStub = sandbox.stub(ManifestReader, 'iconsDisabled');
      });

      context(`detects a 'package.json' file`, function () {
        beforeEach(function () {
          parseJSONStub.returns({ name: 'project' });
        });

        it('on the root directory', async function () {
          getPresetStub.returns({ workspaceValue: undefined });
          iconsDisabledStub.resolves(true);

          const res = await padManager.detectProjects([Projects.angular]);
          const firstResult = res[0];

          expect(
            readFileAsyncStub.calledOnceWithExactly(packageJsonPath, 'utf8'),
          ).to.be.true;
          expect(res).to.be.an('array');
          expect(firstResult).to.be.an('object');
          expect(Reflect.ownKeys(firstResult)).to.have.lengthOf(1);
          expect(firstResult).to.have.all.keys('apply').and.ownProperty('apply')
            .to.be.false;
        });

        it('in a sub folder', async function () {
          packageJsonPath = 'f1/f2/f3/package.json';

          findFilesStub.resolves([{ fsPath: packageJsonPath }]);
          getPresetStub.returns({ workspaceValue: undefined });
          iconsDisabledStub.resolves(true);

          const res = await padManager.detectProjects([Projects.angular]);
          const firstResult = res[0];

          expect(
            readFileAsyncStub.calledOnceWithExactly(packageJsonPath, 'utf8'),
          ).to.be.true;
          expect(res).to.be.an('array');
          expect(firstResult).to.be.an('object');
          expect(Reflect.ownKeys(firstResult)).to.have.lengthOf(1);
          expect(firstResult)
            .to.be.an('object')
            .and.to.have.all.keys('apply')
            .and.ownProperty('apply').to.be.false;
        });
      });

      context(`detects an Angular project from`, function () {
        it('dependencies', async function () {
          parseJSONStub.returns({ dependencies: { '@angular/core': '1.0.0' } });
          getPresetStub.returns({ workspaceValue: undefined });
          iconsDisabledStub.resolves(true);

          const res = await padManager.detectProjects([Projects.angular]);
          const firstResult = res[0];

          expect(readFileAsyncStub.calledWithExactly(packageJsonPath, 'utf8'))
            .to.be.true;
          expect(res).to.be.an('array');
          expect(firstResult).to.be.an('object');
          expect(Reflect.ownKeys(firstResult)).to.have.lengthOf(5);
          expect(firstResult).to.have.all.keys(
            'apply',
            'project',
            'conflictingProjects',
            'langResourceKey',
            'value',
          );
          expect(firstResult).ownProperty('apply').to.be.true;
          expect(firstResult).ownProperty('project').to.equal(Projects.angular);
          expect(firstResult).ownProperty('conflictingProjects').to.be.empty;
          expect(firstResult)
            .ownProperty('langResourceKey')
            .to.equal(LangResourceKeys.ngDetected);
          expect(firstResult).ownProperty('value').to.be.true;
        });

        it('devDependencies', async function () {
          parseJSONStub.returns({
            devDependencies: { '@angular/core': '1.0.0' },
          });
          getPresetStub.returns({ workspaceValue: undefined });
          iconsDisabledStub.resolves(true);

          const res = await padManager.detectProjects([Projects.angular]);
          const firstResult = res[0];

          expect(readFileAsyncStub.calledWithExactly(packageJsonPath, 'utf8'))
            .to.be.true;
          expect(res).to.be.an('array');
          expect(firstResult).to.be.an('object');
          expect(Reflect.ownKeys(firstResult)).to.have.lengthOf(5);
          expect(firstResult).to.have.all.keys(
            'apply',
            'project',
            'conflictingProjects',
            'langResourceKey',
            'value',
          );
          expect(firstResult).ownProperty('apply').to.be.true;
          expect(firstResult).ownProperty('project').to.equal(Projects.angular);
          expect(firstResult).ownProperty('conflictingProjects').to.be.empty;
          expect(firstResult)
            .ownProperty('langResourceKey')
            .to.equal(LangResourceKeys.ngDetected);
          expect(firstResult).ownProperty('value').to.be.true;
        });
      });

      context(`detects a non Angular project from`, function () {
        beforeEach(function () {
          parseJSONStub.returns({ dependencies: { vscode: '' } });
        });

        it('dependencies', async function () {
          getPresetStub.returns({ workspaceValue: undefined });
          iconsDisabledStub.resolves(true);

          const res = await padManager.detectProjects([Projects.angular]);
          const firstResult = res[0];

          expect(readFileAsyncStub.calledOnceWith(packageJsonPath, 'utf8')).to
            .be.true;
          expect(res).to.be.an('array');
          expect(firstResult).to.be.an('object');
          expect(Reflect.ownKeys(firstResult)).to.have.lengthOf(1);
          expect(firstResult).to.have.all.keys('apply').and.ownProperty('apply')
            .to.be.false;
        });

        it('devDependencies', async function () {
          getPresetStub.returns({ workspaceValue: undefined });
          iconsDisabledStub.resolves(true);

          const res = await padManager.detectProjects([Projects.angular]);
          const firstResult = res[0];

          expect(readFileAsyncStub.calledOnceWith(packageJsonPath, 'utf8')).to
            .be.true;
          expect(res).to.be.an('array');
          expect(firstResult).to.be.an('object');
          expect(Reflect.ownKeys(firstResult)).to.have.lengthOf(1);
          expect(firstResult).to.have.all.keys('apply').and.ownProperty('apply')
            .to.be.false;
        });
      });

      context(`does NOT detect a project when`, function () {
        it('it does NOT exist', async function () {
          parseJSONStub.returns({
            dependencies: {
              '@angular/core': '',
              vscode: '',
            },
          });
          getPresetStub.returns({ workspaceValue: undefined });
          iconsDisabledStub.resolves(true);

          const res = await padManager.detectProjects([Projects.angular]);
          const firstResult = res[0];

          expect(
            readFileAsyncStub.calledOnceWithExactly(packageJsonPath, 'utf8'),
          ).to.be.true;
          expect(res).to.be.an('array');
          expect(firstResult).to.be.an('object');
          expect(Reflect.ownKeys(firstResult)).to.have.lengthOf(1);
          expect(firstResult).to.have.all.keys('apply').and.ownProperty('apply')
            .to.be.false;
        });

        it('no project json object is provided', async function () {
          parseJSONStub.returns(null);
          getPresetStub.returns({ workspaceValue: undefined });
          iconsDisabledStub.resolves(true);

          const res = await padManager.detectProjects([Projects.angular]);
          const firstResult = res[0];

          expect(
            readFileAsyncStub.calledOnceWithExactly(packageJsonPath, 'utf8'),
          ).to.be.true;
          expect(res).to.be.an('array');
          expect(firstResult).to.be.an('object');
          expect(Reflect.ownKeys(firstResult)).to.have.lengthOf(1);
          expect(firstResult).to.have.all.keys('apply').and.ownProperty('apply')
            .to.be.false;
        });

        it('no dependencies and devDependecies exists', async function () {
          parseJSONStub.returns({});
          getPresetStub.returns({ workspaceValue: undefined });
          iconsDisabledStub.resolves(true);

          const res = await padManager.detectProjects([Projects.angular]);
          const firstResult = res[0];

          expect(
            readFileAsyncStub.calledOnceWithExactly(packageJsonPath, 'utf8'),
          ).to.be.true;
          expect(res).to.be.an('array');
          expect(firstResult).to.be.an('object');
          expect(Reflect.ownKeys(firstResult)).to.have.lengthOf(1);
          expect(firstResult).to.have.all.keys('apply').and.ownProperty('apply')
            .to.be.false;
        });

        it('project name does NOT exists', async function () {
          parseJSONStub.returns({
            dependencies: {
              '@angular/core': '0.0.0',
            },
          });
          getPresetStub.returns({ workspaceValue: undefined });
          iconsDisabledStub.resolves(true);

          const res = await padManager.detectProjects([Projects.angularjs]);
          const firstResult = res[0];

          expect(readFileAsyncStub.calledOnceWith(packageJsonPath, 'utf8')).to
            .be.true;
          expect(res).to.be.an('array');
          expect(firstResult).to.be.an('object');
          expect(Reflect.ownKeys(firstResult)).to.have.lengthOf(1);
          expect(firstResult).to.have.all.keys('apply').and.ownProperty('apply')
            .to.be.false;
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

            it(`preset is 'true'`, async function () {
              getPresetStub.returns({ workspaceValue: true });
              iconsDisabledStub.resolves(true);

              const res = await padManager.detectProjects([Projects.angular]);
              const firstResult = res[0];

              expect(readFileAsyncStub.calledOnceWith(packageJsonPath, 'utf8'))
                .to.be.true;
              expect(res).to.be.an('array');
              expect(firstResult).to.be.an('object');
              expect(Reflect.ownKeys(firstResult)).to.have.lengthOf(5);
              expect(firstResult).to.have.all.keys(
                'apply',
                'project',
                'conflictingProjects',
                'langResourceKey',
                'value',
              );
              expect(firstResult).ownProperty('apply').to.be.true;
              expect(firstResult)
                .ownProperty('project')
                .to.equal(Projects.angular);
              expect(firstResult).ownProperty('conflictingProjects').to.be
                .empty;
              expect(firstResult)
                .ownProperty('langResourceKey')
                .to.equal(LangResourceKeys.nonNgDetectedPresetTrue);
              expect(firstResult).ownProperty('value').to.be.true;
            });

            it(`preset is 'undefined'`, async function () {
              getPresetStub.returns({ workspaceValue: undefined });
              iconsDisabledStub.resolves(true);

              const res = await padManager.detectProjects([Projects.angular]);
              const firstResult = res[0];

              expect(
                readFileAsyncStub.calledWithExactly(packageJsonPath, 'utf8'),
              ).to.be.true;
              expect(res).to.be.an('array');
              expect(firstResult).to.be.an('object');
              expect(Reflect.ownKeys(firstResult)).to.have.lengthOf(5);
              expect(firstResult).to.have.all.keys(
                'apply',
                'project',
                'conflictingProjects',
                'langResourceKey',
                'value',
              );
              expect(firstResult).ownProperty('apply').to.be.true;
              expect(firstResult)
                .ownProperty('project')
                .to.equal(Projects.angular);
              expect(firstResult).ownProperty('conflictingProjects').to.be
                .empty;
              expect(firstResult)
                .ownProperty('langResourceKey')
                .to.equal(LangResourceKeys.ngDetected);
              expect(firstResult).ownProperty('value').to.be.true;
            });
          });

          context('not an Angular project and', function () {
            beforeEach(function () {
              parseJSONStub.returns({ dependencies: { vscode: '0.0.0' } });
            });

            it(`preset is 'true'`, async function () {
              getPresetStub.returns({ workspaceValue: true });
              iconsDisabledStub.resolves(true);

              const res = await padManager.detectProjects([Projects.angular]);
              const firstResult = res[0];

              expect(readFileAsyncStub.calledOnceWith(packageJsonPath, 'utf8'))
                .to.be.true;
              expect(res).to.be.an('array');
              expect(firstResult).to.be.an('object');
              expect(Reflect.ownKeys(firstResult)).to.have.lengthOf(5);
              expect(firstResult).to.have.all.keys(
                'apply',
                'project',
                'conflictingProjects',
                'langResourceKey',
                'value',
              );
              expect(firstResult).ownProperty('apply').to.be.true;
              expect(firstResult)
                .ownProperty('project')
                .to.equal(Projects.angular);
              expect(firstResult).ownProperty('conflictingProjects').to.be
                .empty;
              expect(firstResult)
                .ownProperty('langResourceKey')
                .to.equal(LangResourceKeys.nonNgDetectedPresetTrue);
              expect(firstResult).ownProperty('value').to.be.true;
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

            it(`preset is 'false'`, async function () {
              getPresetStub.returns({ workspaceValue: false });
              iconsDisabledStub.resolves(false);

              const res = await padManager.detectProjects([Projects.angular]);
              const firstResult = res[0];

              expect(readFileAsyncStub.calledOnceWith(packageJsonPath, 'utf8'))
                .to.be.true;
              expect(res).to.be.an('array');
              expect(firstResult).to.be.an('object');
              expect(Reflect.ownKeys(firstResult)).to.have.lengthOf(5);
              expect(firstResult).to.have.all.keys(
                'apply',
                'project',
                'conflictingProjects',
                'langResourceKey',
                'value',
              );
              expect(firstResult).ownProperty('apply').to.be.true;
              expect(firstResult)
                .ownProperty('project')
                .to.equal(Projects.angular);
              expect(firstResult).ownProperty('conflictingProjects').to.be
                .empty;
              expect(firstResult)
                .ownProperty('langResourceKey')
                .to.equal(LangResourceKeys.ngDetectedPresetFalse);
              expect(firstResult).ownProperty('value').to.be.false;
            });

            it(`preset is 'undefined'`, async function () {
              getPresetStub.returns({ workspaceValue: undefined });
              iconsDisabledStub.resolves(false);

              const res = await padManager.detectProjects([Projects.angular]);
              const firstResult = res[0];

              expect(readFileAsyncStub.calledOnceWith(packageJsonPath, 'utf8'))
                .to.be.true;
              expect(res).to.be.an('array');
              expect(firstResult).to.be.an('object');
              expect(Reflect.ownKeys(firstResult)).to.have.lengthOf(5);
              expect(firstResult).to.have.all.keys(
                'apply',
                'project',
                'conflictingProjects',
                'langResourceKey',
                'value',
              );
              expect(firstResult).ownProperty('apply').to.be.true;
              expect(firstResult)
                .ownProperty('project')
                .to.equal(Projects.angular);
              expect(firstResult).ownProperty('conflictingProjects').to.be
                .empty;
              expect(firstResult)
                .ownProperty('langResourceKey')
                .to.equal(LangResourceKeys.nonNgDetected);
              expect(firstResult).ownProperty('value').to.be.false;
            });
          });

          context('an Angular project and', function () {
            beforeEach(function () {
              parseJSONStub.returns({
                dependencies: { '@angular/core': '0.0.0' },
              });
            });

            it(`preset is 'false'`, async function () {
              getPresetStub.returns({ workspaceValue: false });
              iconsDisabledStub.resolves(false);

              const res = await padManager.detectProjects([Projects.angular]);
              const firstResult = res[0];

              expect(readFileAsyncStub.calledOnceWith(packageJsonPath, 'utf8'))
                .to.be.true;
              expect(res).to.be.an('array');
              expect(firstResult).to.be.an('object');
              expect(Reflect.ownKeys(firstResult)).to.have.lengthOf(5);
              expect(firstResult).to.have.all.keys(
                'apply',
                'project',
                'conflictingProjects',
                'langResourceKey',
                'value',
              );
              expect(firstResult).ownProperty('apply').to.be.true;
              expect(firstResult)
                .ownProperty('project')
                .to.equal(Projects.angular);
              expect(firstResult).ownProperty('conflictingProjects').to.be
                .empty;
              expect(firstResult)
                .ownProperty('langResourceKey')
                .to.equal(LangResourceKeys.ngDetectedPresetFalse);
              expect(firstResult).ownProperty('value').to.be.false;
            });
          });
        });
      });

      context('does not toggle the icons when', function () {
        context('the icons are enabled and the workspace is', function () {
          beforeEach(function () {
            iconsDisabledStub.resolves(false);
          });

          context('an Angular project and', function () {
            beforeEach(function () {
              parseJSONStub.returns({
                dependencies: { '@angular/core': '0.0.0' },
              });
            });

            it(`preset is 'true'`, async function () {
              getPresetStub.returns({ workspaceValue: true });

              const res = await padManager.detectProjects([Projects.angular]);
              const firstResult = res[0];

              expect(readFileAsyncStub.called).to.be.false;
              expect(res).to.be.an('array');
              expect(firstResult).to.be.an('object');
              expect(Reflect.ownKeys(firstResult)).to.have.lengthOf(1);
              expect(firstResult)
                .to.have.all.keys('apply')
                .and.ownProperty('apply').to.be.false;
            });

            it(`preset is 'undefined'`, async function () {
              getPresetStub.returns({ workspaceValue: undefined });

              const res = await padManager.detectProjects([Projects.angular]);
              const firstResult = res[0];

              expect(readFileAsyncStub.calledOnceWith(packageJsonPath, 'utf8'))
                .to.be.true;
              expect(res).to.be.an('array');
              expect(firstResult).to.be.an('object');
              expect(Reflect.ownKeys(firstResult)).to.have.lengthOf(1);
              expect(firstResult)
                .to.have.all.keys('apply')
                .and.ownProperty('apply').to.be.false;
            });
          });

          context('not an Angular project and', function () {
            beforeEach(function () {
              parseJSONStub.returns({ dependencies: { vscode: '0.0.0' } });
            });

            it(`preset is 'true'`, async function () {
              getPresetStub.returns({ workspaceValue: true });

              const res = await padManager.detectProjects([Projects.angular]);
              const firstResult = res[0];

              expect(readFileAsyncStub.called).to.be.false;
              expect(res).to.be.an('array');
              expect(firstResult).to.be.an('object');
              expect(Reflect.ownKeys(firstResult)).to.have.lengthOf(1);
              expect(firstResult)
                .to.have.all.keys('apply')
                .and.ownProperty('apply').to.be.false;
            });
          });
        });

        context('the icons are disabled and the workspace is', function () {
          beforeEach(function () {
            iconsDisabledStub.resolves(true);
          });

          context('not an Angular project and', function () {
            beforeEach(function () {
              parseJSONStub.returns({ dependencies: { vscode: '0.0.0' } });
            });

            it(`preset is 'false'`, async function () {
              getPresetStub.returns({ workspaceValue: false });

              const res = await padManager.detectProjects([Projects.angular]);
              const firstResult = res[0];

              expect(readFileAsyncStub.called).to.be.false;
              expect(res).to.be.an('array');
              expect(firstResult).to.be.an('object');
              expect(Reflect.ownKeys(firstResult)).to.have.lengthOf(1);
              expect(firstResult)
                .to.have.all.keys('apply')
                .and.ownProperty('apply').to.be.false;
            });

            it(`preset is 'undefined'`, async function () {
              getPresetStub.returns({ workspaceValue: undefined });

              const res = await padManager.detectProjects([Projects.angular]);
              const firstResult = res[0];

              expect(readFileAsyncStub.calledOnceWith(packageJsonPath, 'utf8'))
                .to.be.true;
              expect(res).to.be.an('array');
              expect(firstResult).to.be.an('object');
              expect(Reflect.ownKeys(firstResult)).to.have.lengthOf(1);
              expect(firstResult)
                .to.have.all.keys('apply')
                .and.ownProperty('apply').to.be.false;
            });
          });

          context('an Angular project and', function () {
            beforeEach(function () {
              parseJSONStub.returns({
                dependencies: { '@angular/core': '0.0.0' },
              });
            });

            it(`preset is 'false'`, async function () {
              getPresetStub.returns({ workspaceValue: false });

              const res = await padManager.detectProjects([Projects.angular]);
              const firstResult = res[0];

              expect(readFileAsyncStub.called).to.be.false;
              expect(res).to.be.an('array');
              expect(firstResult).to.be.an('object');
              expect(Reflect.ownKeys(firstResult)).to.have.lengthOf(1);
              expect(firstResult)
                .to.have.all.keys('apply')
                .and.ownProperty('apply').to.be.false;
            });
          });
        });

        context('conflicting project icons are enabled and', function () {
          it('its preset is explicitly set', async function () {
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
            iconsDisabledStub.onSecondCall().resolves(false).resolves(true);

            const res = await padManager.detectProjects([Projects.angular]);
            const firstResult = res[0];

            expect(iconsDisabledStub.callCount).to.be.equal(1);
            expect(res).to.be.an('array');
            expect(firstResult).to.be.an('object');
            expect(Reflect.ownKeys(firstResult)).to.have.lengthOf(1);
            expect(firstResult)
              .to.have.all.keys('apply')
              .and.ownProperty('apply').to.be.false;
          });
        });
      });
    });
  });
});
