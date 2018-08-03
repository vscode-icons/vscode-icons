// tslint:disable only-arrow-functions
// tslint:disable no-unused-expression
import { expect } from 'chai';
import * as fs from 'fs';
import * as sinon from 'sinon';
import { vscode } from '../../src/utils';
import { extensionSettings, SettingsManager } from '../../src/settings';
import { ExtensionStatus, IState } from '../../src/models';
import { ErrorHandler } from '../../src/errorHandler';

describe('SettingsManager: tests', function() {
  context('ensures that', function() {
    context('getting the settings', function() {
      it('more than once, returns the same instance', function() {
        const settingsManager = new SettingsManager(vscode);
        const settings = settingsManager.getSettings();
        const settingsAgain = settingsManager.getSettings();
        expect(settings).to.be.an.instanceOf(Object);
        expect(settingsAgain).to.be.an.instanceOf(Object);
        expect(settingsAgain).to.be.deep.equal(settings);
      });

      it('detects correctly if it is in portable mode', function() {
        const sandbox = sinon
          .createSandbox()
          .stub(process, 'env')
          .value({ VSCODE_PORTABLE: '/PathToPortableInstallationDir/data' });
        const settings = new SettingsManager(vscode).getSettings();
        expect(settings.vscodeAppUserPath).to.match(/user-data/);
        sandbox.restore();
      });

      context('returns the correct name when application is the', function() {
        it(`'Code - Insiders'`, function() {
          vscode.env.appName = 'Visual Studio Code - Insiders';
          const settings = new SettingsManager(vscode).getSettings();
          expect(settings.isInsiders).to.be.true;
          expect(settings.isOSS).to.be.false;
          expect(settings.isDev).to.be.false;
        });

        it(`'Code'`, function() {
          vscode.env.appName = 'Visual Studio Code';
          const settings = new SettingsManager(vscode).getSettings();
          expect(settings.isInsiders).to.be.false;
          expect(settings.isOSS).to.be.false;
          expect(settings.isDev).to.be.false;
        });

        it(`'Code - OSS'`, function() {
          vscode.env.appName = 'VSCode OSS';
          const settings = new SettingsManager(vscode).getSettings();
          expect(settings.isInsiders).to.be.false;
          expect(settings.isOSS).to.be.true;
          expect(settings.isDev).to.be.false;
        });

        it(`'Code - OSS Dev'`, function() {
          vscode.env.appName = 'VSCode OSS Dev';
          const settings = new SettingsManager(vscode).getSettings();
          expect(settings.isInsiders).to.be.false;
          expect(settings.isOSS).to.be.false;
          expect(settings.isDev).to.be.true;
        });
      });
    });

    context(`function 'getWorkspacePath returns`, function() {
      it(`the workspace root path when 'workspaceFolders' is not supported`, function() {
        vscode.workspace.workspaceFolders = undefined;
        vscode.workspace.rootPath = '/path/to/workspace/root';
        const result = new SettingsManager(vscode).getWorkspacePath();
        expect(result)
          .to.be.an('array')
          .with.members([vscode.workspace.rootPath]);
      });

      it(`the workspace folders when 'workspaceFolders' is supported`, function() {
        const paths = [
          '/path/to/workspace/folder1/root',
          '/path/to/workspace/folder2/root',
        ];
        const workspaceFolder: any = { uri: { fsPath: paths[0] } };
        const workspaceFolder1: any = { uri: { fsPath: paths[1] } };
        vscode.workspace.workspaceFolders = [workspaceFolder, workspaceFolder1];
        const result = new SettingsManager(vscode).getWorkspacePath();
        expect(result)
          .to.be.an('array')
          .with.members(paths);
      });

      it(`'undefined' when 'workspaceFolders' and 'rootPath' is undefined`, function() {
        vscode.workspace.workspaceFolders = undefined;
        vscode.workspace.rootPath = undefined;
        const result = new SettingsManager(vscode).getWorkspacePath();
        expect(result).to.be.undefined;
      });
    });
  });

  context('ensures that', function() {
    let settingsManager: SettingsManager;
    let sandbox: sinon.SinonSandbox;

    beforeEach(() => {
      settingsManager = new SettingsManager(vscode);
      sandbox = sinon.createSandbox();
    });

    afterEach(() => {
      settingsManager = null;
      sandbox.restore();
    });

    it('the Error gets logged when writting the state fails', function() {
      const writeToFile = sandbox.stub(fs, 'writeFileSync').throws();
      const logStub = sandbox.stub(ErrorHandler, 'logError');
      const stateMock: IState = {
        version: '0.0.0',
        status: ExtensionStatus.notActivated,
        welcomeShown: false,
      };
      settingsManager.setState(stateMock);
      expect(logStub.called).to.be.true;
      expect(writeToFile.called).to.be.true;
    });

    it('the state gets written to a settings file', function() {
      const writeToFile = sandbox.stub(fs, 'writeFileSync');
      const stateMock: IState = {
        version: '0.0.0',
        status: ExtensionStatus.notActivated,
        welcomeShown: false,
      };
      settingsManager.setState(stateMock);
      expect(writeToFile.called).to.be.true;
    });

    it('the settings status gets updated', function() {
      const stateMock: IState = {
        version: '1.0.0',
        status: ExtensionStatus.notActivated,
        welcomeShown: false,
      };
      const getState = sinon
        .stub(settingsManager, 'getState')
        .returns(stateMock);
      const setState = sinon.stub(settingsManager, 'setState');
      const status = ExtensionStatus.enabled;
      const state = settingsManager.updateStatus(status);
      expect(getState.called).to.be.true;
      expect(setState.called).to.be.true;
      expect(state.status).to.be.equal(status);
    });

    it('the settings status does not get updated if no status is provided', function() {
      const stateMock: IState = {
        version: extensionSettings.version,
        status: ExtensionStatus.notActivated,
        welcomeShown: false,
      };
      const getState = sinon
        .stub(settingsManager, 'getState')
        .returns(stateMock);
      const setState = sinon.stub(settingsManager, 'setState');
      const state = settingsManager.updateStatus();
      expect(getState.called).to.be.true;
      expect(setState.called).to.be.true;
      expect(state.version).to.be.equal(stateMock.version);
      expect(state.status).to.be.equal(stateMock.status);
      expect(state.welcomeShown).to.be.true;
    });

    it('the settings file gets deleted', function() {
      const deleteFile = sandbox.stub(fs, 'unlinkSync');
      settingsManager.deleteState();
      expect(deleteFile.called).to.be.true;
    });

    context('getting the state', function() {
      it('returns the state from the settings file', function() {
        const stateMock: IState = {
          version: '1.0.0',
          status: ExtensionStatus.enabled,
          welcomeShown: true,
        };
        sandbox.stub(fs, 'existsSync').returns(true);
        sandbox.stub(fs, 'readFileSync').returns(JSON.stringify(stateMock));
        const state = settingsManager.getState();
        expect(state).to.be.an.instanceOf(Object);
        expect(state).to.have.all.keys('version', 'status', 'welcomeShown');
        expect(Object.keys(state)).to.have.lengthOf(3);
      });

      context('returns a default state when', function() {
        it('no settings file exists', function() {
          sandbox.stub(fs, 'existsSync').returns(false);
          const state = settingsManager.getState();
          expect(state).to.be.instanceOf(Object);
          expect(state.version).to.be.equal('0.0.0');
        });

        it('reading the file fails', function() {
          sandbox.stub(fs, 'existsSync').returns(true);
          sandbox.stub(fs, 'readFileSync').throws(Error);
          sandbox.stub(console, 'error');
          const state = settingsManager.getState();
          expect(state).to.be.instanceOf(Object);
          expect(state.version).to.be.equal('0.0.0');
        });

        it('parsing the file content fails', function() {
          sandbox.stub(fs, 'existsSync').returns(true);
          sandbox.stub(fs, 'readFileSync').returns('test');
          const state = settingsManager.getState();
          expect(state).to.be.instanceOf(Object);
          expect(state.version).to.be.equal('0.0.0');
        });
      });
    });

    context(`the 'isNewVersion' function is`, function() {
      it('truthy for a new extension version', function() {
        const stateMock: IState = {
          version: '1.0.0',
          status: ExtensionStatus.notActivated,
          welcomeShown: true,
        };
        const getState = sinon
          .stub(settingsManager, 'getState')
          .returns(stateMock);
        settingsManager.getSettings();
        expect(settingsManager.isNewVersion()).to.be.true;
        expect(getState.called).to.be.true;
      });

      it('falsy for the same extension version', function() {
        const stateMock: IState = {
          version: extensionSettings.version,
          status: ExtensionStatus.notActivated,
          welcomeShown: true,
        };
        const getState = sinon
          .stub(settingsManager, 'getState')
          .returns(stateMock);
        settingsManager.getSettings();
        expect(settingsManager.isNewVersion()).to.be.false;
        expect(getState.called).to.be.true;
      });

      it('falsy for an older extension version', function() {
        const stateMock: IState = {
          version: '100.0.0',
          status: ExtensionStatus.notActivated,
          welcomeShown: true,
        };
        const getState = sinon
          .stub(settingsManager, 'getState')
          .returns(stateMock);
        settingsManager.getSettings();
        expect(settingsManager.isNewVersion()).to.be.false;
        expect(getState.called).to.be.true;
      });
    });
  });
});
