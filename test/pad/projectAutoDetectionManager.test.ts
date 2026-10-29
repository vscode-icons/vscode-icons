import type {
  ConfigManagerContract,
  ProjectAutoDetectionManagerContract,
  VSCodeManagerContract,
} from '../../src/types';

import { expect } from 'chai';
import * as sinon from 'sinon';

import { ErrorHandler } from '../../src/common/errorHandler';
import * as fsAsync from '../../src/common/fsAsync';
import { ConfigManager } from '../../src/configuration/configManager';
import { ManifestReader } from '../../src/iconsManifest';
import { ProjectAutoDetectionManager } from '../../src/pad/projectAutoDetectionManager';
import * as enums from '../../src/types/enums';
import { Utils } from '../../src/utils';
import { VSCodeManager } from '../../src/vscode/vscodeManager';
import { vsicons } from '../fixtures/vsicons';

describe('ProjectAutoDetectionManagerContract: tests', function () {
  context('ensures that', function () {
    let sandbox: sinon.SinonSandbox;
    let configManagerStub: sinon.SinonStubbedInstance<ConfigManagerContract>;
    let vscodeManagerStub: sinon.SinonStubbedInstance<VSCodeManagerContract>;
    let findFilesStub: sinon.SinonStub;
    let logErrorStub: sinon.SinonStub;
    let padManager: ProjectAutoDetectionManagerContract;

    beforeEach(() => {
      sandbox = sinon.createSandbox();

      configManagerStub =
        sandbox.createStubInstance<ConfigManagerContract>(ConfigManager);

      sandbox.stub(configManagerStub, 'vsicons').get(() => vsicons);

      vscodeManagerStub =
        sandbox.createStubInstance<VSCodeManagerContract>(VSCodeManager);

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
      expect(
        () => new ProjectAutoDetectionManager(null, configManagerStub),
      ).to.throw(ReferenceError, /'vscodeManager' not set to an instance/);
    });

    it(`an Error gets thrown, when 'configManager' is NOT instantiated`, function () {
      expect(
        () => new ProjectAutoDetectionManager(vscodeManagerStub, null),
      ).to.throw(ReferenceError, /'configManager' not set to an instance/);
    });

    it(`logs an Error when searching for a 'package.json' fails`, async function () {
      const error = new Error('failure');
      findFilesStub.rejects(error);

      await padManager.detectProjects([enums.Projects.angular]);

      expect(logErrorStub.calledOnceWith(error)).to.be.true;
    });

    it('detects non conflicting projects', async function () {
      vsicons.projectDetection.disableDetect = false;
      findFilesStub.resolves([{ fsPath: '/workspace/package.json' }]);
      sandbox.stub(fsAsync, 'readFileAsync').resolves(undefined);
      sandbox.stub(Utils, 'parseJSONSafe').returns({
        dependencies: {
          angularjs: '1.0.0',
          meteo: '1.0.0',
        },
      });
      configManagerStub.getPreset.returns({
        key: '',
        workspaceValue: undefined,
      });
      sandbox.stub(ManifestReader, 'iconsDisabled').resolves(true);
      // @ts-ignore
      sandbox.stub(padManager, 'getProjectInfo').resolves({});

      const res = await padManager.detectProjects([enums.Projects.angularjs]);

      expect(res).to.be.an('array');
      expect(res).to.not.be.empty;

      const firstResult = res[0];

      expect(firstResult).to.be.an('object');
      expect(firstResult).to.have.property('apply', false);
      expect(firstResult).to.not.have.property('conflictingProjects');
    });

    context('does NOT detect a project when', function () {
      const testCase = async (
        projectNames: enums.Projects[],
      ): Promise<void> => {
        const res = await padManager.detectProjects(projectNames);

        expect(res).to.not.be.an('object');
      };

      it(`project names are 'undefined'`, async function () {
        await testCase(undefined);
      });

      it(`no project names are given`, async function () {
        await testCase([]);
      });

      it(`detection fails`, async function () {
        findFilesStub.resolves(undefined);

        await testCase([enums.Projects.angular]);
      });

      it(`no 'package.json' exists`, async function () {
        findFilesStub.resolves([]);

        await testCase([enums.Projects.angular]);
      });

      it('detection is disabled', async function () {
        vsicons.projectDetection.disableDetect = true;

        await testCase([enums.Projects.angular]);
      });
    });

    context('when conflicting project icons are detected', function () {
      it('does not detect conflicts for projects without conflict rules', async function () {
        vsicons.projectDetection.disableDetect = false;
        findFilesStub.resolves([{ fsPath: '/workspace/package.json' }]);
        configManagerStub.getPreset.returns({
          key: '',
          workspaceValue: undefined,
        });
        sandbox.stub(ManifestReader, 'iconsDisabled').resolves(true);
        sandbox
          .stub(
            padManager as unknown as {
              getProjectInfo: () => Promise<{ name: enums.Projects }>;
            },
            'getProjectInfo',
          )
          .resolves({ name: enums.Projects.angularjs });

        const res = await padManager.detectProjects([enums.Projects.angularjs]);

        expect(res).to.be.an('array');
        expect(res).to.not.be.empty;

        const firstResult = res[0];

        expect(firstResult).to.have.property('conflictingProjects').that.is
          .empty;
      });

      it(`returns the conflict project detected 'LangResourceKey'`, async function () {
        vsicons.projectDetection.disableDetect = false;
        findFilesStub.resolves([{ fsPath: '/workspace/package.json' }]);
        sandbox.stub(fsAsync, 'readFileAsync').resolves(undefined);
        sandbox.stub(Utils, 'parseJSONSafe').returns({
          dependencies: {
            '@angular/core': '1.0.0',
            '@nestjs/core': '1.0.0',
          },
        });
        configManagerStub.getPreset.returns({
          key: '',
          workspaceValue: undefined,
        });
        sandbox.stub(ManifestReader, 'iconsDisabled').resolves(true);

        const res = await padManager.detectProjects([
          enums.Projects.angular,
          enums.Projects.nestjs,
        ]);

        expect(res).to.be.an('array');
        expect(res).to.not.be.empty;

        const firstResult = res[0];

        expect(firstResult)
          .to.be.an('object')
          .and.have.ownProperty('langResourceKey')
          .to.equal(enums.LangResourceKeys.conflictProjectsDetected);
      });

      it('detects config-file conflicts when only one project is requested', async function () {
        vsicons.projectDetection.disableDetect = false;
        findFilesStub.resolves([
          { fsPath: '/workspace/angular.json' },
          { fsPath: '/workspace/nest-cli.json' },
        ]);
        sandbox.stub(ManifestReader, 'iconsDisabled').resolves(true);

        const res = await padManager.detectProjects([enums.Projects.angular]);

        expect(findFilesStub.firstCall.args[0]).to.contain('nest-cli.json');
        expect(res).to.have.lengthOf(1);
        expect(res[0].conflictingProjects).to.deep.equal([
          enums.Projects.nestjs,
        ]);
      });

      it('detects a project when no workspace preset is configured', async function () {
        vsicons.projectDetection.disableDetect = false;
        findFilesStub.resolves([{ fsPath: '/workspace/package.json' }]);
        sandbox.stub(fsAsync, 'readFileAsync').resolves(undefined);
        sandbox.stub(Utils, 'parseJSONSafe').returns({
          dependencies: {
            '@angular/core': '1.0.0',
          },
        });
        sandbox.stub(ManifestReader, 'iconsDisabled').resolves(true);

        const res = await padManager.detectProjects([enums.Projects.angular]);

        expect(res).to.be.an('array');
        expect(res).to.not.be.empty;

        const firstResult = res[0];

        expect(firstResult).to.have.property('apply', true);
      });
    });
  });
});
