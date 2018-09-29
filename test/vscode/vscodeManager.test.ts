// tslint:disable only-arrow-functions
// tslint:disable no-unused-expression
import { expect } from 'chai';
import * as sinon from 'sinon';
import { VSCodeManager } from '../../src/vscode/vscodeManager';
import { IVSCodeManager } from '../../src/models';
import { Utils } from '../../src/utils';
import { vscode } from '../fixtures/vscode';
import { context as extensionContext } from '../fixtures/extensionContext';

describe('VSCodeManager: tests', function () {
  context('ensures that', function () {
    let sandbox: sinon.SinonSandbox;
    let vscodeManager: IVSCodeManager;

    beforeEach(function () {
      sandbox = sinon.createSandbox();

      vscodeManager = new VSCodeManager(vscode, extensionContext);
    });

    afterEach(function () {
      vscodeManager = null;

      sandbox.restore();
    });

    it(`an Error gets thrown, when 'vscode' is NOT instantiated`, function () {
      expect(() => new VSCodeManager(null, extensionContext)).to.throw(
        Error,
        /'vscode' not set to an instance/
      );
    });

    it(`an Error gets thrown, when 'context' is NOT instantiated`, function () {
      expect(() => new VSCodeManager(vscode, null)).to.throw(
        Error,
        /'extensionContext' not set to an instance/
      );
    });

    it(`function 'context' returns the 'vscode extensionContext' object`, function () {
      expect(vscodeManager.context).to.equal(extensionContext);
    });

    it(`function 'env' returns the 'vscode env' object`, function () {
      expect(vscodeManager.env).to.equal(vscode.env);
    });

    it(`function 'commands' returns the 'vscode commands' object`, function () {
      expect(vscodeManager.commands).to.equal(vscode.commands);
    });

    it(`function 'version' returns the 'vscode version' object`, function () {
      expect(vscodeManager.version).to.equal(vscode.version);
    });

    it(`function 'window' returns the 'vscode window' object`, function () {
      expect(vscodeManager.window).to.equal(vscode.window);
    });

    it(`function 'workspace' returns the 'vscode workspace' object`, function () {
      expect(vscodeManager.workspace).to.equal(vscode.workspace);
    });

    context(`function 'getWorkspacePaths'`, function () {
      it(`returns an empty array, when no 'workspaceFolders' and no 'rootPath'`, function () {
        vscodeManager.workspace.rootPath = undefined;
        vscodeManager.workspace.workspaceFolders = undefined;

        expect(vscodeManager.getWorkspacePaths()).to.eql([]);
      });

      it(`returns the 'rootPath' as an array, when 'workspaceFolders' is an empty array`, function () {
        vscodeManager.workspace.rootPath = '/path/to/workspace/root';
        vscodeManager.workspace.workspaceFolders = [];

        expect(vscodeManager.getWorkspacePaths()).to.eql([
          vscodeManager.workspace.rootPath,
        ]);
      });

      it(`returns the 'workspaceFolders' as an array of paths`, function () {
        const paths = [
          '/path/to/workspace/folder1/root',
          '/path/to/workspace/folder2/root',
        ];
        const workspaceFolder: any = { uri: { fsPath: paths[0] } };
        const workspaceFolder1: any = { uri: { fsPath: paths[1] } };
        vscodeManager.workspace.rootPath = '/path/to/workspace/root';
        vscodeManager.workspace.workspaceFolders = [
          workspaceFolder,
          workspaceFolder1,
        ];

        expect(vscodeManager.getWorkspacePaths()).to.eql(paths);
      });
    });

    context(`function 'getAppUserDirPath'`, function () {
      let pathUnixJoinStub: sinon.SinonStub;

      beforeEach(function () {
        pathUnixJoinStub = sandbox.stub(Utils, 'pathUnixJoin');
        sandbox
          .stub(Utils, 'getAppDataDirPath')
          .returns('path/to/app/data/dir/');
      });

      context(`'when getting it more than once`, function () {
        it('returns the same path', function () {
          pathUnixJoinStub.returns('path/to/app/user/dir/');
          const path = vscodeManager.getAppUserDirPath();
          const pathAgain = vscodeManager.getAppUserDirPath();

          expect(path).to.be.a('string');
          expect(pathAgain).to.be.a('string');
          expect(pathAgain).to.be.deep.equal(path);
        });
      });

      it('detects correctly if it is in portable mode', function () {
        sandbox.stub(process, 'env').value({
          VSCODE_PORTABLE: '/Path/To/Portable/Installation/Dir/data',
        });
        pathUnixJoinStub.returns(
          `${process.env.VSCODE_PORTABLE}/user-data/User`
        );

        expect(vscodeManager.getAppUserDirPath()).to.equal(
          `${process.env.VSCODE_PORTABLE}/user-data/User`
        );
      });

      context('returns the correct path when application name is', function () {
        it(`'Code'`, function () {
          vscodeManager.env.appName = 'Visual Studio Code';
          pathUnixJoinStub.returns(`${Utils.getAppDataDirPath()}/Code/User`);

          expect(vscodeManager.getAppUserDirPath()).to.equal(
            `${Utils.getAppDataDirPath()}/Code/User`
          );
        });

        it(`'Code - Insiders'`, function () {
          vscodeManager.env.appName = 'Visual Studio Code - Insiders';
          pathUnixJoinStub.returns(
            `${Utils.getAppDataDirPath()}/Code - Insiders/User`
          );

          expect(vscodeManager.getAppUserDirPath()).to.equal(
            `${Utils.getAppDataDirPath()}/Code - Insiders/User`
          );
        });

        it(`'Code - OSS'`, function () {
          vscodeManager.env.appName = 'VSCode OSS';
          pathUnixJoinStub.returns(
            `${Utils.getAppDataDirPath()}/Code - OSS/User`
          );

          expect(vscodeManager.getAppUserDirPath()).to.equal(
            `${Utils.getAppDataDirPath()}/Code - OSS/User`
          );
        });

        it(`'Code - OSS - Dev'`, function () {
          vscodeManager.env.appName = 'VSCode OSS Dev';
          pathUnixJoinStub.returns(
            `${Utils.getAppDataDirPath()}/code-oss-dev/User`
          );

          expect(vscodeManager.getAppUserDirPath()).to.equal(
            `${Utils.getAppDataDirPath()}/code-oss-dev/User`
          );
        });
      });
    });
  });
});
