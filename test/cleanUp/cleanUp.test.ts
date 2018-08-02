// tslint:disable only-arrow-functions
// tslint:disable no-unused-expression
import { expect } from 'chai';
import * as fs from 'fs';
import * as os from 'os';
import * as sinon from 'sinon';
import * as cleanUp from '../../src/cleanUp';
import * as utils from '../../src/utils';
import { constants } from '../../src/constants';

describe('CleanUp: tests', function() {
  context('ensures that', function() {
    let sandbox: sinon.SinonSandbox;
    let envStub: sinon.SinonStub;

    beforeEach(() => {
      sandbox = sinon.createSandbox();
      envStub = sandbox.stub(process, 'env');
    });

    afterEach(() => {
      sandbox.restore();
    });

    context(`function 'getAppUserPath' returns the correct path`, function() {
      context(
        'returns the correct path when the process platform is',
        function() {
          let appPath: string;
          let dirPath: string;
          let platformStub: sinon.SinonStub;

          beforeEach(() => {
            platformStub = sandbox.stub(process, 'platform');
          });

          context('*nix', function() {
            beforeEach(() => {
              appPath = '/var/local';
              dirPath = `${appPath}/%appDir%/extensions`;
              platformStub.value('free-bsd');
              envStub.value({
                VSCODE_CWD: '/VSCode/Path/Insiders/To/OSS/Installation/Dev/Dir',
              });
            });

            context(`and extension's installed directory is`, function() {
              it('in portable mode', function() {
                dirPath = dirPath.replace('%appDir%', 'data');
                const userPath = utils.pathUnixJoin(
                  process.env.VSCODE_CWD,
                  'data',
                  'user-data',
                  'User',
                );
                expect(process.platform).to.be.equal('free-bsd');
                expect(cleanUp.getAppUserPath(dirPath)).to.be.equal(userPath);
              });

              it(`'.vscode'`, function() {
                dirPath = dirPath.replace('%appDir%', '.vscode');
                const userPath = utils.pathUnixJoin(appPath, 'Code', 'User');
                expect(process.platform).to.be.equal('free-bsd');
                expect(cleanUp.getAppUserPath(dirPath)).to.be.equal(userPath);
              });

              it(`'.vscode-insiders'`, function() {
                dirPath = dirPath.replace('%appDir%', '.vscode-insiders');
                const userPath = utils.pathUnixJoin(
                  appPath,
                  'Code - Insiders',
                  'User',
                );
                expect(process.platform).to.be.equal('free-bsd');
                expect(cleanUp.getAppUserPath(dirPath)).to.be.equal(userPath);
              });

              it(`'.code-oss-dev'`, function() {
                dirPath = dirPath.replace('%appDir%', '.vscode-oss-dev');
                const userPath = utils.pathUnixJoin(
                  appPath,
                  'code-oss-dev',
                  'User',
                );
                expect(process.platform).to.be.equal('free-bsd');
                expect(cleanUp.getAppUserPath(dirPath)).to.be.equal(userPath);
              });

              it(`'.code-oss'`, function() {
                dirPath = dirPath.replace('%appDir%', '.vscode-oss');
                const userPath = utils.pathUnixJoin(
                  appPath,
                  'Code - OSS',
                  'User',
                );
                expect(process.platform).to.be.equal('free-bsd');
                expect(cleanUp.getAppUserPath(dirPath)).to.be.equal(userPath);
              });
            });
          });

          context('linux', function() {
            beforeEach(() => {
              sandbox.stub(os, 'homedir').returns('/home/user');
              appPath = `${os.homedir()}/.config`;
              dirPath = `${os.homedir()}/%appDir%/extensions`;
              platformStub.value('linux');
              envStub.value({
                VSCODE_CWD: '/VSCode/Path/Insiders/To/OSS/Installation/Dev/Dir',
              });
            });

            context(`and extension's installed directory is`, function() {
              it('in portable mode', function() {
                dirPath = dirPath.replace('%appDir%', 'data');
                const userPath = utils.pathUnixJoin(
                  process.env.VSCODE_CWD,
                  'data',
                  'user-data',
                  'User',
                );
                expect(process.platform).to.be.equal('linux');
                expect(cleanUp.getAppUserPath(dirPath)).to.be.equal(userPath);
              });

              it(`'.vscode'`, function() {
                dirPath = dirPath.replace('%appDir%', '.vscode');
                const userPath = utils.pathUnixJoin(appPath, 'Code', 'User');
                expect(process.platform).to.be.equal('linux');
                expect(cleanUp.getAppUserPath(dirPath)).to.be.equal(userPath);
              });

              it(`'.vscode-insiders'`, function() {
                dirPath = dirPath.replace('%appDir%', '.vscode-insiders');
                const userPath = utils.pathUnixJoin(
                  appPath,
                  'Code - Insiders',
                  'User',
                );
                expect(process.platform).to.be.equal('linux');
                expect(cleanUp.getAppUserPath(dirPath)).to.be.equal(userPath);
              });

              it(`'.code-oss-dev'`, function() {
                dirPath = dirPath.replace('%appDir%', '.vscode-oss-dev');
                const userPath = utils.pathUnixJoin(
                  appPath,
                  'code-oss-dev',
                  'User',
                );
                expect(process.platform).to.be.equal('linux');
                expect(cleanUp.getAppUserPath(dirPath)).to.be.equal(userPath);
              });

              it(`'.code-oss'`, function() {
                dirPath = dirPath.replace('%appDir%', '.vscode-oss');
                const userPath = utils.pathUnixJoin(
                  appPath,
                  'Code - OSS',
                  'User',
                );
                expect(process.platform).to.be.equal('linux');
                expect(cleanUp.getAppUserPath(dirPath)).to.be.equal(userPath);
              });
            });
          });

          context('darwin (macOS)', function() {
            beforeEach(() => {
              sandbox.stub(os, 'homedir').returns('/Users/User');
              appPath = `${os.homedir()}/Library/Application Support`;
              dirPath = `${os.homedir()}/%appDir%/extensions`;
              platformStub.value('darwin');
              envStub.value({
                VSCODE_CWD: '/VSCode/Path/Insiders/To/OSS/Installation/Dev/Dir',
              });
            });

            context(`and extension's installed directory is`, function() {
              context('in portable mode', function() {
                it(`of 'vscode'`, function() {
                  dirPath = dirPath.replace('%appDir%', 'data');
                  const userPath = utils.pathUnixJoin(
                    process.env.VSCODE_CWD,
                    'code-portable-data',
                    'user-data',
                    'User',
                  );
                  expect(process.platform).to.be.equal('darwin');
                  expect(cleanUp.getAppUserPath(dirPath)).to.be.equal(userPath);
                });

                it(`of 'vscode-insiders'`, function() {
                  sandbox.stub(process, 'env').value({
                    VSCODE_CWD:
                      '/VSCode/Path/Insiders/To/OSS/Portable/Dev/Installation/Dir',
                  });
                  sandbox.stub(fs, 'existsSync').returns(true);
                  dirPath = dirPath.replace('%appDir%', 'data');
                  const userPath = utils.pathUnixJoin(
                    process.env.VSCODE_CWD,
                    'code-insiders-portable-data',
                    'user-data',
                    'User',
                  );
                  expect(process.platform).to.be.equal('darwin');
                  expect(cleanUp.getAppUserPath(dirPath)).to.be.equal(userPath);
                });
              });

              it(`'.vscode'`, function() {
                dirPath = dirPath.replace('%appDir%', '.vscode');
                const userPath = utils.pathUnixJoin(appPath, 'Code', 'User');
                expect(process.platform).to.be.equal('darwin');
                expect(cleanUp.getAppUserPath(dirPath)).to.be.equal(userPath);
              });

              it(`'.vscode-insiders'`, function() {
                dirPath = dirPath.replace('%appDir%', '.vscode-insiders');
                const userPath = utils.pathUnixJoin(
                  appPath,
                  'Code - Insiders',
                  'User',
                );
                expect(process.platform).to.be.equal('darwin');
                expect(cleanUp.getAppUserPath(dirPath)).to.be.equal(userPath);
              });

              it(`'.code-oss-dev'`, function() {
                dirPath = dirPath.replace('%appDir%', '.vscode-oss-dev');
                const userPath = utils.pathUnixJoin(
                  appPath,
                  'code-oss-dev',
                  'User',
                );
                expect(process.platform).to.be.equal('darwin');
                expect(cleanUp.getAppUserPath(dirPath)).to.be.equal(userPath);
              });

              it(`'.code-oss'`, function() {
                dirPath = dirPath.replace('%appDir%', '.vscode-oss');
                const userPath = utils.pathUnixJoin(
                  appPath,
                  'Code - OSS',
                  'User',
                );
                expect(process.platform).to.be.equal('darwin');
                expect(cleanUp.getAppUserPath(dirPath)).to.be.equal(userPath);
              });
            });
          });

          context('win32 (windows)', function() {
            beforeEach(() => {
              dirPath = 'C:\\Users\\User\\%appDir%\\extensions';
              platformStub.value('win32');
              envStub.value({
                APPDATA: 'C:\\Users\\User\\AppData\\Roaming',
                VSCODE_CWD:
                  'D:\\VSCode\\Path\\Insiders\\To\\OSS\\Installation\\Dev\\Dir',
              });
            });

            context(`and extension's installed directory is`, function() {
              it('in portable mode', function() {
                dirPath = dirPath.replace('%appDir%', 'data');
                const userPath = utils.pathUnixJoin(
                  process.env.VSCODE_CWD,
                  'data',
                  'user-data',
                  'User',
                );
                expect(process.platform).to.be.equal('win32');
                expect(cleanUp.getAppUserPath(dirPath)).to.be.equal(userPath);
              });

              it(`'.vscode' `, function() {
                dirPath = dirPath.replace('%appDir%', '.vscode');
                const userPath = utils.pathUnixJoin(
                  process.env.APPDATA,
                  'Code',
                  'User',
                );
                expect(process.platform).to.be.equal('win32');
                expect(cleanUp.getAppUserPath(dirPath)).to.be.equal(userPath);
              });

              it(`'.vscode-insiders'`, function() {
                dirPath = dirPath.replace('%appDir%', '.vscode-insiders');
                const userPath = utils.pathUnixJoin(
                  process.env.APPDATA,
                  'Code - Insiders',
                  'User',
                );
                expect(process.platform).to.be.equal('win32');
                expect(cleanUp.getAppUserPath(dirPath)).to.be.equal(userPath);
              });

              it(`'.code-oss-dev'`, function() {
                dirPath = dirPath.replace('%appDir%', '.vscode-oss-dev');
                const userPath = utils.pathUnixJoin(
                  process.env.APPDATA,
                  'code-oss-dev',
                  'User',
                );
                expect(process.platform).to.be.equal('win32');
                expect(cleanUp.getAppUserPath(dirPath)).to.be.equal(userPath);
              });

              it(`'.code-oss'`, function() {
                dirPath = dirPath.replace('%appDir%', '.vscode-oss');
                const userPath = utils.pathUnixJoin(
                  process.env.APPDATA,
                  'Code - OSS',
                  'User',
                );
                expect(process.platform).to.be.equal('win32');
                expect(cleanUp.getAppUserPath(dirPath)).to.be.equal(userPath);
              });
            });
          });
        },
      );
    });

    context(`function 'cleanUpVSIconsSettings'`, function() {
      let unlinkStub: sinon.SinonStub;

      beforeEach(() => {
        unlinkStub = sandbox.stub(fs, 'unlink');
        envStub.value({
          VSCODE_CWD:
            '/VSCode/Path/Insiders/To/OSS/Portable/Dev/Installation/Dir',
        });
      });

      it(`deletes the 'vsicons' settings file`, function() {
        cleanUp.cleanUpVSIconsSettings();
        expect(unlinkStub.calledOnce).to.be.true;
      });

      it('log an Error message when deleting the file fails', function() {
        const consoleStub = sandbox.stub(console, 'error');
        unlinkStub.yields(new Error());
        cleanUp.cleanUpVSIconsSettings();
        expect(consoleStub.calledOnce).to.be.true;
      });
    });

    context(`function 'cleanUpVSCodeSettings'`, function() {
      let readFileStub: sinon.SinonStub;
      let writeFileStub: sinon.SinonStub;

      beforeEach(() => {
        readFileStub = sandbox.stub(fs, 'readFile');
        writeFileStub = sandbox.stub(fs, 'writeFile');
        envStub.value({
          VSCODE_CWD:
            '/VSCode/Path/Insiders/To/OSS/Portable/Dev/Installation/Dir',
        });
      });

      it(`reads the 'vscode' settings file`, function() {
        cleanUp.cleanUpVSCodeSettings();
        expect(readFileStub.calledOnce).to.be.true;
      });

      it(`writes the 'vscode' settings file`, function() {
        const content = '{ "vsicons.someProperty": true}';
        readFileStub.yields(null, content);
        cleanUp.cleanUpVSCodeSettings();
        expect(writeFileStub.calledOnce).to.be.true;
      });

      it('logs an Error message when reading the file fails', function() {
        const consoleStub = sandbox.stub(console, 'error');
        readFileStub.yields(new Error(), null);
        cleanUp.cleanUpVSCodeSettings();
        expect(consoleStub.calledOnce).to.be.true;
        expect(writeFileStub.called).to.be.false;
      });

      it('logs an Error message when writting the file fails', function() {
        const consoleStub = sandbox.stub(console, 'error');
        const content = '{"vsicons.someProperty": true}';
        readFileStub.yields(null, content);
        writeFileStub.yields(new Error());
        cleanUp.cleanUpVSCodeSettings();
        expect(consoleStub.calledOnce).to.be.true;
      });

      it('does not do anything when read file is not JSON', function() {
        const content = 'non JSON content';
        readFileStub.yields(null, content);
        cleanUp.cleanUpVSCodeSettings();
        expect(writeFileStub.calledOnce).to.be.false;
      });

      it('does not write the settings when there is no content', function() {
        const content = '';
        readFileStub.yields(null, content);
        cleanUp.cleanUpVSCodeSettings();
        expect(writeFileStub.calledOnce).to.be.false;
      });
    });

    context(`function 'resetThemeSetting'`, function() {
      let settings: any;

      beforeEach(() => {
        const content = `{"${constants.vscode.iconThemeSetting}": "${
          constants.extensionName
        }"}`;
        settings = JSON.parse(content);
      });

      it(`to reset the 'iconTheme' setting, if it was set to 'vscode-icons'`, function() {
        cleanUp.resetThemeSetting(settings);
        expect(settings[constants.vscode.iconThemeSetting]).to.be.undefined;
      });

      it(`to not reset the 'iconTheme' setting, if it's not set to 'vscode-icons'`, function() {
        settings[constants.vscode.iconThemeSetting] = 'someOtherTheme';
        cleanUp.resetThemeSetting(settings);
        expect(settings[constants.vscode.iconThemeSetting]).to.be.equal(
          'someOtherTheme',
        );
      });
    });

    context(`function 'removeVSIconsSettings'`, function() {
      let settings: any;

      beforeEach(() => {
        const content = `{"updateChannel": "none", "vsicons.dontShowNewVersionMessage": true}`;
        settings = JSON.parse(content);
      });

      it(`to remove only all 'vsicons' settings`, function() {
        cleanUp.removeVSIconsSettings(settings);
        expect(settings).to.eql({ updateChannel: 'none' });
      });
    });
  });
});
