/* eslint-disable prefer-arrow-callback */
/* eslint-disable no-unused-expressions */
import { expect } from 'chai';
import * as semver from 'semver';
import * as sinon from 'sinon';
import { ErrorHandler } from '../../src/common/errorHandler';
import * as fsAsync from '../../src/common/fsAsync';
import { constants } from '../../src/constants';
import {
  ExtensionStatus,
  ISettingsManager,
  IState,
  IVSCodeManager,
} from '../../src/models';
import { SettingsManager } from '../../src/settings/settingsManager';
import { Utils } from '../../src/utils';
import { VSCodeManager } from '../../src/vscode/vscodeManager';

describe('SettingsManager: tests', function () {
  context('ensures that', function () {
    let sandbox: sinon.SinonSandbox;
    let vscodeManagerStub: sinon.SinonStubbedInstance<IVSCodeManager>;
    let settingsManager: ISettingsManager;
    let stateMock: IState;
    let globalStateGetStub: sinon.SinonStub;
    let globalStateUpdateStub: sinon.SinonStub;
    let logErrorStub: sinon.SinonStub;
    let parseJSONStub: sinon.SinonStub;

    beforeEach(function () {
      sandbox = sinon.createSandbox();

      vscodeManagerStub =
        sandbox.createStubInstance<IVSCodeManager>(VSCodeManager);

      globalStateGetStub = sandbox.stub();
      globalStateUpdateStub = sandbox.stub();
      sandbox.stub(vscodeManagerStub, 'context').get(() => ({
        globalState: {
          get: globalStateGetStub,
          update: globalStateUpdateStub,
        },
      }));

      settingsManager = new SettingsManager(vscodeManagerStub);

      logErrorStub = sandbox.stub(ErrorHandler, 'logError');
      parseJSONStub = sandbox.stub(Utils, 'parseJSONSafe');
      sandbox.stub(Utils, 'pathUnixJoin');

      stateMock = {
        version: '0.0.0',
        status: ExtensionStatus.deactivated,
        welcomeShown: false,
      };
    });

    afterEach(function () {
      settingsManager = null;
      sandbox.restore();
    });

    it(`an Error gets thrown, when 'vscodeManager' is NOT instantiated`, function () {
      expect(() => new SettingsManager(null))
        .to.throw(ReferenceError)
        .that.matches(/'vscodeManager' not set to an instance/);
    });

    context('moving the state from its legacy place', function () {
      let existsAsyncStub: sinon.SinonStub;
      let readFileAsyncStub: sinon.SinonStub;
      let unlinkFileAsyncStub: sinon.SinonStub;
      let semverSpy: sinon.SinonSpy;

      beforeEach(function () {
        existsAsyncStub = sandbox.stub(fsAsync, 'existsAsync');
        readFileAsyncStub = sandbox.stub(fsAsync, 'readFileAsync');
        unlinkFileAsyncStub = sandbox.stub(fsAsync, 'unlinkAsync');
        vscodeManagerStub.getAppUserDirPath.returns('');
      });

      it('when the file is NOT found, no moving happens', async function () {
        existsAsyncStub.resolves(false);
        globalStateUpdateStub.resolves();

        await settingsManager.moveStateFromLegacyPlace();

        expect(existsAsyncStub.calledOnce).to.be.true;
        expect(readFileAsyncStub.called).to.be.false;
        expect(globalStateUpdateStub.called).to.be.false;
        expect(unlinkFileAsyncStub.called).to.be.false;
      });

      context(`when the file is found`, function () {
        beforeEach(function () {
          semverSpy = sandbox.spy(semver, 'eq');
        });

        context(`it gets not moved`, function () {
          it(`if state version equals the default state version`, async function () {
            existsAsyncStub.resolves(true);
            readFileAsyncStub.resolves(JSON.stringify(stateMock));
            globalStateUpdateStub.resolves();

            await settingsManager.moveStateFromLegacyPlace();

            expect(existsAsyncStub.calledOnce).to.be.true;
            expect(readFileAsyncStub.calledOnce).to.be.true;
            expect(semverSpy.calledOnceWithExactly('0.0.0', '0.0.0')).to.be
              .true;
            expect(globalStateUpdateStub.called).to.be.false;
            expect(unlinkFileAsyncStub.called).to.be.false;
          });

          it(`if parsing the state fails`, async function () {
            existsAsyncStub.resolves(true);
            readFileAsyncStub.resolves('sometext');
            globalStateUpdateStub.resolves();

            await settingsManager.moveStateFromLegacyPlace();

            expect(existsAsyncStub.calledOnce).to.be.true;
            expect(readFileAsyncStub.calledOnce).to.be.true;
            expect(semverSpy.calledOnceWithExactly('0.0.0', '0.0.0')).to.be
              .true;
            expect(globalStateUpdateStub.called).to.be.false;
            expect(unlinkFileAsyncStub.called).to.be.false;
          });
        });

        context(`it gets moved`, function () {
          it(`if state version does NOT equal the default state version`, async function () {
            stateMock.version = '1.0.0';
            existsAsyncStub.resolves(true);
            parseJSONStub.returns(stateMock);
            globalStateUpdateStub.resolves();

            await settingsManager.moveStateFromLegacyPlace();

            expect(existsAsyncStub.calledOnce).to.be.true;
            expect(readFileAsyncStub.calledOnce).to.be.true;
            expect(semverSpy.calledOnceWithExactly(stateMock.version, '0.0.0'))
              .to.be.true;
            expect(
              globalStateUpdateStub.calledOnceWithExactly(
                constants.vsicons.name,
                stateMock,
              ),
            ).to.be.true;
            expect(unlinkFileAsyncStub.calledOnce).to.be.true;
          });
        });

        context(`an Error gets logged when`, function () {
          it(`reading the file fails`, async function () {
            existsAsyncStub.resolves(true);
            const error = new Error();
            readFileAsyncStub.rejects(error);
            globalStateUpdateStub.resolves();

            await settingsManager.moveStateFromLegacyPlace();

            expect(logErrorStub.calledOnceWithExactly(error, true)).to.be.true;
            expect(existsAsyncStub.calledOnce).to.be.true;
            expect(readFileAsyncStub.calledOnce).to.be.true;
            expect(semverSpy.calledOnceWithExactly('0.0.0', '0.0.0')).to.be
              .true;
            expect(globalStateUpdateStub.called).to.be.false;
            expect(unlinkFileAsyncStub.called).to.be.false;
          });

          it(`deleting the file fails`, async function () {
            stateMock.version = '1.0.0';
            existsAsyncStub.resolves(true);
            parseJSONStub.returns(stateMock);
            globalStateUpdateStub.resolves();

            const error = new Error();
            unlinkFileAsyncStub.rejects(error);

            await settingsManager.moveStateFromLegacyPlace();

            expect(existsAsyncStub.calledOnce).to.be.true;
            expect(readFileAsyncStub.calledOnce).to.be.true;
            expect(semverSpy.calledOnceWithExactly(stateMock.version, '0.0.0'))
              .to.be.true;
            expect(
              globalStateUpdateStub.calledOnceWithExactly(
                constants.vsicons.name,
                stateMock,
              ),
            ).to.be.true;
            expect(unlinkFileAsyncStub.calledOnceWithExactly(undefined)).to.be
              .true;
            expect(logErrorStub.calledOnceWithExactly(error)).to.be.true;
          });
        });
      });
    });

    it('the state gets set to the global state storage', async function () {
      globalStateUpdateStub.resolves();

      await settingsManager.setState(stateMock);

      expect(
        globalStateUpdateStub.calledOnceWithExactly(
          constants.vsicons.name,
          stateMock,
        ),
      ).to.be.true;
      expect(logErrorStub.called).to.be.false;
    });

    it('an Error gets logged when setting the state fails', async function () {
      const error = new Error();
      globalStateUpdateStub.rejects(error);

      await settingsManager.setState(stateMock);

      expect(
        globalStateUpdateStub.calledOnceWithExactly(
          constants.vsicons.name,
          stateMock,
        ),
      ).to.be.true;
      expect(logErrorStub.calledOnceWithExactly(error)).to.be.true;
    });

    it('the state status gets updated', async function () {
      globalStateGetStub.returns(stateMock);
      globalStateUpdateStub.resolves();

      const status = ExtensionStatus.activated;

      const state = await settingsManager.updateStatus(status);

      expect(globalStateGetStub.calledOnceWithExactly(constants.vsicons.name))
        .to.be.true;
      expect(
        globalStateUpdateStub.calledOnceWithExactly(
          constants.vsicons.name,
          stateMock,
        ),
      ).to.be.true;
      expect(state.status).to.be.equal(status);
    });

    it('the settings status does NOT get updated, if no status is provided', async function () {
      globalStateGetStub.returns(stateMock);
      globalStateUpdateStub.resolves();

      const state = await settingsManager.updateStatus();

      expect(globalStateGetStub.calledOnceWithExactly(constants.vsicons.name))
        .to.be.true;
      expect(
        globalStateUpdateStub.calledOnceWithExactly(
          constants.vsicons.name,
          stateMock,
        ),
      ).to.be.true;
      expect(state.version).to.be.equal(constants.extension.version);
      expect(state.status).to.be.equal(stateMock.status);
      expect(state.welcomeShown).to.be.true;
    });

    it('the state gets deleted', async function () {
      globalStateUpdateStub.resolves();

      await settingsManager.deleteState();

      expect(
        globalStateUpdateStub.calledOnceWithExactly(
          constants.vsicons.name,
          undefined,
        ),
      ).to.be.true;
    });

    it('an Error gets logged when deleting the state fails', async function () {
      const error = new Error();
      globalStateUpdateStub.rejects(error);

      await settingsManager.deleteState();

      expect(
        globalStateUpdateStub.calledOnceWithExactly(
          constants.vsicons.name,
          undefined,
        ),
      ).to.be.true;
      expect(logErrorStub.calledOnceWithExactly(error)).to.be.true;
    });

    context('getting the state from the global state storage', function () {
      it('returns the default state when no state exists', function () {
        globalStateGetStub.returns(undefined);

        const state = settingsManager.getState();

        expect(state).to.be.an('object');
        expect(Reflect.ownKeys(state)).to.have.lengthOf(3);
        expect(state).to.have.all.keys('version', 'status', 'welcomeShown');
        expect(state.version).to.be.equal('0.0.0');
        expect(globalStateGetStub.calledOnceWithExactly(constants.vsicons.name))
          .to.be.true;
      });

      it('returns the state', function () {
        stateMock.version = '1.0.0';
        globalStateGetStub.returns(stateMock);

        const state = settingsManager.getState();

        expect(state).to.be.instanceOf(Object);
        expect(Object.keys(state)).to.have.lengthOf(3);
        expect(state).to.have.all.keys('version', 'status', 'welcomeShown');
        expect(state.version).to.be.equal('1.0.0');
        expect(globalStateGetStub.calledOnceWithExactly(constants.vsicons.name))
          .to.be.true;
      });
    });

    context(`the 'isNewVersion' function is`, function () {
      it('truthy for a new extension version', function () {
        stateMock.version = '1.0.0';
        globalStateGetStub.returns(stateMock);

        expect(settingsManager.isNewVersion).to.be.true;
        expect(globalStateGetStub.calledOnceWithExactly(constants.vsicons.name))
          .to.be.true;
      });

      it('falsy for the same extension version', function () {
        stateMock.version = constants.extension.version;
        globalStateGetStub.returns(stateMock);

        expect(settingsManager.isNewVersion).to.be.false;
        expect(globalStateGetStub.calledOnceWithExactly(constants.vsicons.name))
          .to.be.true;
      });

      it('falsy for an older extension version', function () {
        stateMock.version = '100.0.0';
        globalStateGetStub.returns(stateMock);

        expect(settingsManager.isNewVersion).to.be.false;
        expect(globalStateGetStub.calledOnceWithExactly(constants.vsicons.name))
          .to.be.true;
      });
    });
  });
});
