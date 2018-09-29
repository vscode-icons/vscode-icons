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

describe('ExtensionManager: event listeners tests', function () {
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
    let extensionManager: models.IExtensionManager;
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
      sandbox.stub(vscodeManagerStub, 'version').get(() => '1.27.1');

      configManagerStub = sandbox.createStubInstance<models.IConfigManager>(
        ConfigManager
      );
      vsiconsClone = cloneDeep(vsicons);
      sandbox.stub(configManagerStub, 'vsicons').get(() => vsiconsClone);

      settingsManagerStub = sandbox.createStubInstance<models.ISettingsManager>(
        SettingsManager
      );
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

    context(`the listener on configuration changes`, function () {
      let affectsConfigurationStub: sinon.SinonStub;

      beforeEach(function () {
        affectsConfigurationStub = sandbox.stub();
      });

      context(`throws an Error`, function () {
        it(`when the 'event' object does NOT exists`, function () {
          expect(() =>
            onDidChangeConfigurationStub.callArgOn(0, extensionManager)
          ).to.throw(Error, /Unsupported 'vscode' version: \d+\.\d+\.\d+/);
        });

        it(`when an 'event' object is NOT of the correct type`, function () {
          expect(() =>
            onDidChangeConfigurationStub.callArgOnWith(0, extensionManager, {})
          ).to.throw(Error, /Unsupported 'vscode' version: \d+\.\d+\.\d+/);
        });
      });

      context(`when the affected configuration is the icon theme`, function () {
        beforeEach(function () {
          affectsConfigurationStub.returns(true);
        });

        context(`and is set to this extension's name`, function () {
          beforeEach(function () {
            configManagerStub.getIconTheme.returns(constants.extension.name);
          });

          context(`and the 'status' is NOT 'activated'`, function () {
            context(`the 'status' gets set to`, function () {
              it(`'activated' and gets updated`, function () {
                settingsManagerStub.getState.returns({
                  status: models.ExtensionStatus.deactivated,
                });

                onDidChangeConfigurationStub.callArgOnWith(
                  0,
                  extensionManager,
                  {
                    affectsConfiguration: affectsConfigurationStub,
                  }
                );

                expect(
                  settingsManagerStub.updateStatus.calledOnceWithExactly(
                    models.ExtensionStatus.activated
                  )
                ).to.be.true;
                expect(
                  affectsConfigurationStub.calledOnceWithExactly(
                    constants.vscode.iconThemeSetting
                  )
                ).to.be.true;
              });
            });
          });

          context(`and the 'status' is 'activated'`, function () {
            context(`the 'status' gets`, function () {
              it(`NOT updated`, function () {
                settingsManagerStub.getState.returns({
                  status: models.ExtensionStatus.activated,
                });

                onDidChangeConfigurationStub.callArgOnWith(
                  0,
                  extensionManager,
                  {
                    affectsConfiguration: affectsConfigurationStub,
                  }
                );

                expect(settingsManagerStub.updateStatus.called).to.be.false;
                expect(
                  affectsConfigurationStub.calledOnceWithExactly(
                    constants.vscode.iconThemeSetting
                  )
                ).to.be.true;
              });
            });
          });
        });

        context(`and is NOT set to this extension's name`, function () {
          beforeEach(function () {
            configManagerStub.getIconTheme.returns(undefined);
          });

          context(`and the 'status' is 'activated'`, function () {
            context(`the extension 'status' gets set to`, function () {
              it(`'deactivated' and gets updated`, function () {
                settingsManagerStub.getState.returns({
                  status: models.ExtensionStatus.activated,
                });

                onDidChangeConfigurationStub.callArgOnWith(
                  0,
                  extensionManager,
                  {
                    affectsConfiguration: affectsConfigurationStub,
                  }
                );

                expect(
                  settingsManagerStub.updateStatus.calledOnceWithExactly(
                    models.ExtensionStatus.deactivated
                  )
                ).to.be.true;
                expect(
                  affectsConfigurationStub.calledOnceWithExactly(
                    constants.vscode.iconThemeSetting
                  )
                ).to.be.true;
              });
            });
          });

          context(`and the 'status' is 'deactivated'`, function () {
            context(`the 'status' gets`, function () {
              it(`NOT updated`, function () {
                settingsManagerStub.getState.returns({
                  status: models.ExtensionStatus.deactivated,
                });

                onDidChangeConfigurationStub.callArgOnWith(
                  0,
                  extensionManager,
                  {
                    affectsConfiguration: affectsConfigurationStub,
                  }
                );

                expect(settingsManagerStub.updateStatus.called).to.be.false;
                expect(
                  affectsConfigurationStub.calledOnceWithExactly(
                    constants.vscode.iconThemeSetting
                  )
                ).to.be.true;
              });
            });
          });
        });
      });

      context(`when the affected configuration`, function () {
        let executeAndReloadStub: sinon.SinonStub;
        let applyCustomizationCommandStub: sinon.SinonStub;

        beforeEach(function () {
          executeAndReloadStub = sandbox.stub(
            extensionManager,
            // @ts-ignore
            'executeAndReload'
          );
          applyCustomizationCommandStub = sandbox.stub(
            extensionManager,
            // @ts-ignore
            'applyCustomizationCommand'
          );
          affectsConfigurationStub
            .onFirstCall()
            .returns(false)
            .returns(true);
        });

        context(`is the 'presets' or the 'associations'`, function () {
          context(`and is set to 'reload' the editor`, function () {
            it(`calls the 'executeAndReload' function`, function () {
              // @ts-ignore
              extensionManager.doReload = true;
              const timer = sandbox.useFakeTimers();

              onDidChangeConfigurationStub.callArgOnWith(0, extensionManager, {
                affectsConfiguration: affectsConfigurationStub,
              });

              expect(affectsConfigurationStub.calledTwice).to.be.true;
              // @ts-ignore
              expect(extensionManager.doReload).to.be.false;

              timer.tick(500);

              expect(
                executeAndReloadStub.calledOnceWithExactly(undefined)
              ).to.be.true;

              timer.restore();
            });
          });

          context(`and is NOT set to 'reload' the editor`, function () {
            context(`and is showing the custom message`, function () {
              beforeEach(function () {
                // @ts-ignore
                extensionManager.customMsgShown = true;
              });

              it(`does nothing`, function () {
                onDidChangeConfigurationStub.callArgOnWith(
                  0,
                  extensionManager,
                  {
                    affectsConfiguration: affectsConfigurationStub,
                  }
                );

                expect(applyCustomizationCommandStub.called).to.be.false;
              });
            });

            context(`and is NOT showing the custom message`, function () {
              beforeEach(function () {
                // @ts-ignore
                extensionManager.customMsgShown = false;
              });

              context(`does call 'applyCustomizationCommand'`, function () {
                it(`when the configuration has changed`, function () {
                  configManagerStub.hasConfigChanged.returns(true);

                  onDidChangeConfigurationStub.callArgOnWith(
                    0,
                    extensionManager,
                    {
                      affectsConfiguration: affectsConfigurationStub,
                    }
                  );

                  expect(
                    configManagerStub.hasConfigChanged.calledOnceWithExactly(
                      vsiconsClone,
                      [
                        constants.vsicons.presets.name,
                        constants.vsicons.associations.name,
                      ]
                    )
                  ).to.be.true;
                  expect(
                    applyCustomizationCommandStub.calledOnceWithExactly([
                      models.LangResourceKeys.dontShowThis,
                    ])
                  ).to.be.true;
                });
              });

              context(`does NOT call 'applyCustomizationCommand'`, function () {
                it(`when the configuration has NOT changed`, function () {
                  configManagerStub.hasConfigChanged.returns(false);

                  onDidChangeConfigurationStub.callArgOnWith(
                    0,
                    extensionManager,
                    {
                      affectsConfiguration: affectsConfigurationStub,
                    }
                  );

                  expect(
                    configManagerStub.hasConfigChanged.calledOnceWithExactly(
                      vsiconsClone,
                      [
                        constants.vsicons.presets.name,
                        constants.vsicons.associations.name,
                      ]
                    )
                  ).to.be.true;
                  expect(applyCustomizationCommandStub.called).to.be.false;
                });

                it(`when set NOT to show the custom message`, function () {
                  configManagerStub.vsicons.dontShowConfigManuallyChangedMessage = true;

                  onDidChangeConfigurationStub.callArgOnWith(
                    0,
                    extensionManager,
                    {
                      affectsConfiguration: affectsConfigurationStub,
                    }
                  );

                  expect(configManagerStub.hasConfigChanged.called).to.be.false;
                  expect(applyCustomizationCommandStub.called).to.be.false;
                });
              });
            });
          });
        });

        context(`is NOT the 'presets' or the 'associations'`, function () {
          it(`does nothing`, function () {
            affectsConfigurationStub.returns(false);

            onDidChangeConfigurationStub.callArgOnWith(0, extensionManager, {
              affectsConfiguration: affectsConfigurationStub,
            });

            expect(affectsConfigurationStub.calledThrice).to.be.true;
            expect(applyCustomizationCommandStub.called).to.be.false;
            expect(executeAndReloadStub.called).to.be.false;
          });
        });
      });
    });
  });
});
