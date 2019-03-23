// tslint:disable only-arrow-functions
// tslint:disable no-unused-expression
import { expect } from 'chai';
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
import { ErrorHandler } from '../../src/errorHandler';
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
  });
});
