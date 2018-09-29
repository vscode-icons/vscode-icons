// tslint:disable only-arrow-functions
// tslint:disable no-unused-expression
import { expect } from 'chai';
import * as sinon from 'sinon';
import { cloneDeep } from 'lodash';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import {
  IVSCodeManager,
  IConfigManager,
  IVSIcons,
  ConfigurationTarget,
  PresetNames,
} from '../../src/models';
import { constants } from '../../src/constants';
import { Utils } from '../../src/utils';
import { ErrorHandler } from '../../src/errorHandler';
import { ConfigManager } from '../../src/configuration/configManager';
import { VSCodeManager } from '../../src/vscode/vscodeManager';
import { vsicons } from '../fixtures/vsicons';

describe('ConfigManager: tests', function () {
  context('ensures that', function () {
    let sandbox: sinon.SinonSandbox;
    let vscodeManagerStub: sinon.SinonStubbedInstance<IVSCodeManager>;
    let envStub: sinon.SinonStub;
    let updateFileStub: sinon.SinonStub;
    let logErrorStub: sinon.SinonStub;
    let dirnameStub: sinon.SinonStub;
    let getStub: sinon.SinonStub;
    let getConfigurationStub: sinon.SinonStub;
    let inspectStub: sinon.SinonStub;
    let updateStub: sinon.SinonStub;
    let pathUnixJoinStub: sinon.SinonStub;
    let vsiconsClone: IVSIcons;
    let configManager: IConfigManager;
    let splitter: (content: string) => string[];

    beforeEach(() => {
      sandbox = sinon.createSandbox();

      envStub = sandbox.stub(process, 'env');
      logErrorStub = sandbox.stub(ErrorHandler, 'logError');
      updateFileStub = sandbox.stub(Utils, 'updateFile');
      pathUnixJoinStub = sandbox.stub(Utils, 'pathUnixJoin');
      sandbox.stub(Utils, 'getAppDataDirPath');

      // This is an effective way to stub '__dirname'
      // but requires that the code uses `path.dirname(__filename)` instead
      dirnameStub = sandbox.stub(path, 'dirname');

      envStub.value({
        VSCODE_CWD: '/VSCode/Path/Insiders/To/OSS/Installation/Dev/Dir',
      });

      vscodeManagerStub = sandbox.createStubInstance<IVSCodeManager>(
        VSCodeManager
      );

      getStub = sandbox.stub();
      inspectStub = sandbox.stub().returns({
        globalValue: undefined,
        workspaceValue: undefined,
      });
      updateStub = sandbox.stub().resolves();
      vsiconsClone = cloneDeep(vsicons);
      getConfigurationStub = sandbox.stub().returns({
        vsicons: vsiconsClone,
        get: getStub,
        inspect: inspectStub,
        update: updateStub,
      });
      sandbox.stub(vscodeManagerStub, 'workspace').get(() => ({
        getConfiguration: getConfigurationStub,
      }));

      configManager = new ConfigManager(vscodeManagerStub);

      splitter = (content: string) => content.split('\n');
    });

    afterEach(function () {
      vsiconsClone = null;
      configManager = null;
      sandbox.restore();
    });

    context(`function 'vsicons'`, function () {
      const fixture1 = {
        icon: 'js',
        extensions: ['myExt1', 'myExt2.custom.js'],
        format: 'svg',
      };
      const fixture2 = {
        icon: 'js2',
        extensions: ['myExt1', 'myExt2.custom.js'],
        format: 'svg',
      };
      const fixture3 = {
        icon: 'js',
        extensions: ['myExt', 'myExt2.custom.js'],
        format: 'svg',
      };

      context(`returns for files:`, function () {
        it(`the 'globalValue', if no 'workspaceValue' present`, function () {
          inspectStub.onThirdCall().returns({
            globalValue: [fixture1],
          });

          vsiconsClone.associations.files = [fixture1];
          // make 'readonly' as 'vscode' config objects are immutable
          Object.freeze(vsiconsClone.associations);

          expect(configManager.vsicons).to.eqls(vsiconsClone);
        });

        it(`the 'globalValue', if 'workspaceValue' is an empty array`, function () {
          inspectStub.onThirdCall().returns({
            globalValue: [fixture1],
            workspaceValue: [],
          });

          vsiconsClone.associations.files = [fixture1];
          // make 'readonly' as 'vscode' config objects are immutable
          Object.freeze(vsiconsClone.associations);

          expect(configManager.vsicons).to.eqls(vsiconsClone);
        });

        it(`both 'workspaceValue' and 'globalValue' settings`, function () {
          inspectStub.onThirdCall().returns({
            globalValue: [fixture2],
            workspaceValue: [fixture1],
          });

          vsiconsClone.associations.files = [fixture1, fixture2];
          // make 'readonly' as 'vscode' config objects are immutable
          Object.freeze(vsiconsClone.associations);

          expect(configManager.vsicons).to.eqls(vsiconsClone);
        });

        it(`both 'workspaceValue' and 'globalValue' settings, removing duplicates`, function () {
          inspectStub.onThirdCall().returns({
            globalValue: [fixture3],
            workspaceValue: [fixture2, fixture3],
          });

          vsiconsClone.associations.files = [fixture2, fixture3];
          // make 'readonly' as 'vscode' config objects are immutable
          Object.freeze(vsiconsClone.associations);

          expect(configManager.vsicons).to.eql(vsiconsClone);
        });
      });

      context(`returns for folders:`, function () {
        it(`the 'globalValue', if no 'workspaceValue' present`, function () {
          inspectStub.onCall(3).returns({
            globalValue: [fixture1],
          });

          vsiconsClone.associations.folders = [fixture1];
          // make 'readonly' as 'vscode' config objects are immutable
          Object.freeze(vsiconsClone.associations);

          expect(configManager.vsicons).to.eqls(vsiconsClone);
        });

        it(`the 'globalValue', if 'workspaceValue' is an empty array`, function () {
          inspectStub.onCall(3).returns({
            globalValue: [fixture1],
            workspaceValue: [],
          });

          vsiconsClone.associations.folders = [fixture1];
          // make 'readonly' as 'vscode' config objects are immutable
          Object.freeze(vsiconsClone.associations);

          expect(configManager.vsicons).to.eqls(vsiconsClone);
        });

        it(`both 'workspaceValue' and 'globalValue' settings`, function () {
          inspectStub.onCall(3).returns({
            globalValue: [fixture2],
            workspaceValue: [fixture1],
          });

          vsiconsClone.associations.folders = [fixture1, fixture2];
          // make 'readonly' as 'vscode' config objects are immutable
          Object.freeze(vsiconsClone.associations);

          expect(configManager.vsicons).to.eqls(vsiconsClone);
        });

        it(`both 'workspaceValue' and 'globalValue' settings, removing duplicates`, function () {
          inspectStub.onCall(3).returns({
            globalValue: [fixture3],
            workspaceValue: [fixture2, fixture3],
          });

          vsiconsClone.associations.folders = [fixture2, fixture3];
          // make 'readonly' as 'vscode' config objects are immutable
          Object.freeze(vsiconsClone.associations);

          expect(configManager.vsicons).to.eqls(vsiconsClone);
        });
      });
    });

    context(`function 'removeSettings'`, function () {
      it(`updates the 'vscode' settings file`, function () {
        updateFileStub.callsArgWith(1, ['']).resolves();

        return ConfigManager.removeSettings().then(
          () => expect(updateFileStub.calledOnce).to.be.true
        );
      });

      it('logs an Error message when updating the file fails', function () {
        const error = new Error();
        updateFileStub.rejects(error);

        return ConfigManager.removeSettings().then(() => {
          expect(logErrorStub.calledOnceWithExactly(error)).to.be.true;
        });
      });
    });

    context(`function 'getAppUserPath'`, function () {
      context('returns the correct path', function () {
        context('when the process platform is', function () {
          let appPath: string;
          let dirPath: string;
          let platformStub: sinon.SinonStub;

          beforeEach(() => {
            platformStub = sandbox.stub(process, 'platform');
            updateFileStub.callsArgWith(1, ['']).resolves();
          });

          context('*nix', function () {
            beforeEach(() => {
              appPath = '/var/local';
              dirPath = `${appPath}/%appDir%/extensions`;
              platformStub.value('freebsd');
            });

            context(`and extension's installed directory is`, function () {
              it('in portable mode', function () {
                const userPath = `${
                  process.env.VSCODE_CWD
                }/data/user-data/User`;
                const expected = new RegExp(`^${userPath}`);
                pathUnixJoinStub.returns(userPath);
                dirnameStub.returns(dirPath.replace('%appDir%', 'data'));

                return ConfigManager.removeSettings().then(() => {
                  expect(process.platform).to.equal('freebsd');
                  expect(updateFileStub.firstCall.args[0]).to.match(expected);
                });
              });

              it(`'.vscode'`, function () {
                const userPath = `${appPath}/Code/User`;
                const expected = new RegExp(`^${userPath}`);
                pathUnixJoinStub.returns(userPath);
                dirnameStub.returns(dirPath.replace('%appDir%', '.vscode'));

                return ConfigManager.removeSettings().then(() => {
                  expect(process.platform).to.equal('freebsd');
                  expect(updateFileStub.firstCall.args[0]).to.match(expected);
                });
              });

              it(`'.vscode-insiders'`, function () {
                const userPath = `${appPath}/Code - Insiders/User`;
                const expected = new RegExp(`^${userPath}`);
                pathUnixJoinStub.returns(userPath);
                dirnameStub.returns(
                  dirPath.replace('%appDir%', '.vscode-insiders')
                );

                return ConfigManager.removeSettings().then(() => {
                  expect(process.platform).to.equal('freebsd');
                  expect(updateFileStub.firstCall.args[0]).to.match(expected);
                });
              });

              it(`'.code-oss-dev'`, function () {
                const userPath = `${appPath}/code-oss-dev/User`;
                const expected = new RegExp(`^${userPath}`);
                pathUnixJoinStub.returns(userPath);
                dirnameStub.returns(
                  dirPath.replace('%appDir%', '.vscode-oss-dev')
                );

                return ConfigManager.removeSettings().then(() => {
                  expect(process.platform).to.equal('freebsd');
                  expect(updateFileStub.firstCall.args[0]).to.match(expected);
                });
              });

              it(`'.code-oss'`, function () {
                const userPath = `${appPath}/Code - OSS/User`;
                const expected = new RegExp(`^${userPath}`);
                pathUnixJoinStub.returns(userPath);
                dirnameStub.returns(dirPath.replace('%appDir%', '.vscode-oss'));

                return ConfigManager.removeSettings().then(() => {
                  expect(process.platform).to.equal('freebsd');
                  expect(updateFileStub.firstCall.args[0]).to.match(expected);
                });
              });
            });
          });

          context('linux', function () {
            beforeEach(() => {
              sandbox.stub(os, 'homedir').returns('/home/user');
              appPath = `${os.homedir()}/.config`;
              dirPath = `${os.homedir()}/%appDir%/extensions`;
              platformStub.value('linux');
            });

            context(`and extension's installed directory is`, function () {
              it('in portable mode', function () {
                const userPath = `${
                  process.env.VSCODE_CWD
                }/data/user-data/User`;
                const expected = new RegExp(`^${userPath}`);
                pathUnixJoinStub.returns(userPath);
                dirnameStub.returns(dirPath.replace('%appDir%', 'data'));

                return ConfigManager.removeSettings().then(() => {
                  expect(process.platform).to.equal('linux');
                  expect(updateFileStub.firstCall.args[0]).to.match(expected);
                });
              });

              it(`'.vscode'`, function () {
                const userPath = `${appPath}/Code/User`;
                const expected = new RegExp(`^${userPath}`);
                pathUnixJoinStub.returns(userPath);
                dirnameStub.returns(dirPath.replace('%appDir%', '.vscode'));

                return ConfigManager.removeSettings().then(() => {
                  expect(process.platform).to.equal('linux');
                  expect(updateFileStub.firstCall.args[0]).to.match(expected);
                });
              });

              it(`'.vscode-insiders'`, function () {
                const userPath = `${appPath}/Code - Insiders/User`;
                const expected = new RegExp(`^${userPath}`);
                pathUnixJoinStub.returns(userPath);
                dirnameStub.returns(
                  dirPath.replace('%appDir%', '.vscode-insiders')
                );

                return ConfigManager.removeSettings().then(() => {
                  expect(process.platform).to.equal('linux');
                  expect(updateFileStub.firstCall.args[0]).to.match(expected);
                });
              });

              it(`'.code-oss-dev'`, function () {
                const userPath = `${appPath}/code-oss-dev/User`;
                const expected = new RegExp(`^${userPath}`);
                pathUnixJoinStub.returns(userPath);
                dirnameStub.returns(
                  dirPath.replace('%appDir%', '.vscode-oss-dev')
                );

                return ConfigManager.removeSettings().then(() => {
                  expect(process.platform).to.equal('linux');
                  expect(updateFileStub.firstCall.args[0]).to.match(expected);
                });
              });

              it(`'.code-oss'`, function () {
                const userPath = `${appPath}/Code - OSS/User`;
                const expected = new RegExp(`^${userPath}`);
                pathUnixJoinStub.returns(userPath);
                dirnameStub.returns(dirPath.replace('%appDir%', '.vscode-oss'));

                return ConfigManager.removeSettings().then(() => {
                  expect(process.platform).to.equal('linux');
                  expect(updateFileStub.firstCall.args[0]).to.match(expected);
                });
              });
            });
          });

          context('darwin (macOS)', function () {
            beforeEach(() => {
              sandbox.stub(os, 'homedir').returns('/Users/User');
              appPath = `${os.homedir()}/Library/Application Support`;
              dirPath = `${os.homedir()}/%appDir%/extensions`;
              platformStub.value('darwin');
            });

            context(`and extension's installed directory is`, function () {
              context('in portable mode', function () {
                it(`of 'vscode'`, function () {
                  const userPath = `${
                    process.env.VSCODE_CWD
                  }/code-portable-data/user-data/User`;
                  const expected = new RegExp(`^${userPath}`);
                  pathUnixJoinStub.returns(userPath);
                  dirnameStub.returns(dirPath.replace('%appDir%', 'data'));

                  return ConfigManager.removeSettings().then(() => {
                    expect(process.platform).to.equal('darwin');
                    expect(updateFileStub.firstCall.args[0]).to.match(expected);
                  });
                });

                it(`of 'vscode-insiders'`, function () {
                  sandbox.stub(fs, 'existsSync').returns(true);
                  const userPath = `${
                    process.env.VSCODE_CWD
                  }/code-insiders-portable-data/user-data/User`;
                  const expected = new RegExp(`^${userPath}`);
                  pathUnixJoinStub.returns(userPath);
                  dirnameStub.returns(dirPath.replace('%appDir%', 'data'));

                  return ConfigManager.removeSettings().then(() => {
                    expect(process.platform).to.equal('darwin');
                    expect(updateFileStub.firstCall.args[0]).to.match(expected);
                  });
                });
              });

              it(`'.vscode'`, function () {
                const userPath = `${appPath}/Code/User`;
                const expected = new RegExp(`^${userPath}`);
                pathUnixJoinStub.returns(userPath);
                dirnameStub.returns(dirPath.replace('%appDir%', '.vscode'));

                return ConfigManager.removeSettings().then(() => {
                  expect(process.platform).to.equal('darwin');
                  expect(updateFileStub.firstCall.args[0]).to.match(expected);
                });
              });

              it(`'.vscode-insiders'`, function () {
                const userPath = `${appPath}/Code - Insiders/User`;
                const expected = new RegExp(`^${userPath}`);
                pathUnixJoinStub.returns(userPath);
                dirnameStub.returns(
                  dirPath.replace('%appDir%', '.vscode-insiders')
                );

                return ConfigManager.removeSettings().then(() => {
                  expect(process.platform).to.equal('darwin');
                  expect(updateFileStub.firstCall.args[0]).to.match(expected);
                });
              });

              it(`'.code-oss-dev'`, function () {
                const userPath = `${appPath}/code-oss-dev/User`;
                const expected = new RegExp(`^${userPath}`);
                pathUnixJoinStub.returns(userPath);
                dirnameStub.returns(
                  dirPath.replace('%appDir%', '.vscode-oss-dev')
                );

                return ConfigManager.removeSettings().then(() => {
                  expect(process.platform).to.equal('darwin');
                  expect(updateFileStub.firstCall.args[0]).to.match(expected);
                });
              });

              it(`'.code-oss'`, function () {
                const userPath = `${appPath}/Code - OSS/User`;
                const expected = new RegExp(`^${userPath}`);
                pathUnixJoinStub.returns(userPath);
                dirnameStub.returns(dirPath.replace('%appDir%', '.vscode-oss'));

                return ConfigManager.removeSettings().then(() => {
                  expect(process.platform).to.equal('darwin');
                  expect(updateFileStub.firstCall.args[0]).to.match(expected);
                });
              });
            });
          });

          context('win32 (windows)', function () {
            beforeEach(() => {
              dirPath = 'C:\\Users\\User\\%appDir%\\extensions';
              platformStub.value('win32');
              envStub.value({
                APPDATA: 'C:\\Users\\User\\AppData\\Roaming',
                VSCODE_CWD:
                  'D:\\VSCode\\Path\\Insiders\\To\\OSS\\Installation\\Dev\\Dir',
              });
            });

            context(`and extension's installed directory is`, function () {
              it('in portable mode', function () {
                const userPath = `${
                  process.env.VSCODE_CWD
                }/data/user-data/User`;
                const expected = new RegExp(
                  `^${userPath.replace(/\\/g, '\\\\')}`
                );
                pathUnixJoinStub.returns(userPath);
                dirnameStub.returns(dirPath.replace('%appDir%', 'data'));

                return ConfigManager.removeSettings().then(() => {
                  expect(process.platform).to.equal('win32');
                  expect(updateFileStub.firstCall.args[0]).to.match(expected);
                });
              });

              it(`'.vscode' `, function () {
                const userPath = `${process.env.APPDATA}/Code/User`;
                const expected = new RegExp(
                  `^${userPath.replace(/\\/g, '\\\\')}`
                );
                pathUnixJoinStub.returns(userPath);
                dirnameStub.returns(dirPath.replace('%appDir%', '.vscode'));

                return ConfigManager.removeSettings().then(() => {
                  expect(process.platform).to.equal('win32');
                  expect(updateFileStub.firstCall.args[0]).to.match(expected);
                });
              });

              it(`'.vscode-insiders'`, function () {
                const userPath = `${process.env.APPDATA}/Code - Insiders/User`;
                const expected = new RegExp(
                  `^${userPath.replace(/\\/g, '\\\\')}`
                );
                pathUnixJoinStub.returns(userPath);
                dirnameStub.returns(
                  dirPath.replace('%appDir%', '.vscode-insiders')
                );

                return ConfigManager.removeSettings().then(() => {
                  expect(process.platform).to.equal('win32');
                  expect(updateFileStub.firstCall.args[0]).to.match(expected);
                });
              });

              it(`'.code-oss-dev'`, function () {
                const userPath = `${process.env.APPDATA}/code-oss-dev/User`;
                const expected = new RegExp(
                  `^${userPath.replace(/\\/g, '\\\\')}`
                );
                pathUnixJoinStub.returns(userPath);
                dirnameStub.returns(
                  dirPath.replace('%appDir%', '.vscode-oss-dev')
                );

                return ConfigManager.removeSettings().then(() => {
                  expect(process.platform).to.equal('win32');
                  expect(updateFileStub.firstCall.args[0]).to.match(expected);
                });
              });

              it(`'.code-oss'`, function () {
                const userPath = `${process.env.APPDATA}/Code - OSS/User`;
                const expected = new RegExp(
                  `^${userPath.replace(/\\/g, '\\\\')}`
                );
                pathUnixJoinStub.returns(userPath);
                dirnameStub.returns(dirPath.replace('%appDir%', '.vscode-oss'));

                return ConfigManager.removeSettings().then(() => {
                  expect(process.platform).to.equal('win32');
                  expect(updateFileStub.firstCall.args[0]).to.match(expected);
                });
              });
            });
          });
        });
      });
    });

    context(`function 'removeVSIconsConfigs'`, function () {
      let removeVSIconsConfigsSpy: sinon.SinonSpy;

      beforeEach(() => {
        removeVSIconsConfigsSpy = sandbox.spy(
          ConfigManager,
          // @ts-ignore
          'removeVSIconsConfigs'
        );
      });

      context(`to maintain comments and`, function () {
        it(`to remove a 'vsicons' configuration when it is last`, function () {
          const content: string[] = splitter(
            '{\n"updateChannel": "none",\n' +
              '\\\\ Comments\n' +
              `"${constants.vsicons.dontShowNewVersionMessageSetting}": true\n}`
          );
          const expected: string[] = splitter(
            `{\n"updateChannel": "none",\n\\\\ Comments\n}`
          );
          updateFileStub.callsArgWith(1, content).resolves();

          return ConfigManager.removeSettings().then(() => {
            expect(updateFileStub.calledOnce).to.be.true;
            expect(updateFileStub.firstCall.callback).to.be.a('function');
            expect(removeVSIconsConfigsSpy.calledOnce).to.be.true;
            expect(removeVSIconsConfigsSpy.returned(expected)).to.be.true;
          });
        });

        it(`to remove a 'vsicons' configuration when it is first`, function () {
          const content = splitter(
            `{\n"${
              constants.vsicons.dontShowNewVersionMessageSetting
            }": true,\n` +
              '\\\\ Comments\n' +
              '"window.zoomLevel": 0,\n"updateChannel": "none"\n}'
          );
          const expected = splitter(
            `{\n\\\\ Comments\n"window.zoomLevel": 0,\n"updateChannel": "none"\n}`
          );
          updateFileStub.callsArgWith(1, content).resolves();

          return ConfigManager.removeSettings().then(() => {
            expect(updateFileStub.calledOnce).to.be.true;
            expect(updateFileStub.firstCall.callback).to.be.a('function');
            expect(removeVSIconsConfigsSpy.calledOnce).to.be.true;
            expect(removeVSIconsConfigsSpy.returned(expected)).to.be.true;
          });
        });

        it(`to remove a 'vsicons' configuration when it is in between`, function () {
          const content = splitter(
            '{\n"window.zoomLevel": 0,\n' +
              '\\\\ Comments\n' +
              `"${
                constants.vsicons.dontShowNewVersionMessageSetting
              }": true,\n` +
              '"updateChannel": "none"\n}'
          );
          const expected = splitter(
            `{\n"window.zoomLevel": 0,\n\\\\ Comments\n"updateChannel": "none"\n}`
          );
          updateFileStub.callsArgWith(1, content).resolves();

          return ConfigManager.removeSettings().then(() => {
            expect(updateFileStub.calledOnce).to.be.true;
            expect(updateFileStub.firstCall.callback).to.be.a('function');
            expect(removeVSIconsConfigsSpy.calledOnce).to.be.true;
            expect(removeVSIconsConfigsSpy.returned(expected)).to.be.true;
          });
        });

        it(`to remove multiple 'vsicons' settings`, function () {
          const content = splitter(
            '{\n"window.zoomLevel": 0,\n' +
              '\\\\ Comments\n' +
              `"${
                constants.vsicons.dontShowNewVersionMessageSetting
              }": true,\n` +
              `"${constants.vsicons.presets.angular}": true,\n` +
              '"updateChannel": "none"\n}'
          );
          const expected = splitter(
            `{\n"window.zoomLevel": 0,\n\\\\ Comments\n"updateChannel": "none"\n}`
          );
          updateFileStub.callsArgWith(1, content).resolves();

          return ConfigManager.removeSettings().then(() => {
            expect(updateFileStub.calledOnce).to.be.true;
            expect(updateFileStub.firstCall.callback).to.be.a('function');
            expect(removeVSIconsConfigsSpy.calledOnce).to.be.true;
            expect(removeVSIconsConfigsSpy.returned(expected)).to.be.true;
          });
        });

        it(`to remove 'vsicons' settings of 'object' type`, function () {
          const content = splitter(
            '{\n' +
              '"window.zoomLevel": 0,\n' +
              '\\\\ Comments\n' +
              `"${constants.vsicons.associations.defaultFileSetting}": {\n` +
              '\\\\ Comments\n' +
              '"icon": "ts",\n' +
              '"format": "svg"\n' +
              '}\n' +
              '}'
          );
          const expected = splitter(
            `{\n"window.zoomLevel": 0,\n\\\\ Comments\n}`
          );
          updateFileStub.callsArgWith(1, content).resolves();

          return ConfigManager.removeSettings().then(() => {
            expect(updateFileStub.calledOnce).to.be.true;
            expect(updateFileStub.firstCall.callback).to.be.a('function');
            expect(removeVSIconsConfigsSpy.calledOnce).to.be.true;
            expect(removeVSIconsConfigsSpy.returned(expected)).to.be.true;
          });
        });

        it(`to remove 'vsicons' settings of 'array' type`, function () {
          const content = splitter(
            '{\n' +
              '"window.zoomLevel": 0,\n' +
              '\\\\ Comments\n' +
              `"${constants.vsicons.associations.filesSetting}": [\n` +
              '\\\\ Comments\n' +
              '{"icon": "ts", "format": "svg"}\n' +
              ']\n' +
              '}'
          );
          const expected = splitter(
            `{\n"window.zoomLevel": 0,\n\\\\ Comments\n}`
          );
          updateFileStub.callsArgWith(1, content).resolves();

          return ConfigManager.removeSettings().then(() => {
            expect(updateFileStub.calledOnce).to.be.true;
            expect(updateFileStub.firstCall.callback).to.be.a('function');
            expect(removeVSIconsConfigsSpy.calledOnce).to.be.true;
            expect(removeVSIconsConfigsSpy.returned(expected)).to.be.true;
          });
        });
      });
    });

    context(`function 'resetIconTheme'`, function () {
      let resetIconThemeSpy: sinon.SinonSpy;

      beforeEach(() => {
        resetIconThemeSpy = sandbox.spy(
          ConfigManager,
          // @ts-ignore
          'resetIconTheme'
        );
      });

      it(`does reset the 'iconTheme' configuration, if it was set to 'vscode-icons'`, function () {
        const content = splitter(
          '{\n' +
            '"window.zoomLevel": 0,\n' +
            `"${constants.vscode.iconThemeSetting}": "${
              constants.extension.name
            }"\n` +
            '}'
        );
        const expected = splitter(`{\n"window.zoomLevel": 0\n` + '}');
        updateFileStub.callsArgWith(1, content).resolves();

        return ConfigManager.removeSettings().then(() => {
          expect(updateFileStub.calledOnce).to.be.true;
          expect(updateFileStub.firstCall.callback).to.be.a('function');
          expect(resetIconThemeSpy.calledOnce).to.be.true;
          expect(resetIconThemeSpy.returned(expected)).to.be.true;
        });
      });

      it(`does NOT reset the 'iconTheme' configuration, if it's NOT set to 'vscode-icons'`, function () {
        const content = splitter(
          '{\n' +
            '"window.zoomLevel": 0,\n' +
            `"${constants.vscode.iconThemeSetting}": "otherIconTheme"\n` +
            '}'
        );
        updateFileStub.callsArgWith(1, content).resolves();

        return ConfigManager.removeSettings().then(() => {
          expect(updateFileStub.calledOnce).to.be.true;
          expect(updateFileStub.firstCall.callback).to.be.a('function');
          expect(resetIconThemeSpy.calledOnce).to.be.true;
          expect(resetIconThemeSpy.returned(content)).to.be.true;
        });
      });
    });

    context(`function 'removeLastEntryTrailingComma'`, function () {
      let removeLastEntryTrailingCommaStub: sinon.SinonSpy;

      beforeEach(() => {
        removeLastEntryTrailingCommaStub = sandbox.spy(
          ConfigManager,
          // @ts-ignore
          'removeLastEntryTrailingComma'
        );
      });

      context('to remove the trailing comma', function () {
        context('of the last settings entry', function () {
          it('when there is no EOF extra line', function () {
            const content = splitter(
              `{\n"window.zoomLevel": 0,\n"updateChannel": "none",\n}`
            );
            const expected = splitter(
              `{\n"window.zoomLevel": 0,\n"updateChannel": "none"\n}`
            );
            updateFileStub.callsArgWith(1, content).resolves();

            return ConfigManager.removeSettings().then(() => {
              expect(updateFileStub.calledOnce).to.be.true;
              expect(updateFileStub.firstCall.callback).to.be.a('function');
              expect(removeLastEntryTrailingCommaStub.calledOnce).to.be.true;
              expect(removeLastEntryTrailingCommaStub.returned(expected)).to.be
                .true;
            });
          });

          it('when there is an EOF extra line', function () {
            const content = splitter(
              `{\n"window.zoomLevel": 0,\n"updateChannel": "none",\n}\n`
            );
            const expected = splitter(
              `{\n"window.zoomLevel": 0,\n"updateChannel": "none"\n}\n`
            );
            updateFileStub.callsArgWith(1, content).resolves();

            return ConfigManager.removeSettings().then(() => {
              expect(updateFileStub.calledOnce).to.be.true;
              expect(updateFileStub.firstCall.callback).to.be.a('function');
              expect(removeLastEntryTrailingCommaStub.calledOnce).to.be.true;
              expect(removeLastEntryTrailingCommaStub.returned(expected)).to.be
                .true;
            });
          });

          it(`when the last entry is of 'object' type`, function () {
            const content = splitter(
              '{\n' +
                '"window.zoomLevel": 0,\n' +
                '"updateChannel": "none",\n' +
                '"files.associations": {\n' +
                '"js": "something"\n' +
                '},\n' +
                '}'
            );
            const expected = splitter(
              '{\n' +
                '"window.zoomLevel": 0,\n' +
                '"updateChannel": "none",\n' +
                '"files.associations": {\n' +
                '"js": "something"\n' +
                '}\n' +
                '}'
            );
            updateFileStub.callsArgWith(1, content).resolves();

            return ConfigManager.removeSettings().then(() => {
              expect(updateFileStub.calledOnce).to.be.true;
              expect(updateFileStub.firstCall.callback).to.be.a('function');
              expect(removeLastEntryTrailingCommaStub.calledOnce).to.be.true;
              expect(removeLastEntryTrailingCommaStub.returned(expected)).to.be
                .true;
            });
          });

          it(`when the last entry is of 'array' type`, function () {
            const content = splitter(
              '{\n' +
                '"window.zoomLevel": 0,\n' +
                '"updateChannel": "none",\n' +
                '"some.setting": [\n' +
                '"entry",\n' +
                '"anotherEntry"\n' +
                '],\n' +
                '}'
            );
            const expected = splitter(
              '{\n' +
                '"window.zoomLevel": 0,\n' +
                '"updateChannel": "none",\n' +
                '"some.setting": [\n' +
                '"entry",\n' +
                '"anotherEntry"\n' +
                ']\n' +
                '}'
            );
            updateFileStub.callsArgWith(1, content).resolves();

            return ConfigManager.removeSettings().then(() => {
              expect(updateFileStub.calledOnce).to.be.true;
              expect(updateFileStub.firstCall.callback).to.be.a('function');
              expect(removeLastEntryTrailingCommaStub.calledOnce).to.be.true;
              expect(removeLastEntryTrailingCommaStub.returned(expected)).to.be
                .true;
            });
          });
        });
      });
    });

    context(`function 'hasConfigChanged'`, function () {
      context(`returns 'true'`, function () {
        it(`when no configuration is provided`, function () {
          expect(configManager.hasConfigChanged(undefined)).to.be.true;
        });

        context(`when the config has changed`, function () {
          it(`in any section`, function () {
            vsiconsClone.customIconFolderPath = 'path/to';

            expect(configManager.hasConfigChanged(vsiconsClone)).to.be.true;
          });

          it(`only on the specified sections`, function () {
            vsiconsClone.presets.hideExplorerArrows = true;

            expect(
              configManager.hasConfigChanged(vsiconsClone, [
                constants.vsicons.presets.name,
              ])
            ).to.be.true;
          });
        });
      });

      context(`returns 'false'`, function () {
        context(`when the config has NOT changed`, function () {
          it(`in any section`, function () {
            expect(configManager.hasConfigChanged(vsiconsClone)).to.be.false;
          });

          it(`in the specified sections`, function () {
            vsiconsClone.presets.hideExplorerArrows = true;

            expect(
              configManager.hasConfigChanged(vsiconsClone, [
                constants.vsicons.associations.name,
              ])
            ).to.be.false;
          });
        });
      });
    });

    context(`function 'getCustomIconsDirPath'`, function () {
      it(`returns the app user directory, when no directory path is provided`, function () {
        const appUserDirPath = '/Path/To/App/User/Dir/Path';
        vscodeManagerStub.getAppUserDirPath.returns(appUserDirPath);

        expect(configManager.getCustomIconsDirPath('')).to.be.equal(
          appUserDirPath
        );
      });

      context(`returns the provide directory path, when`, function () {
        it(`it's an absolute path`, function () {
          const customIconsDirPath = '/Path/To/Custom/Icons/Dir/';

          expect(
            configManager.getCustomIconsDirPath(customIconsDirPath)
          ).to.be.equal(customIconsDirPath);
        });

        it(`no 'workspace' directory paths exist`, function () {
          const customIconsDirPath = './Path/To/Custom/Icons/Dir/';
          vscodeManagerStub.getWorkspacePaths.returns(undefined);

          expect(
            configManager.getCustomIconsDirPath(customIconsDirPath)
          ).to.be.equal(customIconsDirPath);
        });

        it(`the 'workspace' directory paths are empty`, function () {
          const customIconsDirPath = './Path/To/Custom/Icons/Dir/';
          vscodeManagerStub.getWorkspacePaths.returns([]);

          expect(
            configManager.getCustomIconsDirPath(customIconsDirPath)
          ).to.be.equal(customIconsDirPath);
        });

        it(`the 'workspace' directory path does NOT exist`, function () {
          const customIconsDirPath = './Path/To/Custom/Icons/Dir/';
          const rootDir = '/';
          const joinedDir = path.posix.join('', customIconsDirPath);
          vscodeManagerStub.getWorkspacePaths.returns([rootDir]);
          sandbox.stub(fs, 'existsSync').returns(false);
          pathUnixJoinStub.returns(joinedDir);

          expect(
            configManager.getCustomIconsDirPath(customIconsDirPath)
          ).to.be.equal(joinedDir);
        });
      });

      context(`returns an absolute directory path, when`, function () {
        it(`the provided path is relative to the 'workspace' directory`, function () {
          const customIconsDirPath = './Path/To/Custom/Icons/Dir/';
          const rootDir = '/';
          const joinedDir = path.posix.join(rootDir, customIconsDirPath);
          vscodeManagerStub.getWorkspacePaths.returns([rootDir]);
          sandbox.stub(fs, 'existsSync').returns(true);
          pathUnixJoinStub.returns(joinedDir);

          expect(
            configManager.getCustomIconsDirPath(customIconsDirPath)
          ).to.be.equal(joinedDir);
        });
      });
    });

    context(`function 'getIconTheme'`, function () {
      it(`returns the icon theme setting`, function () {
        getStub.returns(constants.vsicons.name);

        expect(configManager.getIconTheme()).to.equal(constants.vsicons.name);
        expect(
          getStub.calledOnceWith(constants.vscode.iconThemeSetting)
        ).to.be.true;
      });

      it(`returns 'undefined' if the icon theme setting does NOT exists`, function () {
        getStub.returns(undefined);

        expect(configManager.getIconTheme()).to.be.undefined;
        expect(
          getStub.calledOnceWith(constants.vscode.iconThemeSetting)
        ).to.be.true;
      });
    });

    context(`function 'getPreset'`, function () {
      it(`returns the preset setting`, function () {
        const expected = {
          key: PresetNames[PresetNames.hideFolders],
          defaultValue: false,
          globalValue: undefined,
          workspaceValue: undefined,
          workspaceFolderValue: undefined,
        };
        inspectStub.returns(expected);

        expect(
          configManager.getPreset(PresetNames[PresetNames.hideFolders])
        ).to.eql(expected);
        expect(
          inspectStub
            .getCall(2)
            .calledWith(PresetNames[PresetNames.hideFolders])
        ).to.be.true;
      });

      it(`returns 'undefined', if the preset setting does NOT exists`, function () {
        inspectStub.returns(undefined);

        expect(configManager.getPreset('some.unknown')).to.be.undefined;
        expect(inspectStub.getCall(2).calledWith('some.unknown')).to.be.true;
      });
    });

    context(`function 'updateDontShowNewVersionMessage'`, function () {
      it(`updates the setting to 'true'`, function () {
        return configManager
          .updateDontShowNewVersionMessage(true)
          .then(
            () =>
              expect(
                updateStub.calledOnceWith(
                  constants.vsicons.dontShowNewVersionMessageSetting,
                  true,
                  ConfigurationTarget.Global
                )
              ).to.be.true
          );
      });

      it(`updates the setting to 'false'`, function () {
        return configManager
          .updateDontShowNewVersionMessage(false)
          .then(
            () =>
              expect(
                updateStub.calledOnceWith(
                  constants.vsicons.dontShowNewVersionMessageSetting,
                  false,
                  ConfigurationTarget.Global
                )
              ).to.be.true
          );
      });
    });

    context(
      `function 'updateDontShowConfigManuallyChangedMessage'`,
      function () {
        it(`updates the setting to 'true'`, function () {
          return configManager
            .updateDontShowConfigManuallyChangedMessage(true)
            .then(
              () =>
                expect(
                  updateStub.calledOnceWith(
                    constants.vsicons
                      .dontShowConfigManuallyChangedMessageSetting,
                    true,
                    ConfigurationTarget.Global
                  )
                ).to.be.true
            );
        });

        it(`updates the setting to 'false'`, function () {
          return configManager
            .updateDontShowConfigManuallyChangedMessage(false)
            .then(
              () =>
                expect(
                  updateStub.calledOnceWith(
                    constants.vsicons
                      .dontShowConfigManuallyChangedMessageSetting,
                    false,
                    ConfigurationTarget.Global
                  )
                ).to.be.true
            );
        });
      }
    );

    context(`function 'updateAutoReload'`, function () {
      it(`updates the setting to 'true'`, function () {
        return configManager
          .updateAutoReload(true)
          .then(
            () =>
              expect(
                updateStub.calledOnceWith(
                  constants.vsicons.projectDetectionAutoReloadSetting,
                  true,
                  ConfigurationTarget.Global
                )
              ).to.be.true
          );
      });

      it(`updates the setting to 'false'`, function () {
        return configManager
          .updateAutoReload(false)
          .then(
            () =>
              expect(
                updateStub.calledOnceWith(
                  constants.vsicons.projectDetectionAutoReloadSetting,
                  false,
                  ConfigurationTarget.Global
                )
              ).to.be.true
          );
      });
    });

    context(`function 'updateDisableDetection'`, function () {
      it(`updates the setting to 'true'`, function () {
        return configManager
          .updateDisableDetection(true)
          .then(
            () =>
              expect(
                updateStub.calledOnceWith(
                  constants.vsicons.projectDetectionDisableDetectSetting,
                  true,
                  ConfigurationTarget.Global
                )
              ).to.be.true
          );
      });

      it(`updates the setting to 'false'`, function () {
        return configManager
          .updateDisableDetection(false)
          .then(
            () =>
              expect(
                updateStub.calledOnceWith(
                  constants.vsicons.projectDetectionDisableDetectSetting,
                  false,
                  ConfigurationTarget.Global
                )
              ).to.be.true
          );
      });
    });

    context(`function 'updateIconTheme'`, function () {
      it(`updates the icon theme setting to 'vsicons'`, function () {
        return configManager
          .updateIconTheme()
          .then(
            () =>
              expect(
                updateStub.calledOnceWith(
                  constants.vscode.iconThemeSetting,
                  constants.extension.name,
                  ConfigurationTarget.Global
                )
              ).to.be.true
          );
      });
    });

    context(`function 'updatePreset'`, function () {
      it(`updates the preset setting to 'true'`, function () {
        inspectStub.returns({ defaultValue: false });

        return configManager
          .updatePreset(
            PresetNames[PresetNames.tsOfficial],
            true,
            ConfigurationTarget.Global
          )
          .then(() => {
            expect(
              inspectStub
                .getCall(2)
                .calledWith(
                  `${constants.vsicons.presets.fullname}.${
                    PresetNames[PresetNames.tsOfficial]
                  }`
                )
            ).to.be.true;
            expect(
              updateStub.calledOnceWith(
                `${constants.vsicons.presets.fullname}.${
                  PresetNames[PresetNames.tsOfficial]
                }`,
                true,
                ConfigurationTarget.Global
              )
            ).to.be.true;
          });
      });

      it(`removes the preset setting when the value is 'false'`, function () {
        inspectStub.returns({ defaultValue: false });

        return configManager
          .updatePreset(
            PresetNames[PresetNames.jsOfficial],
            false,
            ConfigurationTarget.Global
          )
          .then(() => {
            expect(
              inspectStub
                .getCall(2)
                .calledWith(
                  `${constants.vsicons.presets.fullname}.${
                    PresetNames[PresetNames.jsOfficial]
                  }`
                )
            ).to.be.true;
            expect(
              updateStub.calledOnceWith(
                `${constants.vsicons.presets.fullname}.${
                  PresetNames[PresetNames.jsOfficial]
                }`,
                undefined,
                ConfigurationTarget.Global
              )
            ).to.be.true;
          });
      });

      it(`respects the configuration target`, function () {
        inspectStub.returns({ defaultValue: false });

        return configManager
          .updatePreset(
            PresetNames[PresetNames.angular],
            false,
            ConfigurationTarget.Workspace
          )
          .then(() => {
            expect(
              inspectStub
                .getCall(2)
                .calledWith(
                  `${constants.vsicons.presets.fullname}.${
                    PresetNames[PresetNames.angular]
                  }`
                )
            ).to.be.true;
            expect(
              updateStub.calledOnceWith(
                `${constants.vsicons.presets.fullname}.${
                  PresetNames[PresetNames.angular]
                }`,
                undefined,
                ConfigurationTarget.Workspace
              )
            ).to.be.true;
          });
      });
    });
  });
});
