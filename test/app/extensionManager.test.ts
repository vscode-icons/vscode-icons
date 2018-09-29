// tslint:disable only-arrow-functions
// tslint:disable no-unused-expression
import { expect } from 'chai';
import * as sinon from 'sinon';
import { cloneDeep } from 'lodash';
import * as models from '../../src/models';
import { constants } from '../../src/constants';
import { VSCodeManager } from '../../src/vscode/vscodeManager';
import { ConfigManager } from '../../src/configuration/configManager';
import { SettingsManager } from '../../src/settings/settingsManager';
import { NotificationManager } from '../../src/notification/notificationManager';
import { IconsGenerator } from '../../src/iconsManifest';
import { ProjectAutoDetectionManager } from '../../src/pad/projectAutoDetectionManager';
import { ExtensionManager } from '../../src/app/extensionManager';
import { vsicons } from '../fixtures/vsicons';

describe('ExtensionManager: tests', function () {
  context('ensures that', function () {
    let sandbox: sinon.SinonSandbox;
    let vscodeManagerStub: sinon.SinonStubbedInstance<models.IVSCodeManager>;
    let configManagerStub: sinon.SinonStubbedInstance<models.IConfigManager>;
    let settingsManagerStub: sinon.SinonStubbedInstance<
      models.ISettingsManager
    >;
    let notifyManagerStub: sinon.SinonStubbedInstance<
      models.INotificationManager
    >;
    let iconsGeneratorStub: sinon.SinonStubbedInstance<models.IIconsGenerator>;
    let padMngStub: sinon.SinonStubbedInstance<
      models.IProjectAutoDetectionManager
    >;
    let onDidChangeConfigurationStub: sinon.SinonStub;
    let registerCommandStub: sinon.SinonStub;
    let executeCommandStub: sinon.SinonStub;
    let extensionManager: models.IExtensionManager;
    let isNewVersion: boolean;
    let vsiconsClone: models.IVSIcons;

    beforeEach(function () {
      sandbox = sinon.createSandbox();

      vscodeManagerStub = sandbox.createStubInstance<models.IVSCodeManager>(
        VSCodeManager
      );
      sandbox.stub(vscodeManagerStub, 'context').get(() => ({
        subscriptions: [],
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

      configManagerStub = sandbox.createStubInstance<models.IConfigManager>(
        ConfigManager
      );
      vsiconsClone = cloneDeep(vsicons);
      sandbox.stub(configManagerStub, 'vsicons').get(() => vsiconsClone);

      settingsManagerStub = sandbox.createStubInstance<models.ISettingsManager>(
        SettingsManager
      );
      isNewVersion = false;
      sandbox.stub(settingsManagerStub, 'isNewVersion').get(() => isNewVersion);

      notifyManagerStub = sandbox.createStubInstance<
        models.INotificationManager
      >(NotificationManager);

      iconsGeneratorStub = sandbox.createStubInstance<models.IIconsGenerator>(
        IconsGenerator
      );

      padMngStub = sandbox.createStubInstance<
        models.IProjectAutoDetectionManager
      >(ProjectAutoDetectionManager);

      extensionManager = new ExtensionManager(
        vscodeManagerStub,
        configManagerStub,
        settingsManagerStub,
        notifyManagerStub,
        iconsGeneratorStub,
        padMngStub
      );
    });

    afterEach(function () {
      sandbox.restore();
    });

    context(
      `on instantiation, an event listener for configuration changes`,
      function () {
        it(`is registered, when an instance of 'vscodeManager' is passed`, function () {
          expect(
            onDidChangeConfigurationStub.calledOnceWithExactly(
              // @ts-ignore
              extensionManager.didChangeConfigurationListener,
              extensionManager,
              vscodeManagerStub.context.subscriptions
            )
          ).to.be.true;
        });
      }
    );

    context(`on activation`, function () {
      let registerCommandsStub: sinon.SinonStub;
      let manageIntroMessageStub: sinon.SinonStub;
      let manageCustomizationsStub: sinon.SinonStub;

      beforeEach(function () {
        registerCommandsStub = sandbox.stub(
          extensionManager,
          // @ts-ignore
          'registerCommands'
        );
        manageIntroMessageStub = sandbox.stub(
          extensionManager,
          // @ts-ignore
          'manageIntroMessage'
        );
        manageCustomizationsStub = sandbox.stub(
          extensionManager,
          // @ts-ignore
          'manageCustomizations'
        );
        padMngStub.detectProjects.resolves();
        // @ts-ignore
        sandbox.stub(extensionManager, 'applyProjectDetection');
      });

      it(`functions are called with the specific order`, function () {
        isNewVersion = true;

        extensionManager.activate();

        expect(
          settingsManagerStub.moveStateFromLegacyPlace.calledOnceWithExactly()
        ).to.be.true;
        expect(
          registerCommandsStub.calledImmediatelyAfter(
            settingsManagerStub.moveStateFromLegacyPlace
          )
        ).to.be.true;
        expect(
          manageIntroMessageStub.calledImmediatelyAfter(registerCommandsStub)
        ).to.be.true;
        expect(
          manageCustomizationsStub.calledImmediatelyAfter(
            manageIntroMessageStub
          )
        ).to.be.true;
        expect(
          padMngStub.detectProjects.calledImmediatelyAfter(
            manageCustomizationsStub
          )
        ).to.be.true;
        expect(settingsManagerStub.isNewVersion).to.be.true;
        expect(
          settingsManagerStub.updateStatus.calledImmediatelyAfter(
            padMngStub.detectProjects
          )
        ).to.be.true;
      });

      it(`updates the status, if it's a new version`, function () {
        isNewVersion = true;

        extensionManager.activate();

        expect(settingsManagerStub.isNewVersion).to.be.true;
        expect(
          settingsManagerStub.updateStatus.calledImmediatelyAfter(
            padMngStub.detectProjects
          )
        ).to.be.true;
        expect(
          settingsManagerStub.updateStatus.calledOnceWithExactly()
        ).to.be.true;
      });

      it(`does NOT updates the status, if it's NOT a new version`, function () {
        isNewVersion = false;

        extensionManager.activate();

        expect(settingsManagerStub.updateStatus.called).to.be.false;
      });
    });

    context(`the execute and reload`, function () {
      context(`reloads the editor`, function () {
        it(`without executing the callback, when it's NOT provided`, function () {
          // @ts-ignore
          extensionManager.executeAndReload();

          expect(
            executeCommandStub.calledOnceWithExactly(
              constants.vscode.reloadWindowActionSetting
            )
          ).to.be.true;
        });

        it(`executing the callback first`, function () {
          const cb = sinon.fake();

          // @ts-ignore
          extensionManager.executeAndReload(cb);

          expect(cb.calledOnceWithExactly()).to.be.true;
          expect(
            executeCommandStub.calledOnceWithExactly(
              constants.vscode.reloadWindowActionSetting
            )
          ).to.be.true;
        });

        it(`executing the callback, with its arguments, first`, function () {
          const cb = sinon.fake();
          const cbArgs = ['arg1', 'arg2'];

          // @ts-ignore
          extensionManager.executeAndReload(cb, cbArgs);

          expect(cb.calledOnceWithExactly(...cbArgs)).to.be.true;
          expect(
            executeCommandStub.calledOnceWithExactly(
              constants.vscode.reloadWindowActionSetting
            )
          ).to.be.true;
        });
      });
    });

    context(`the handle action`, function () {
      let executeAndReloadStub: sinon.SinonStub;
      let handleUpdatePresetStub: sinon.SinonStub;

      beforeEach(function () {
        executeAndReloadStub = sandbox.stub(
          extensionManager,
          // @ts-ignore
          'executeAndReload'
        );
        handleUpdatePresetStub = sandbox.stub(
          extensionManager,
          // @ts-ignore
          'handleUpdatePreset'
        );
      });

      context(`when no action is requested`, function () {
        it(`only resets the 'customMsgShown'`, function () {
          // @ts-ignore
          extensionManager.handleAction();

          // @ts-ignore
          expect(extensionManager.customMsgShown).to.be.false;
          expect(executeAndReloadStub.called).to.be.false;
          expect(
            configManagerStub.updateDontShowConfigManuallyChangedMessage.called
          ).to.be.false;
          expect(configManagerStub.updateDisableDetection.called).to.be.false;
          expect(configManagerStub.updateAutoReload.called).to.be.false;
          expect(handleUpdatePresetStub.called).to.be.false;
        });
      });

      context(`when the 'dontShowThis' action is requested`, function () {
        context(`does NOT reload the editor`, function () {
          context(`when no callback is provided`, function () {
            it(`and does nothing`, function () {
              // @ts-ignore
              extensionManager.handleAction(
                models.LangResourceKeys.dontShowThis
              );

              // @ts-ignore
              expect(extensionManager.customMsgShown).to.be.undefined;
              expect(executeAndReloadStub.called).to.be.false;
              expect(
                configManagerStub.updateDisableDetection.called
              ).to.be.false;
              expect(configManagerStub.updateAutoReload.called).to.be.false;
              // @ts-ignore
              expect(extensionManager.doReload).to.be.false;
              expect(
                configManagerStub.updateDontShowConfigManuallyChangedMessage
                  .called
              ).to.be.false;
              expect(handleUpdatePresetStub.called).to.be.false;
            });
          });

          context(`when a callback is provided`, function () {
            context(`and is NOT 'applyCustomization'`, function () {
              it(`does nothing`, function () {
                // @ts-ignore
                extensionManager.handleAction(
                  models.LangResourceKeys.dontShowThis,
                  sandbox.spy()
                );

                // @ts-ignore
                expect(extensionManager.customMsgShown).to.be.undefined;
                expect(executeAndReloadStub.called).to.be.false;
                expect(
                  configManagerStub.updateDisableDetection.called
                ).to.be.false;
                expect(configManagerStub.updateAutoReload.called).to.be.false;
                // @ts-ignore
                expect(extensionManager.doReload).to.be.false;
                expect(
                  configManagerStub.updateDontShowConfigManuallyChangedMessage
                    .called
                ).to.be.false;
                expect(handleUpdatePresetStub.called).to.be.false;
              });
            });

            context(`and is 'applyCustomization'`, function () {
              it(`updates the setting`, function () {
                const cb = sinon.fake();
                Reflect.defineProperty(cb, 'name', {
                  value: 'applyCustomization',
                });

                // @ts-ignore
                extensionManager.handleAction(
                  models.LangResourceKeys.dontShowThis,
                  cb
                );

                // @ts-ignore
                expect(extensionManager.customMsgShown).to.be.false;
                expect(executeAndReloadStub.called).to.be.false;
                expect(
                  configManagerStub.updateDisableDetection.called
                ).to.be.false;
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
                    true
                  )
                ).to.be.true;
              });
            });
          });
        });
      });

      context(`when the 'disableDetect' action is requested`, function () {
        context(`does NOT reload the editor`, function () {
          it(`but updates the setting`, function () {
            // @ts-ignore
            extensionManager.handleAction(
              models.LangResourceKeys.disableDetect
            );

            // @ts-ignore
            expect(extensionManager.doReload).to.be.false;
            // @ts-ignore
            expect(extensionManager.customMsgShown).to.be.undefined;
            expect(executeAndReloadStub.called).to.be.false;
            expect(
              configManagerStub.updateDontShowConfigManuallyChangedMessage
                .called
            ).to.be.false;
            expect(configManagerStub.updateAutoReload.called).to.be.false;
            expect(handleUpdatePresetStub.called).to.be.false;
            expect(
              configManagerStub.updateDisableDetection.calledOnceWithExactly(
                true
              )
            ).to.be.true;
          });
        });
      });

      context(`when the 'autoReload' action is requested`, function () {
        beforeEach(function () {
          configManagerStub.updateAutoReload.resolves();
        });

        context(`updates the setting`, function () {
          it(`and handles the preset update`, function () {
            const cb = sinon.fake();
            const cbArgs = [];

            return (
              extensionManager
                // @ts-ignore
                .handleAction(models.LangResourceKeys.autoReload, cb, cbArgs)
                .then(() => {
                  // @ts-ignore
                  expect(extensionManager.customMsgShown).to.be.undefined;
                  // @ts-ignore
                  expect(extensionManager.doReload).to.be.undefined;
                  // @ts-ignore
                  expect(extensionManager.callback).to.equal(cb);
                  expect(configManagerStub.updateDisableDetection.called).to.be
                    .false;
                  expect(
                    configManagerStub.updateDontShowConfigManuallyChangedMessage
                      .called
                  ).to.be.false;
                  expect(
                    configManagerStub.updateAutoReload.calledOnceWithExactly(
                      true
                    )
                  ).to.be.true;
                  expect(
                    handleUpdatePresetStub.calledOnceWithExactly(cb, cbArgs)
                  ).to.be.true;
                })
            );
          });
        });
      });

      context(`when the 'reload' action is requested`, function () {
        context(`executes the callback and reloads the editor`, function () {
          it(`when no callback arguments are provided`, function () {
            const cb = sinon.fake();

            return (
              extensionManager
                // @ts-ignore
                .handleAction(models.LangResourceKeys.reload, cb)
                .then(() => {
                  // @ts-ignore
                  expect(extensionManager.customMsgShown).to.be.undefined;
                  // @ts-ignore
                  expect(extensionManager.doReload).to.be.undefined;
                  // @ts-ignore
                  expect(extensionManager.callback).to.equal(cb);
                  expect(
                    configManagerStub.updateDontShowConfigManuallyChangedMessage
                      .called
                  ).to.be.false;
                  expect(configManagerStub.updateDisableDetection.called).to.be
                    .false;
                  expect(configManagerStub.updateAutoReload.called).to.be.false;
                  expect(handleUpdatePresetStub.called).to.be.false;
                  expect(
                    executeAndReloadStub.calledOnceWithExactly(cb, undefined)
                  ).to.be.true;
                })
            );
          });

          it(`when callback arguments length is NOT the expected`, function () {
            const cb = sinon.fake();
            const cbArgs = ['arg1', 'arg2'];

            return (
              extensionManager
                // @ts-ignore
                .handleAction(models.LangResourceKeys.reload, cb, cbArgs)
                .then(() => {
                  // @ts-ignore
                  expect(extensionManager.customMsgShown).to.be.undefined;
                  // @ts-ignore
                  expect(extensionManager.doReload).to.be.undefined;
                  // @ts-ignore
                  expect(extensionManager.callback).to.equal(cb);
                  expect(
                    configManagerStub.updateDontShowConfigManuallyChangedMessage
                      .called
                  ).to.be.false;
                  expect(configManagerStub.updateDisableDetection.called).to.be
                    .false;
                  expect(configManagerStub.updateAutoReload.called).to.be.false;
                  expect(handleUpdatePresetStub.called).to.be.false;
                  expect(executeAndReloadStub.calledOnceWithExactly(cb, cbArgs))
                    .to.be.true;
                })
            );
          });
        });

        context(`handles the update preset`, function () {
          it(`when no callback arguments are provided`, function () {
            const cb = sinon.fake();
            const cbArgs = ['arg1', 'arg2', 'arg3'];

            return (
              extensionManager
                // @ts-ignore
                .handleAction(models.LangResourceKeys.reload, cb, cbArgs)
                .then(() => {
                  // @ts-ignore
                  expect(extensionManager.customMsgShown).to.be.undefined;
                  // @ts-ignore
                  expect(extensionManager.callback).to.equal(cb);
                  expect(executeAndReloadStub.called).to.be.false;
                  expect(
                    configManagerStub.updateDontShowConfigManuallyChangedMessage
                      .called
                  ).to.be.false;
                  expect(configManagerStub.updateDisableDetection.called).to.be
                    .false;
                  expect(configManagerStub.updateAutoReload.called).to.be.false;
                  expect(
                    handleUpdatePresetStub.calledOnceWithExactly(cb, cbArgs)
                  ).to.be.true;
                })
            );
          });
        });
      });

      context(`when NO implemented action is requested`, function () {
        it(`does nothing`, function () {
          // @ts-ignore
          extensionManager.handleAction(models.LangResourceKeys.activate);

          // @ts-ignore
          expect(extensionManager.customMsgShown).to.be.undefined;
          // @ts-ignore
          expect(extensionManager.doReload).to.be.undefined;
          // @ts-ignore
          expect(extensionManager.callback).to.be.undefined;
          // @ts-ignore
          expect(executeAndReloadStub.called).to.be.false;
          expect(
            configManagerStub.updateDontShowConfigManuallyChangedMessage.called
          ).to.be.false;
          expect(configManagerStub.updateDisableDetection.called).to.be.false;
          expect(configManagerStub.updateAutoReload.called).to.be.false;
          expect(handleUpdatePresetStub.called).to.be.false;
        });
      });
    });

    context(`the handle update preset`, function () {
      context(`throws an Error`, function () {
        it(`when no callback is provided`, function () {
          // @ts-ignore
          expect(() => extensionManager.handleUpdatePreset()).throw(
            Error,
            /Callback function missing/
          );
        });

        it(`when no callback arguments are is provided`, function () {
          expect(() =>
            // @ts-ignore
            extensionManager.handleUpdatePreset(sinon.fake())
          ).to.throw(Error, /Arguments missing/);
        });

        context(`when provided callback arguments`, function () {
          it(`are empty`, function () {
            expect(() =>
              // @ts-ignore
              extensionManager.handleUpdatePreset(sinon.fake(), [])
            ).to.throw(Error, /Arguments missing/);
          });

          it(`are mismatching`, function () {
            expect(() =>
              // @ts-ignore
              extensionManager.handleUpdatePreset(sinon.fake(), [
                'arg1',
                'arg2',
              ])
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
            'executeAndReload'
          );
          applyCustomizationStub = sandbox.stub(
            extensionManager,
            // @ts-ignore
            'applyCustomization'
          );
        });

        context(`the same as the toggled value`, function () {
          context(`applies the customizations`, function () {
            it(`and reloads the editor`, function () {
              const cb = sinon.fake();
              const cbArgs = [
                models.PresetNames[models.PresetNames.angular],
                false,
              ];

              // @ts-ignore
              extensionManager.handleUpdatePreset(cb, cbArgs);

              // @ts-ignore
              expect(extensionManager.customMsgShown).to.be.undefined;
              // @ts-ignore
              expect(extensionManager.doReload).to.be.undefined;
              // @ts-ignore
              expect(extensionManager.callback).to.be.undefined;
              expect(
                configManagerStub.updateDisableDetection.called
              ).to.be.false;
              expect(
                configManagerStub.updateDontShowConfigManuallyChangedMessage
                  .called
              ).to.be.false;
              expect(
                executeAndReloadStub.calledOnceWith(
                  applyCustomizationStub,
                  cbArgs
                )
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

                // @ts-ignore
                extensionManager.handleUpdatePreset(cb, cbArgs);

                // @ts-ignore
                expect(extensionManager.customMsgShown).to.be.undefined;
                // @ts-ignore
                expect(extensionManager.doReload).to.be.true;
                // @ts-ignore
                expect(extensionManager.callback).to.equal(
                  applyCustomizationStub
                );
                expect(
                  configManagerStub.updateDisableDetection.called
                ).to.be.false;
                expect(
                  configManagerStub.updateDontShowConfigManuallyChangedMessage
                    .called
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
