// tslint:disable only-arrow-functions
// tslint:disable no-unused-expression
import { expect } from 'chai';
import * as sinon from 'sinon';
import * as fs from 'fs';
import * as semver from 'semver';
import { VSCodeManager } from '../../src/vscode/vscodeManager';
import { SettingsManager } from '../../src/settings/settingsManager';
import {
  ExtensionStatus,
  IState,
  ISettingsManager,
  IVSCodeManager,
} from '../../src/models';
import { Utils } from '../../src/utils';
import { ErrorHandler } from '../../src/errorHandler';
import { constants } from '../../src/constants';

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

      vscodeManagerStub = sandbox.createStubInstance<IVSCodeManager>(
        VSCodeManager
      );

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
      parseJSONStub = sandbox.stub(Utils, 'parseJSON');
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

    context(`moving the state from its legacy place`, function () {
      let existsStub: sinon.SinonStub;
      let readFileStub: sinon.SinonStub;
      let unlinkFileStub: sinon.SinonStub;
      let semverSpy: sinon.SinonSpy;

      beforeEach(function () {
        existsStub = sandbox.stub(fs, 'existsSync');
        readFileStub = sandbox.stub(fs, 'readFileSync');
        unlinkFileStub = sandbox.stub(fs, 'unlinkSync');
        vscodeManagerStub.getAppUserDirPath.returns('');
      });

      it(`when the file is NOT found, no moving happens`, function () {
        existsStub.returns(false);
        globalStateUpdateStub.resolves();

        return settingsManager.moveStateFromLegacyPlace().then(() => {
          expect(existsStub.calledOnce).to.be.true;
          expect(readFileStub.called).to.be.false;
          expect(globalStateUpdateStub.called).to.be.false;
          expect(unlinkFileStub.called).to.be.false;
        });
      });

      context(`when the file is found`, function () {
        beforeEach(function () {
          semverSpy = sandbox.spy(semver, 'eq');
        });

        context(`it gets not moved`, function () {
          it(`if state version equals the default state version`, function () {
            existsStub.returns(true);
            readFileStub.returns(JSON.stringify(stateMock));
            globalStateUpdateStub.resolves();

            return settingsManager.moveStateFromLegacyPlace().then(() => {
              expect(existsStub.calledOnce).to.be.true;
              expect(readFileStub.calledOnce).to.be.true;
              expect(semverSpy.calledOnceWithExactly('0.0.0', '0.0.0')).to.be.true;
              expect(globalStateUpdateStub.called).to.be.false;
              expect(unlinkFileStub.called).to.be.false;
            });
          });

          it(`if parsing the state fails`, function () {
            existsStub.returns(true);
            readFileStub.returns('sometext');
            globalStateUpdateStub.resolves();

            return settingsManager.moveStateFromLegacyPlace().then(() => {
              expect(existsStub.calledOnce).to.be.true;
              expect(readFileStub.calledOnce).to.be.true;
              expect(semverSpy.calledOnceWithExactly('0.0.0', '0.0.0')).to.be.true;
              expect(globalStateUpdateStub.called).to.be.false;
              expect(unlinkFileStub.called).to.be.false;
            });
          });
        });

        context(`it gets moved`, function () {
          it(`if state version does NOT equal the default state version`, function () {
            stateMock.version = '1.0.0';
            existsStub.returns(true);
            parseJSONStub.returns(stateMock);
            globalStateUpdateStub.resolves();

            return settingsManager.moveStateFromLegacyPlace().then(() => {
              expect(existsStub.calledOnce).to.be.true;
              expect(readFileStub.calledOnce).to.be.true;
              expect(semverSpy.calledOnceWithExactly(stateMock.version, '0.0.0')).to.be.true;
              expect(
                globalStateUpdateStub.calledOnceWithExactly(
                  constants.vsicons.name,
                  stateMock
                )
              ).to.be.true;
              expect(unlinkFileStub.calledOnce).to.be.true;
            });
          });
        });

        context(`an Error gets logged when`, function () {
          it(`reading the file fails`, function () {
            existsStub.returns(true);
            const error = new Error();
            readFileStub.throws(error);
            globalStateUpdateStub.resolves();

            return settingsManager.moveStateFromLegacyPlace().then(() => {
              expect(logErrorStub.calledOnceWithExactly(error, true)).to.be
                .true;
              expect(existsStub.calledOnce).to.be.true;
              expect(readFileStub.calledOnce).to.be.true;
              expect(semverSpy.calledOnceWithExactly('0.0.0', '0.0.0')).to.be.true;
              expect(globalStateUpdateStub.called).to.be.false;
              expect(unlinkFileStub.called).to.be.false;
            });
          });

          it(`deleting the file fails`, function () {
            stateMock.version = '1.0.0';
            existsStub.returns(true);
            parseJSONStub.returns(stateMock);
            globalStateUpdateStub.resolves();

            const error = new Error();
            unlinkFileStub.throws(error);

            return settingsManager.moveStateFromLegacyPlace().then(() => {
              expect(existsStub.calledOnce).to.be.true;
              expect(readFileStub.calledOnce).to.be.true;
              expect(semverSpy.calledOnceWithExactly(stateMock.version, '0.0.0')).to.be.true;
              expect(
                globalStateUpdateStub.calledOnceWithExactly(
                  constants.vsicons.name,
                  stateMock
                )
              ).to.be.true;
              expect(unlinkFileStub.calledOnceWithExactly(undefined)).to.be
                .true;
              expect(logErrorStub.calledOnceWithExactly(error)).to.be.true;
            });
          });
        });
      });
    });

    it('the state gets set to the global state storage', function () {
      globalStateUpdateStub.resolves();

      return settingsManager.setState(stateMock).then(() => {
        expect(
          globalStateUpdateStub.calledOnceWithExactly(
            constants.vsicons.name,
            stateMock
          )
        ).to.be.true;
        expect(logErrorStub.called).to.be.false;
      });
    });

    it('an Error gets logged when setting the state fails', function () {
      const error = new Error();
      globalStateUpdateStub.rejects(error);

      return settingsManager.setState(stateMock).then(() => {
        expect(
          globalStateUpdateStub.calledOnceWithExactly(
            constants.vsicons.name,
            stateMock
          )
        ).to.be.true;
        expect(logErrorStub.calledOnceWithExactly(error)).to.be.true;
      });
    });

    it('the state status gets updated', function () {
      globalStateGetStub.returns(stateMock);
      globalStateUpdateStub.resolves();

      const status = ExtensionStatus.activated;
      const state = settingsManager.updateStatus(status);

      expect(
        globalStateGetStub.calledOnceWithExactly(constants.vsicons.name)
      ).to.be.true;
      expect(
        globalStateUpdateStub.calledOnceWithExactly(
          constants.vsicons.name,
          stateMock
        )
      ).to.be.true;
      expect(state.status).to.be.equal(status);
    });

    it('the settings status does NOT get updated, if no status is provided', function () {
      globalStateGetStub.returns(stateMock);
      globalStateUpdateStub.resolves();

      const state = settingsManager.updateStatus();

      expect(
        globalStateGetStub.calledOnceWithExactly(constants.vsicons.name)
      ).to.be.true;
      expect(
        globalStateUpdateStub.calledOnceWithExactly(
          constants.vsicons.name,
          stateMock
        )
      ).to.be.true;
      expect(state.version).to.be.equal(constants.extension.version);
      expect(state.status).to.be.equal(stateMock.status);
      expect(state.welcomeShown).to.be.true;
    });

    it('the state gets deleted', function () {
      globalStateUpdateStub.resolves();

      settingsManager.deleteState();

      expect(
        globalStateUpdateStub.calledOnceWithExactly(
          constants.vsicons.name,
          undefined
        )
      ).to.be.true;
    });

    it('an Error gets logged when deleting the state fails', function () {
      const error = new Error();
      globalStateUpdateStub.rejects(error);

      return settingsManager.deleteState().then(() => {
        expect(
          globalStateUpdateStub.calledOnceWithExactly(
            constants.vsicons.name,
            undefined
          )
        ).to.be.true;
        expect(logErrorStub.calledOnceWithExactly(error)).to.be.true;
      });
    });

    context('getting the state from the global state storage', function () {
      it('returns the default state when no state exists', function () {
        globalStateGetStub.returns(undefined);

        const state = settingsManager.getState();

        expect(state).to.be.an('object');
        expect(Reflect.ownKeys(state)).to.have.lengthOf(3);
        expect(state).to.have.all.keys('version', 'status', 'welcomeShown');
        expect(state.version).to.be.equal('0.0.0');
        expect(
          globalStateGetStub.calledOnceWithExactly(constants.vsicons.name)
        ).to.be.true;
      });

      it('returns the state', function () {
        stateMock.version = '1.0.0';
        globalStateGetStub.returns(stateMock);

        const state = settingsManager.getState();

        expect(state).to.be.instanceOf(Object);
        expect(Object.keys(state)).to.have.lengthOf(3);
        expect(state).to.have.all.keys('version', 'status', 'welcomeShown');
        expect(state.version).to.be.equal('1.0.0');
        expect(
          globalStateGetStub.calledOnceWithExactly(constants.vsicons.name)
        ).to.be.true;
      });
    });

    context(`the 'isNewVersion' function is`, function () {
      it('truthy for a new extension version', function () {
        stateMock.version = '1.0.0';
        globalStateGetStub.returns(stateMock);

        expect(settingsManager.isNewVersion).to.be.true;
        expect(
          globalStateGetStub.calledOnceWithExactly(constants.vsicons.name)
        ).to.be.true;
      });

      it('falsy for the same extension version', function () {
        stateMock.version = constants.extension.version;
        globalStateGetStub.returns(stateMock);

        expect(settingsManager.isNewVersion).to.be.false;
        expect(
          globalStateGetStub.calledOnceWithExactly(constants.vsicons.name)
        ).to.be.true;
      });

      it('falsy for an older extension version', function () {
        stateMock.version = '100.0.0';
        globalStateGetStub.returns(stateMock);

        expect(settingsManager.isNewVersion).to.be.false;
        expect(
          globalStateGetStub.calledOnceWithExactly(constants.vsicons.name)
        ).to.be.true;
      });
    });
  });
});
