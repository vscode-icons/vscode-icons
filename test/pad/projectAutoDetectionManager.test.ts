/* eslint-disable prefer-arrow-callback */
/* eslint-disable no-unused-expressions */
import { expect } from 'chai';
import * as sinon from 'sinon';
import { ErrorHandler } from '../../src/common/errorHandler';
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

      configManagerStub =
        sandbox.createStubInstance<IConfigManager>(ConfigManager);

      sandbox.stub(configManagerStub, 'vsicons').get(() => vsicons);

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

      await padManager.detectProjects([Projects.angular]);

      expect(logErrorStub.calledOnceWith(error)).to.be.true;
    });

    it('detects non conflicting projects', async function () {
      vsicons.projectDetection.disableDetect = false;
      findFilesStub.resolves([{ fsPath: '' }]);
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

      const res = await padManager.detectProjects([Projects.angularjs]);
      const firstResult = res[0];

      expect(res).to.be.an('array');
      expect(firstResult)
        .to.be.an('object')
        .and.have.ownProperty('conflictingProjects').that.is.empty;
    });

    context('does NOT detect a project when', function () {
      const testCase = async (projectNames: Projects[]): Promise<void> => {
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

        await testCase([Projects.angular]);
      });

      it(`no 'package.json' exists`, async function () {
        findFilesStub.resolves([]);

        await testCase([Projects.angular]);
      });

      it('detection is disabled', async function () {
        vsicons.projectDetection.disableDetect = true;

        await testCase([Projects.angular]);
      });
    });

    context('when conflicting project icons are detected', function () {
      it(`returns the conflict project detected 'LangResourceKey'`, async function () {
        vsicons.projectDetection.disableDetect = false;
        findFilesStub.resolves([{ fsPath: '' }]);
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
          Projects.angular,
          Projects.nestjs,
        ]);
        const firstResult = res[0];

        expect(res).to.be.an('array');
        expect(firstResult)
          .to.be.an('object')
          .and.have.ownProperty('langResourceKey')
          .to.equal(LangResourceKeys.conflictProjectsDetected);
      });
    });
  });
});
