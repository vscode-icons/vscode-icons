/* eslint-disable prefer-arrow-callback */
/* eslint-disable no-unused-expressions */
import { expect } from 'chai';
import { cloneDeep } from 'lodash';
import * as sinon from 'sinon';
import { ExtensionManager } from '../../src/app/extensionManager';
import { ErrorHandler } from '../../src/common/errorHandler';
import { ConfigManager } from '../../src/configuration/configManager';
import { constants } from '../../src/constants';
import { IconsGenerator } from '../../src/iconsManifest';
import { IntegrityManager } from '../../src/integrity/integrityManager';
import * as models from '../../src/models';
import { NotificationManager } from '../../src/notification/notificationManager';
import { ProjectAutoDetectionManager } from '../../src/pad/projectAutoDetectionManager';
import { SettingsManager } from '../../src/settings/settingsManager';
import { VSCodeManager } from '../../src/vscode/vscodeManager';
import { vsicons } from '../fixtures/vsicons';

describe('ExtensionManager: event listeners tests', function () {
  context('ensures that', function () {
    let sandbox: sinon.SinonSandbox;
    let vscodeManagerStub: sinon.SinonStubbedInstance<models.IVSCodeManager>;
    let configManagerStub: sinon.SinonStubbedInstance<models.IConfigManager>;
    let settingsManagerStub: sinon.SinonStubbedInstance<models.ISettingsManager>;
    let notifyManagerStub: sinon.SinonStubbedInstance<models.INotificationManager>;
    let iconsGeneratorStub: sinon.SinonStubbedInstance<models.IIconsGenerator>;
    let padMngStub: sinon.SinonStubbedInstance<models.IProjectAutoDetectionManager>;
    let integrityManagerStub: sinon.SinonStubbedInstance<models.IIntegrityManager>;

    let onDidChangeConfigurationStub: sinon.SinonStub;
    let logErrorStub: sinon.SinonStub;

    let extensionManager: models.IExtensionManager;
    let vsiconsClone: models.IVSIcons;
    let state: models.IState;

    beforeEach(function () {
      sandbox = sinon.createSandbox();

      vscodeManagerStub =
        sandbox.createStubInstance<models.IVSCodeManager>(VSCodeManager);
      sandbox.stub(vscodeManagerStub, 'context').get(() => ({
        subscriptions: [],
      }));
      onDidChangeConfigurationStub = sandbox.stub();
      sandbox.stub(vscodeManagerStub, 'workspace').get(() => ({
        onDidChangeConfiguration: onDidChangeConfigurationStub,
      }));

      configManagerStub =
        sandbox.createStubInstance<models.IConfigManager>(ConfigManager);
      vsiconsClone = cloneDeep(vsicons);
      sandbox.stub(configManagerStub, 'vsicons').get(() => vsiconsClone);

      settingsManagerStub =
        sandbox.createStubInstance<models.ISettingsManager>(SettingsManager);
      notifyManagerStub =
        sandbox.createStubInstance<models.INotificationManager>(
          NotificationManager,
        );

      iconsGeneratorStub =
        sandbox.createStubInstance<models.IIconsGenerator>(IconsGenerator);

      padMngStub =
        sandbox.createStubInstance<models.IProjectAutoDetectionManager>(
          ProjectAutoDetectionManager,
        );

      integrityManagerStub =
        sandbox.createStubInstance<models.IIntegrityManager>(IntegrityManager);

      extensionManager = new ExtensionManager(
        vscodeManagerStub,
        configManagerStub,
        settingsManagerStub,
        notifyManagerStub,
        iconsGeneratorStub,
        padMngStub,
        integrityManagerStub,
      );

      logErrorStub = sandbox.stub(ErrorHandler, 'logError');

      state = SettingsManager.defaultState;
    });

    afterEach(function () {
      sandbox.restore();
    });

    context(`the listener on configuration changes`, function () {
      let affectsConfigurationStub: sinon.SinonStub;

      beforeEach(function () {
        affectsConfigurationStub = sandbox.stub();
      });

      context(`when the affected configuration is the icon theme`, function () {
        beforeEach(function () {
          affectsConfigurationStub.returns(true);
        });

        context(`and is set to this extension's name`, function () {
          beforeEach(function () {
            configManagerStub.getIconTheme.returns(constants.extension.name);
          });

          it(`logs an Error, when 'updateStatus' fails`, function () {
            settingsManagerStub.getState.returns(state);
            settingsManagerStub.updateStatus.throws();

            onDidChangeConfigurationStub.callArgOnWith(0, extensionManager, {
              affectsConfiguration: affectsConfigurationStub,
            });

            expect(logErrorStub.called).to.be.true;
          });

          context(`and the 'status' is NOT 'activated'`, function () {
            context(`the 'status' gets set to`, function () {
              it(`'activated' and gets updated`, function () {
                state.status = models.ExtensionStatus.deactivated;
                settingsManagerStub.getState.returns(state);
                settingsManagerStub.updateStatus.resolves();

                onDidChangeConfigurationStub.callArgOnWith(
                  0,
                  extensionManager,
                  {
                    affectsConfiguration: affectsConfigurationStub,
                  },
                );

                expect(
                  settingsManagerStub.updateStatus.calledOnceWithExactly(
                    models.ExtensionStatus.activated,
                  ),
                ).to.be.true;
                expect(
                  affectsConfigurationStub.calledOnceWithExactly(
                    constants.vscode.iconThemeSetting,
                  ),
                ).to.be.true;
              });
            });
          });

          context(`and the 'status' is 'activated'`, function () {
            context(`the 'status' gets`, function () {
              it(`NOT updated`, function () {
                state.status = models.ExtensionStatus.activated;
                settingsManagerStub.getState.returns(state);

                onDidChangeConfigurationStub.callArgOnWith(
                  0,
                  extensionManager,
                  {
                    affectsConfiguration: affectsConfigurationStub,
                  },
                );

                expect(settingsManagerStub.updateStatus.called).to.be.false;
                expect(
                  affectsConfigurationStub.calledOnceWithExactly(
                    constants.vscode.iconThemeSetting,
                  ),
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
                state.status = models.ExtensionStatus.activated;
                settingsManagerStub.getState.returns(state);
                settingsManagerStub.updateStatus.resolves();

                onDidChangeConfigurationStub.callArgOnWith(
                  0,
                  extensionManager,
                  {
                    affectsConfiguration: affectsConfigurationStub,
                  },
                );

                expect(
                  settingsManagerStub.updateStatus.calledOnceWithExactly(
                    models.ExtensionStatus.deactivated,
                  ),
                ).to.be.true;
                expect(
                  affectsConfigurationStub.calledOnceWithExactly(
                    constants.vscode.iconThemeSetting,
                  ),
                ).to.be.true;
              });
            });
          });

          context(`and the 'status' is 'deactivated'`, function () {
            context(`the 'status' gets`, function () {
              it(`NOT updated`, function () {
                state.status = models.ExtensionStatus.deactivated;
                settingsManagerStub.getState.returns(state);

                onDidChangeConfigurationStub.callArgOnWith(
                  0,
                  extensionManager,
                  {
                    affectsConfiguration: affectsConfigurationStub,
                  },
                );

                expect(settingsManagerStub.updateStatus.called).to.be.false;
                expect(
                  affectsConfigurationStub.calledOnceWithExactly(
                    constants.vscode.iconThemeSetting,
                  ),
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
            'executeAndReload',
          );
          applyCustomizationCommandStub = sandbox.stub(
            extensionManager,
            // @ts-ignore
            'applyCustomizationCommand',
          );
          affectsConfigurationStub.onFirstCall().returns(false).returns(true);
        });

        context(`is the 'presets' or the 'associations'`, function () {
          context(`and is set to 'reload' the editor`, function () {
            it(`calls the 'executeAndReload' function`, function () {
              const timer = sandbox.useFakeTimers();

              // @ts-ignore
              extensionManager.doReload = true;

              onDidChangeConfigurationStub.callArgOnWith(0, extensionManager, {
                affectsConfiguration: affectsConfigurationStub,
              });

              expect(affectsConfigurationStub.calledTwice).to.be.true;
              // @ts-ignore
              expect(extensionManager.doReload).to.be.false;

              timer.tick(500);

              expect(executeAndReloadStub.calledOnceWithExactly(undefined)).to
                .be.true;

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
                  },
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
                    },
                  );

                  expect(
                    configManagerStub.hasConfigChanged.calledOnceWithExactly(
                      vsiconsClone,
                      [
                        constants.vsicons.presets.name,
                        constants.vsicons.associations.name,
                      ],
                    ),
                  ).to.be.true;
                  expect(
                    applyCustomizationCommandStub.calledOnceWithExactly([
                      models.LangResourceKeys.dontShowThis,
                    ]),
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
                    },
                  );

                  expect(
                    configManagerStub.hasConfigChanged.calledOnceWithExactly(
                      vsiconsClone,
                      [
                        constants.vsicons.presets.name,
                        constants.vsicons.associations.name,
                      ],
                    ),
                  ).to.be.true;
                  expect(applyCustomizationCommandStub.called).to.be.false;
                });

                it(`when set NOT to show the custom message`, function () {
                  configManagerStub.vsicons.dontShowConfigManuallyChangedMessage =
                    true;

                  onDidChangeConfigurationStub.callArgOnWith(
                    0,
                    extensionManager,
                    {
                      affectsConfiguration: affectsConfigurationStub,
                    },
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
