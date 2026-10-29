import type * as types from '../../src/types';
import type { PackageManifest } from '../../src/types/package';

import path from 'path';

import { expect } from 'chai';
import { cloneDeep } from 'lodash';
import * as sinon from 'sinon';

import packageJson from '../../../package.json';
import { ExtensionManager } from '../../src/app/extensionManager';
import { ConfigManager } from '../../src/configuration/configManager';
import { constants } from '../../src/constants';
import { IconsGenerator } from '../../src/iconsManifest';
import { NotificationManager } from '../../src/notification/notificationManager';
import { ProjectAutoDetectionManager } from '../../src/pad/projectAutoDetectionManager';
import { SettingsManager } from '../../src/settings/settingsManager';
import * as enums from '../../src/types/enums';
import { VSCodeManager } from '../../src/vscode/vscodeManager';
import { vsicons } from '../fixtures/vsicons';

describe('ExtensionManagerContract: tests', function () {
  context('ensures that', function () {
    let sandbox: sinon.SinonSandbox;
    let vscodeManagerStub: sinon.SinonStubbedInstance<types.VSCodeManagerContract>;
    let configManagerStub: sinon.SinonStubbedInstance<types.ConfigManagerContract>;
    let settingsManagerStub: sinon.SinonStubbedInstance<types.SettingsManagerContract>;
    let notifyManagerStub: sinon.SinonStubbedInstance<types.NotificationManagerContract>;
    let iconsGeneratorStub: sinon.SinonStubbedInstance<types.IconsGeneratorContract>;
    let padMngStub: sinon.SinonStubbedInstance<types.ProjectAutoDetectionManagerContract>;
    let onDidChangeConfigurationStub: sinon.SinonStub;
    let registerCommandStub: sinon.SinonStub;
    let executeCommandStub: sinon.SinonStub;
    let extensionManager: types.ExtensionManagerContract;
    let vsiconsClone: types.VSIcons;

    beforeEach(function () {
      sandbox = sinon.createSandbox();

      vscodeManagerStub =
        sandbox.createStubInstance<types.VSCodeManagerContract>(VSCodeManager);

      sandbox.stub(vscodeManagerStub, 'context').get(() => ({
        subscriptions: [],
        globalState: { setKeysForSync: sandbox.stub() },
      }));
      onDidChangeConfigurationStub = sandbox.stub();
      sandbox.stub(vscodeManagerStub, 'workspace').get(() => ({
        onDidChangeConfiguration: onDidChangeConfigurationStub,
      }));
      registerCommandStub = sandbox.stub();
      executeCommandStub = sandbox.stub();
      sandbox.stub(vscodeManagerStub, 'commands').get(() => ({
        registerCommand: registerCommandStub,
        executeCommand: executeCommandStub,
      }));

      configManagerStub =
        sandbox.createStubInstance<types.ConfigManagerContract>(ConfigManager);
      vsiconsClone = cloneDeep(vsicons);
      sandbox.stub(configManagerStub, 'vsicons').get(() => vsiconsClone);

      settingsManagerStub =
        sandbox.createStubInstance<types.SettingsManagerContract>(
          SettingsManager,
        );

      notifyManagerStub =
        sandbox.createStubInstance<types.NotificationManagerContract>(
          NotificationManager,
        );

      iconsGeneratorStub =
        sandbox.createStubInstance<types.IconsGeneratorContract>(
          IconsGenerator,
        );

      padMngStub =
        sandbox.createStubInstance<types.ProjectAutoDetectionManagerContract>(
          ProjectAutoDetectionManager,
        );

      extensionManager = new ExtensionManager(
        vscodeManagerStub,
        configManagerStub,
        settingsManagerStub,
        notifyManagerStub,
        iconsGeneratorStub,
        padMngStub,
      );
    });

    afterEach(function () {
      sandbox.restore();
    });

    context(`on instantiation`, function () {
      context(`an event listener for configuration changes`, function () {
        context(`is registered`, function () {
          it(`when an instance of 'vscodeManager' is passed`, function () {
            expect(
              onDidChangeConfigurationStub.calledOnceWithExactly(
                // @ts-ignore
                extensionManager.didChangeConfigurationListener,
                extensionManager,
                vscodeManagerStub.context.subscriptions,
              ),
            ).to.be.true;
          });
        });
      });
    });

    context(`on activation`, function () {
      let registerCommandsStub: sinon.SinonStub;
      let manageIntroMessageStub: sinon.SinonStub;
      let manageCustomizationsStub: sinon.SinonStub;
      let applyProjectDetectionStub: sinon.SinonStub;
      let isSupportedVersionStub: sinon.SinonStub;
      let isNewVersionStub: sinon.SinonStub;

      beforeEach(function () {
        registerCommandsStub = sandbox.stub(
          extensionManager,
          // @ts-ignore
          'registerCommands',
        );
        manageIntroMessageStub = sandbox.stub(
          extensionManager,
          // @ts-ignore
          'manageIntroMessage',
        );
        manageCustomizationsStub = sandbox.stub(
          extensionManager,
          // @ts-ignore
          'manageCustomizations',
        );
        isSupportedVersionStub = sandbox
          .stub(vscodeManagerStub, 'isSupportedVersion')
          .get(() => true);
        isNewVersionStub = sandbox.stub(settingsManagerStub, 'isNewVersion');

        applyProjectDetectionStub = sandbox.stub(
          extensionManager,
          // @ts-ignore
          'applyProjectDetection',
        );

        padMngStub.detectProjects = sandbox.stub<
          [projectNames: enums.Projects[]],
          Promise<types.ProjectDetectionResult[]>
        >();
        settingsManagerStub.updateStatus = sandbox.stub<
          [status?: enums.ExtensionStatus],
          Promise<types.State>
        >();
      });

      it(`functions are called with the specific order`, async function () {
        isNewVersionStub.value(true);

        await extensionManager.activate();

        expect(
          manageIntroMessageStub.calledImmediatelyAfter(registerCommandsStub),
        ).to.be.true;
        expect(
          manageCustomizationsStub.calledImmediatelyAfter(
            manageIntroMessageStub,
          ),
        ).to.be.true;
        expect(
          padMngStub.detectProjects.calledImmediatelyAfter(
            manageCustomizationsStub,
          ),
        ).to.be.true;

        expect(
          applyProjectDetectionStub.calledImmediatelyAfter(
            // eslint-disable-next-line @typescript-eslint/unbound-method
            padMngStub.detectProjects,
          ),
        ).to.be.true;
        expect(
          settingsManagerStub.updateStatus.calledImmediatelyAfter(
            applyProjectDetectionStub,
          ),
        ).to.be.true;

        expect(vscodeManagerStub.isSupportedVersion).to.be.true;
        expect(settingsManagerStub.isNewVersion).to.be.true;
        expect(notifyManagerStub.notifyError.called).to.be.false;
      });

      it(`updates the status, if it's a new version`, async function () {
        isNewVersionStub.value(true);

        await extensionManager.activate();

        expect(
          settingsManagerStub.updateStatus.calledAfter(
            // eslint-disable-next-line @typescript-eslint/unbound-method
            padMngStub.detectProjects,
          ),
        ).to.be.true;

        expect(vscodeManagerStub.isSupportedVersion).to.be.true;
        expect(settingsManagerStub.isNewVersion).to.be.true;
        expect(settingsManagerStub.updateStatus.calledOnceWithExactly()).to.be
          .true;
        expect(notifyManagerStub.notifyError.called).to.be.false;
      });

      it(`does NOT updates the status, if it's NOT a new version`, async function () {
        isNewVersionStub.value(false);

        await extensionManager.activate();

        expect(vscodeManagerStub.isSupportedVersion).to.be.true;
        expect(settingsManagerStub.isNewVersion).to.be.false;
        expect(settingsManagerStub.updateStatus.called).to.be.false;
        expect(notifyManagerStub.notifyError.called).to.be.false;
      });

      context(`shows an Error message`, function () {
        it(`when the editor version is not supported`, async function () {
          sandbox.stub(vscodeManagerStub, 'version').get(() => '1.0.0');
          isSupportedVersionStub.value(false);
          notifyManagerStub.notifyError.resolves();

          await extensionManager.activate();

          expect(vscodeManagerStub.isSupportedVersion).to.be.false;
          expect(notifyManagerStub.notifyError.called).to.be.true;
          expect(registerCommandsStub.called).to.be.false;
          expect(manageIntroMessageStub.called).to.be.false;
          expect(manageCustomizationsStub.called).to.be.false;
          expect(padMngStub.detectProjects.called).to.be.false;
          expect(applyProjectDetectionStub.called).to.be.false;
          expect(settingsManagerStub.updateStatus.called).to.be.false;
        });
      });

      context(`when the environment is`, function () {
        let originalRootDir: string;
        beforeEach(function () {
          isSupportedVersionStub.value(true);
          isNewVersionStub.value(false);
          sandbox.stub(path, 'dirname').returns('/path/to/filename');
          originalRootDir = ConfigManager.rootDir;
        });

        afterEach(function () {
          ConfigManager.rootDir = originalRootDir;
          constants.environment.production = false;
        });

        context(`development`, function () {
          it(`does NOT change the 'root' directory`, async function () {
            const baseRegexp = `^[a-zA-Z:\\\\]+|/`;

            await extensionManager.activate();

            expect(constants.environment.production).to.be.false;
            expect(ConfigManager.rootDir).to.match(new RegExp(baseRegexp));
            expect(ConfigManager.outDir).to.match(
              new RegExp(`${baseRegexp}${constants.extension.outDirName}`),
            );
          });
        });

        context(`production`, function () {
          let manifest: PackageManifest;
          let manifestMainOriginalValue: string;

          beforeEach(function () {
            manifest = packageJson as PackageManifest;
            manifestMainOriginalValue = manifest.main;
            manifest.main = constants.extension.distEntryFilename;
          });

          afterEach(function () {
            manifest.main = manifestMainOriginalValue;
          });

          it(`changes the 'root' directory`, async function () {
            const baseRegexp = `^[a-zA-Z:\\\\]+|/path`;

            await extensionManager.activate();

            expect(constants.environment.production).to.be.true;
            expect(ConfigManager.rootDir).to.match(new RegExp(baseRegexp));
            expect(ConfigManager.outDir).to.match(
              new RegExp(
                `${baseRegexp}[\\\\|/]${constants.extension.distDirName}`,
              ),
            );
          });
        });
      });
    });

    context(`the execute and reload`, function () {
      let supportsThemesReloadStub: sinon.SinonStub;
      let executeAndReload: (...arg: unknown[]) => void;

      beforeEach(function () {
        supportsThemesReloadStub = sandbox.stub(
          vscodeManagerStub,
          'supportsThemesReload',
        );
        executeAndReload =
          // @ts-ignore
          extensionManager.executeAndReload as (...arg: unknown[]) => void;
      });

      context(`when editor theme reload is NOT supported`, function () {
        beforeEach(function () {
          supportsThemesReloadStub.value(false);
        });

        context(`does NOT reload the editor when`, function () {
          it(`project detection results are empty`, function () {
            // @ts-ignore
            const cb = sandbox.stub(extensionManager, 'applyCustomization');
            const cbArgs: unknown[] = [[]];

            executeAndReload.call(extensionManager, cb, cbArgs);

            expect(cb.calledOnce).to.be.true;
            expect(cb.firstCall.args).to.deep.equal([[]]);
            expect(executeCommandStub.called).to.be.false;
          });

          it(`when the customization callback has no arguments`, function () {
            const callback = sandbox.stub(
              extensionManager,
              // @ts-ignore
              'applyCustomization',
            );

            executeAndReload.call(extensionManager, callback);

            expect(callback.calledOnceWithExactly()).to.be.true;
            expect(
              executeCommandStub.calledOnceWithExactly(
                constants.vscode.reloadWindowActionSetting,
              ),
            ).to.be.true;
          });
        });

        context(`reloads the editor`, function () {
          it(`without executing the callback, when it's NOT provided`, function () {
            executeAndReload.call(extensionManager);

            expect(
              executeCommandStub.calledOnceWithExactly(
                constants.vscode.reloadWindowActionSetting,
              ),
            ).to.be.true;
          });

          it(`executing the callback first`, function () {
            const cb = sinon.fake();

            executeAndReload.call(extensionManager, cb);

            expect(cb.calledOnceWithExactly()).to.be.true;
            expect(
              executeCommandStub.calledOnceWithExactly(
                constants.vscode.reloadWindowActionSetting,
              ),
            ).to.be.true;
          });

          it(`executing the callback, with its arguments, first`, function () {
            const cb = sinon.fake();
            const cbArgs = ['arg1', 'arg2'];

            executeAndReload.call(extensionManager, cb, cbArgs);

            expect(cb.calledOnceWithExactly(...cbArgs)).to.be.true;
            expect(
              executeCommandStub.calledOnceWithExactly(
                constants.vscode.reloadWindowActionSetting,
              ),
            ).to.be.true;
          });
        });
      });

      context(`when editor theme reload is supported`, function () {
        beforeEach(function () {
          supportsThemesReloadStub.value(true);
        });

        it(`does NOT reload the editor`, function () {
          const cb = sinon.fake();

          executeAndReload.call(extensionManager, cb);

          expect(executeCommandStub.called).to.be.false;
        });
      });
    });

    context(`the handle action`, function () {
      let executeAndReloadStub: sinon.SinonStub;
      let handleUpdatePresetStub: sinon.SinonStub;
      let handleAction: (...arg: unknown[]) => Promise<void>;

      beforeEach(function () {
        executeAndReloadStub = sandbox.stub(
          extensionManager,
          // @ts-ignore
          'executeAndReload',
        );
        handleUpdatePresetStub = sandbox.stub(
          extensionManager,
          // @ts-ignore
          'handleUpdatePreset',
        );
        handleAction =
          // @ts-ignore
          extensionManager.handleAction as (...arg: unknown[]) => Promise<void>;
      });

      context(`when no action is requested`, function () {
        it(`only resets the 'customMsgShown'`, async function () {
          await handleAction.call(extensionManager);

          // @ts-ignore
          expect(extensionManager.customMsgShown).to.be.false;
          expect(executeAndReloadStub.called).to.be.false;
          expect(
            configManagerStub.updateDontShowConfigManuallyChangedMessage.called,
          ).to.be.false;
          expect(configManagerStub.updateDisableDetection.called).to.be.false;
          expect(configManagerStub.updateAutoReload.called).to.be.false;
          expect(handleUpdatePresetStub.called).to.be.false;
        });
      });

      context(`when the 'dontShowThis' action is requested`, function () {
        context(`does NOT reload the editor`, function () {
          context(`when no callback is provided`, function () {
            it(`and does nothing`, async function () {
              await handleAction.call(
                extensionManager,
                enums.LangResourceKeys.dontShowThis,
              );

              // @ts-ignore
              expect(extensionManager.customMsgShown).to.be.undefined;
              expect(executeAndReloadStub.called).to.be.false;
              expect(configManagerStub.updateDisableDetection.called).to.be
                .false;
              expect(configManagerStub.updateAutoReload.called).to.be.false;
              // @ts-ignore
              expect(extensionManager.doReload).to.be.false;
              expect(
                configManagerStub.updateDontShowConfigManuallyChangedMessage
                  .called,
              ).to.be.false;
              expect(handleUpdatePresetStub.called).to.be.false;
            });
          });

          context(`when a callback is provided`, function () {
            context(`and is NOT 'applyCustomization'`, function () {
              it(`does nothing`, async function () {
                await handleAction.call(
                  extensionManager,
                  enums.LangResourceKeys.dontShowThis,
                  sandbox.spy(),
                );

                // @ts-ignore
                expect(extensionManager.customMsgShown).to.be.undefined;
                expect(executeAndReloadStub.called).to.be.false;
                expect(configManagerStub.updateDisableDetection.called).to.be
                  .false;
                expect(configManagerStub.updateAutoReload.called).to.be.false;
                // @ts-ignore
                expect(extensionManager.doReload).to.be.false;
                expect(
                  configManagerStub.updateDontShowConfigManuallyChangedMessage
                    .called,
                ).to.be.false;
                expect(handleUpdatePresetStub.called).to.be.false;
              });
            });

            context(`and is 'applyCustomization'`, function () {
              it(`updates the setting`, async function () {
                const cb = sinon.fake();
                Reflect.defineProperty(cb, 'name', {
                  value: 'applyCustomization',
                });

                await handleAction.call(
                  extensionManager,
                  enums.LangResourceKeys.dontShowThis,
                  cb,
                );

                // @ts-ignore
                expect(extensionManager.customMsgShown).to.be.false;
                expect(executeAndReloadStub.called).to.be.false;
                expect(configManagerStub.updateDisableDetection.called).to.be
                  .false;
                expect(configManagerStub.updateAutoReload.called).to.be.false;
                // @ts-ignore
                expect(extensionManager.doReload).to.be.false;
                // @ts-ignore
                expect(extensionManager.customMsgShown).to.be.false;
                // @ts-ignore
                expect(extensionManager.callback).to.equal(cb);
                expect(handleUpdatePresetStub.called).to.be.false;
                expect(
                  configManagerStub.updateDontShowConfigManuallyChangedMessage.calledOnceWithExactly(
                    true,
                  ),
                ).to.be.true;
              });
            });
          });
        });
      });

      context(`when the 'disableDetect' action is requested`, function () {
        context(`does NOT reload the editor`, function () {
          it(`but updates the setting`, async function () {
            await handleAction.call(
              extensionManager,
              enums.LangResourceKeys.disableDetect,
            );

            // @ts-ignore
            expect(extensionManager.doReload).to.be.false;
            // @ts-ignore
            expect(extensionManager.customMsgShown).to.be.undefined;
            expect(executeAndReloadStub.called).to.be.false;
            expect(
              configManagerStub.updateDontShowConfigManuallyChangedMessage
                .called,
            ).to.be.false;
            expect(configManagerStub.updateAutoReload.called).to.be.false;
            expect(handleUpdatePresetStub.called).to.be.false;
            expect(
              configManagerStub.updateDisableDetection.calledOnceWithExactly(
                true,
              ),
            ).to.be.true;
          });
        });
      });

      context(`when the 'autoReload' action is requested`, function () {
        beforeEach(function () {
          configManagerStub.updateAutoReload.resolves();
        });

        context(`updates the setting`, function () {
          it(`and handles the preset update`, async function () {
            const cb = sinon.fake();
            const cbArgs = [];

            await handleAction.call(
              extensionManager,
              enums.LangResourceKeys.autoReload,
              cb,
              cbArgs,
            );

            // @ts-ignore
            expect(extensionManager.customMsgShown).to.be.undefined;
            // @ts-ignore
            expect(extensionManager.doReload).to.be.undefined;
            // @ts-ignore
            expect(extensionManager.callback).to.equal(cb);
            expect(configManagerStub.updateDisableDetection.called).to.be.false;
            expect(
              configManagerStub.updateDontShowConfigManuallyChangedMessage
                .called,
            ).to.be.false;
            expect(
              configManagerStub.updateAutoReload.calledOnceWithExactly(true),
            ).to.be.true;
            expect(handleUpdatePresetStub.calledOnceWithExactly(cb, cbArgs)).to
              .be.true;
          });
        });
      });

      context(`when the 'reload' action is requested`, function () {
        context(`executes the callback and reloads the editor`, function () {
          it(`when no callback arguments are provided`, async function () {
            const cb = sinon.fake();

            await handleAction.call(
              extensionManager,
              enums.LangResourceKeys.reload,
              cb,
            );

            // @ts-ignore
            expect(extensionManager.customMsgShown).to.be.undefined;
            // @ts-ignore
            expect(extensionManager.doReload).to.be.undefined;
            // @ts-ignore
            expect(extensionManager.callback).to.equal(cb);
            expect(
              configManagerStub.updateDontShowConfigManuallyChangedMessage
                .called,
            ).to.be.false;
            expect(configManagerStub.updateDisableDetection.called).to.be.false;
            expect(configManagerStub.updateAutoReload.called).to.be.false;
            expect(handleUpdatePresetStub.called).to.be.false;
            expect(executeAndReloadStub.calledOnceWithExactly(cb, undefined)).to
              .be.true;
          });

          it(`when callback arguments length is NOT the expected`, async function () {
            const cb = sinon.fake();
            const cbArgs = ['arg1', 'arg2'];

            await handleAction.call(
              extensionManager,
              enums.LangResourceKeys.reload,
              cb,
              cbArgs,
            );

            // @ts-ignore
            expect(extensionManager.customMsgShown).to.be.undefined;
            // @ts-ignore
            expect(extensionManager.doReload).to.be.undefined;
            // @ts-ignore
            expect(extensionManager.callback).to.equal(cb);
            expect(
              configManagerStub.updateDontShowConfigManuallyChangedMessage
                .called,
            ).to.be.false;
            expect(configManagerStub.updateDisableDetection.called).to.be.false;
            expect(configManagerStub.updateAutoReload.called).to.be.false;
            expect(handleUpdatePresetStub.called).to.be.false;
            expect(executeAndReloadStub.calledOnceWithExactly(cb, cbArgs)).to.be
              .true;
          });
        });

        context(`handles the update preset`, function () {
          it(`when no callback arguments are provided`, async function () {
            const cb = sinon.fake();
            const cbArgs = ['arg1', 'arg2', 'arg3'];

            await handleAction.call(
              extensionManager,
              enums.LangResourceKeys.reload,
              cb,
              cbArgs,
            );

            // @ts-ignore
            expect(extensionManager.customMsgShown).to.be.undefined;
            // @ts-ignore
            expect(extensionManager.callback).to.equal(cb);
            expect(executeAndReloadStub.called).to.be.false;
            expect(
              configManagerStub.updateDontShowConfigManuallyChangedMessage
                .called,
            ).to.be.false;
            expect(configManagerStub.updateDisableDetection.called).to.be.false;
            expect(configManagerStub.updateAutoReload.called).to.be.false;
            expect(handleUpdatePresetStub.calledOnceWithExactly(cb, cbArgs)).to
              .be.true;
          });
        });
      });

      context(`when NO implemented action is requested`, function () {
        it(`does nothing`, async function () {
          await handleAction.call(
            extensionManager,
            enums.LangResourceKeys.activate,
          );

          // @ts-ignore
          expect(extensionManager.customMsgShown).to.be.undefined;
          // @ts-ignore
          expect(extensionManager.doReload).to.be.undefined;
          // @ts-ignore
          expect(extensionManager.callback).to.be.undefined;
          // @ts-ignore
          expect(executeAndReloadStub.called).to.be.false;
          expect(
            configManagerStub.updateDontShowConfigManuallyChangedMessage.called,
          ).to.be.false;
          expect(configManagerStub.updateDisableDetection.called).to.be.false;
          expect(configManagerStub.updateAutoReload.called).to.be.false;
          expect(handleUpdatePresetStub.called).to.be.false;
        });
      });

      context('when conflicting project icons are detected', function () {
        context(`throws an Error`, function () {
          it(`when no callback arguments are provided`, async function () {
            try {
              await handleAction.call(
                extensionManager,
                'Angular',
                sinon.fake(),
              );
            } catch (error) {
              expect(error).to.match(/Arguments missing/);
            }
          });

          it(`when provided callback arguments are empty`, async function () {
            try {
              await handleAction.call(
                extensionManager,
                'Angular',
                sinon.fake(),
                [],
              );
            } catch (error) {
              expect(error).to.match(/Arguments missing/);
            }
          });
        });

        it('enables the Angular icons, if they are selected', async function () {
          const cb = sinon.fake();
          const cbArgs = [[{ project: 'ng' }]];

          await handleAction.call(extensionManager, 'Angular', cb, cbArgs);

          expect(cbArgs[0][0])
            .to.haveOwnProperty('project')
            .and.that.to.equal(enums.Projects.angular);
          expect(
            configManagerStub.updatePreset.calledOnceWithExactly(
              enums.PresetNames[enums.PresetNames.angular],
              true,
              enums.ConfigurationTarget.Workspace,
            ),
          ).to.be.true;
          expect(handleUpdatePresetStub.calledOnceWithExactly(cb, cbArgs)).to.be
            .true;
        });

        it('enables the NestJS icons, if they are selected', async function () {
          const cb = sinon.fake();
          const cbArgs = [[{ project: 'nest' }]];

          await handleAction.call(extensionManager, 'NestJS', cb, cbArgs);

          expect(cbArgs[0][0])
            .to.haveOwnProperty('project')
            .and.that.to.equal(enums.Projects.nestjs);
          expect(
            configManagerStub.updatePreset.calledOnceWithExactly(
              enums.PresetNames[enums.PresetNames.nestjs],
              true,
              enums.ConfigurationTarget.Workspace,
            ),
          ).to.be.true;
          expect(handleUpdatePresetStub.calledOnceWithExactly(cb, cbArgs)).to.be
            .true;
        });
      });
    });

    context(`the handle update preset`, function () {
      let handleUpdatePreset: (...arg: unknown[]) => void;

      beforeEach(function () {
        handleUpdatePreset =
          // @ts-ignore
          extensionManager.handleUpdatePreset as (...arg: unknown[]) => void;
      });

      context(`throws an Error`, function () {
        it(`when no callback is provided`, function () {
          expect(() => handleUpdatePreset.call(extensionManager)).to.throw(
            Error,
            /Callback function missing/,
          );
        });

        it(`when no callback arguments are provided`, function () {
          expect(() =>
            handleUpdatePreset.call(extensionManager, sinon.fake()),
          ).to.throw(Error, /Arguments missing/);
        });

        context(`when provided callback arguments`, function () {
          it(`are empty`, function () {
            expect(() =>
              handleUpdatePreset.call(extensionManager, sinon.fake(), []),
            ).to.throw(Error, /Arguments missing/);
          });

          it(`are mismatching`, function () {
            expect(() =>
              handleUpdatePreset.call(extensionManager, sinon.fake(), [
                'arg1',
                'arg2',
              ]),
            ).to.throw(Error, /Arguments mismatch/);
          });
        });
      });

      context(`when the preset is`, function () {
        let executeAndReloadStub: sinon.SinonStub;
        let applyCustomizationStub: sinon.SinonStub;

        beforeEach(function () {
          executeAndReloadStub = sandbox.stub(
            extensionManager,
            // @ts-ignore
            'executeAndReload',
          );
          applyCustomizationStub = sandbox.stub(
            extensionManager,
            // @ts-ignore
            'applyCustomization',
          );
        });

        context(`the same as the toggled value`, function () {
          context(`applies the customizations`, function () {
            it(`and reloads the editor`, function () {
              const cb = sinon.fake();
              const cbArgs = [
                enums.PresetNames[enums.PresetNames.angular],
                false,
              ];

              handleUpdatePreset.call(extensionManager, cb, cbArgs);

              // @ts-ignore
              expect(extensionManager.customMsgShown).to.be.undefined;
              // @ts-ignore
              expect(extensionManager.doReload).to.be.undefined;
              // @ts-ignore
              expect(extensionManager.callback).to.be.undefined;
              expect(configManagerStub.updateDisableDetection.called).to.be
                .false;
              expect(
                configManagerStub.updateDontShowConfigManuallyChangedMessage
                  .called,
              ).to.be.false;
              expect(
                executeAndReloadStub.calledOnceWith(applyCustomizationStub),
              ).to.be.true;
            });
          });
        });

        context(`different than the toggled value`, function () {
          context(`gets set to reload the editor`, function () {
            context(`applying the customizations`, function () {
              it(`and updates the settings`, function () {
                const cb = sinon.fake();
                const cbArgs = ['arg1', 'arg2', 'arg3'];

                handleUpdatePreset.call(extensionManager, cb, cbArgs);

                // @ts-ignore
                expect(extensionManager.customMsgShown).to.be.undefined;
                // @ts-ignore
                expect(extensionManager.doReload).to.be.true;
                // @ts-ignore
                expect(extensionManager.callback).to.equal(
                  applyCustomizationStub,
                );
                expect(configManagerStub.updateDisableDetection.called).to.be
                  .false;
                expect(
                  configManagerStub.updateDontShowConfigManuallyChangedMessage
                    .called,
                ).to.be.false;
                expect(cb.calledOnceWithExactly(...cbArgs)).to.be.true;
              });
            });
          });
        });
      });
    });
  });
});
