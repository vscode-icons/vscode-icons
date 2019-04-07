// tslint:disable only-arrow-functions
// tslint:disable no-unused-expression
import { expect } from 'chai';
import * as fs from 'fs';
import * as sinon from 'sinon';
import { ConfigManager } from '../../src/configuration/configManager';
import { ErrorHandler } from '../../src/errorHandler';
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

describe('ProjectAutoDetectionManager: tests', function () {
  context('ensures that', function () {
    let sandbox: sinon.SinonSandbox;
    let configManagerStub: sinon.SinonStubbedInstance<IConfigManager>;
    let vscodeManagerStub: sinon.SinonStubbedInstance<IVSCodeManager>;
    let findFilesStub: sinon.SinonStub;
    let logErrorStub: sinon.SinonStub;
    let padManager: IProjectAutoDetectionManager;

    beforeEach(() => {
      sandbox = sinon.createSandbox();

      configManagerStub = sandbox.createStubInstance<IConfigManager>(
        ConfigManager,
      );

      sandbox.stub(configManagerStub, 'vsicons').get(() => vsicons);

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

      logErrorStub = sandbox.stub(ErrorHandler, 'logError');
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

    it('detects non conflicting projects', function () {
      vsicons.projectDetection.disableDetect = false;
      findFilesStub.resolves([{ fsPath: '' }]);
      sandbox.stub(fs, 'readFileSync').returns(undefined);
      sandbox.stub(Utils, 'parseJSON').returns({
        dependencies: {
          angularjs: '1.0.0',
          meteo: '1.0.0',
        },
      });
      configManagerStub.getPreset.returns({
        key: '',
        workspaceValue: undefined,
      });
      sandbox.stub(ManifestReader, 'iconsDisabled').returns(true);
      // @ts-ignore
      sandbox.stub(padManager, 'getProjectInfo').returns({});

      return padManager.detectProjects([Projects.angularjs]).then(res => {
        expect(res)
          .to.be.an('object')
          .and.have.ownProperty('conflictingProjects').that.is.empty;
      });
    });

    context('does NOT detect a project when', function () {
      const testCase = (projectNames: Projects[]) =>
        padManager
          .detectProjects(projectNames)
          .then(res => expect(res).to.not.be.an('object'));

      it(`project names are 'undefined'`, function () {
        return testCase(undefined);
      });

      it(`no project names are given`, function () {
        return testCase([]);
      });

      it(`detection fails`, function () {
        findFilesStub.resolves(undefined);

        return testCase([Projects.angular]);
      });

      it(`no 'package.json' exists`, function () {
        findFilesStub.resolves([]);

        return testCase([Projects.angular]);
      });

      it('detection is disabled', function () {
        vsicons.projectDetection.disableDetect = true;

        return testCase([Projects.angular]);
      });
    });

    context('when conflicting project icons are detected', function () {
      it('returns the conflict project detected \'LangResourceKey\'', function () {
        vsicons.projectDetection.disableDetect = false;
        findFilesStub.resolves([{ fsPath: '' }]);
        sandbox.stub(fs, 'readFileSync').returns(undefined);
        sandbox.stub(Utils, 'parseJSON').returns({
          dependencies: {
            '@angular/core': '1.0.0',
            '@nestjs/core': '1.0.0',
          },
        });
        configManagerStub.getPreset.returns({
          key: '',
          workspaceValue: undefined,
        });
        sandbox.stub(ManifestReader, 'iconsDisabled').returns(true);

        return padManager
          .detectProjects([Projects.angular, Projects.nestjs])
          .then(res => {
            expect(res)
              .to.be.an('object')
              .and.have.ownProperty('langResourceKey')
              .to.equal(LangResourceKeys.conflictProjectsDetected);
          });
      });
    });
  });
});
