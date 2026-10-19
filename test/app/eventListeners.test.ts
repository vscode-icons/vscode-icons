import type * as types from '../../src/types';

import { expect } from 'chai';
import { cloneDeep } from 'lodash';
import * as sinon from 'sinon';

import { ExtensionManager } from '../../src/app/extensionManager';
import { ErrorHandler } from '../../src/common/errorHandler';
import { ConfigManager } from '../../src/configuration/configManager';
import { constants } from '../../src/constants';
import { IconsGenerator } from '../../src/iconsManifest';
import { NotificationManager } from '../../src/notification/notificationManager';
import { ProjectAutoDetectionManager } from '../../src/pad/projectAutoDetectionManager';
import { SettingsManager } from '../../src/settings/settingsManager';
import * as enums from '../../src/types/enums';
import { VSCodeManager } from '../../src/vscode/vscodeManager';
import { vsicons } from '../fixtures/vsicons';

describe('ExtensionManager: event listeners tests', function () {
  context('ensures that', function () {
    let sandbox: sinon.SinonSandbox;
    let vscodeManagerStub: sinon.SinonStubbedInstance<types.IVSCodeManager>;
    let configManagerStub: sinon.SinonStubbedInstance<types.IConfigManager>;
    let settingsManagerStub: sinon.SinonStubbedInstance<types.ISettingsManager>;
    let notifyManagerStub: sinon.SinonStubbedInstance<types.INotificationManager>;
    let iconsGeneratorStub: sinon.SinonStubbedInstance<types.IIconsGenerator>;
    let padMngStub: sinon.SinonStubbedInstance<types.IProjectAutoDetectionManager>;

    let onDidChangeConfigurationStub: sinon.SinonStub;
    let logErrorStub: sinon.SinonStub;

    let extensionManager: types.IExtensionManager;
    let vsiconsClone: types.IVSIcons;
    let state: types.IState;

    beforeEach(function () {
      sandbox = sinon.createSandbox();

      vscodeManagerStub =
        sandbox.createStubInstance<types.IVSCodeManager>(VSCodeManager);
      sandbox.stub(vscodeManagerStub, 'context').get(() => ({
        subscriptions: [],
      }));
      onDidChangeConfigurationStub = sandbox.stub();
      sandbox.stub(vscodeManagerStub, 'workspace').get(() => ({
        onDidChangeConfiguration: onDidChangeConfigurationStub,
      }));

      configManagerStub =
        sandbox.createStubInstance<types.IConfigManager>(ConfigManager);
      vsiconsClone = cloneDeep(vsicons);
      sandbox.stub(configManagerStub, 'vsicons').get(() => vsiconsClone);

      settingsManagerStub =
        sandbox.createStubInstance<types.ISettingsManager>(SettingsManager);
      notifyManagerStub =
        sandbox.createStubInstance<types.INotificationManager>(
          NotificationManager,
        );

      iconsGeneratorStub =
        sandbox.createStubInstance<types.IIconsGenerator>(IconsGenerator);

      padMngStub =
        sandbox.createStubInstance<types.IProjectAutoDetectionManager>(
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
                state.status = enums.ExtensionStatus.deactivated;
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
                    enums.ExtensionStatus.activated,
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
                state.status = enums.ExtensionStatus.activated;
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
                state.status = enums.ExtensionStatus.activated;
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
                    enums.ExtensionStatus.deactivated,
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
                state.status = enums.ExtensionStatus.deactivated;
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
                      enums.LangResourceKeys.dontShowThis,
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
                  configManagerStub.vsicons.dontShowConfigManuallyChangedMessage = true;

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
