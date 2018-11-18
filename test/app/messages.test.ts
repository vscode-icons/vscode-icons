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
import { ErrorHandler } from '../../src/errorHandler';
import { Utils } from '../../src/utils';
import { vsicons } from '../fixtures/vsicons';

describe('ExtensionManager: messages tests', function () {
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
    let logErrorStub: sinon.SinonStub;
    let extensionManager: models.IExtensionManager;
    let isNewVersion: boolean;
    let vsiconsClone: models.IVSIcons;

    beforeEach(function () {
      sandbox = sinon.createSandbox();

      vscodeManagerStub = sandbox.createStubInstance<models.IVSCodeManager>(
        VSCodeManager,
      );
      sandbox.stub(vscodeManagerStub, 'context').get(() => ({
        subscriptions: [],
      }));
      onDidChangeConfigurationStub = sandbox.stub();
      sandbox.stub(vscodeManagerStub, 'workspace').get(() => ({
        onDidChangeConfiguration: onDidChangeConfigurationStub,
      }));

      configManagerStub = sandbox.createStubInstance<models.IConfigManager>(
        ConfigManager,
      );
      vsiconsClone = cloneDeep(vsicons);
      sandbox.stub(configManagerStub, 'vsicons').get(() => vsiconsClone);

      settingsManagerStub = sandbox.createStubInstance<models.ISettingsManager>(
        SettingsManager,
      );
      isNewVersion = false;
      sandbox.stub(settingsManagerStub, 'isNewVersion').get(() => isNewVersion);

      notifyManagerStub = sandbox.createStubInstance<
        models.INotificationManager
      >(NotificationManager);

      iconsGeneratorStub = sandbox.createStubInstance<models.IIconsGenerator>(
        IconsGenerator,
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
        padMngStub,
      );

      logErrorStub = sandbox.stub(ErrorHandler, 'logError');
    });

    afterEach(function () {
      sandbox.restore();
    });

    context(`managing the intro message`, function () {
      let showWelcomeMessageStub: sinon.SinonStub;
      let showNewVersionMessageStub: sinon.SinonStub;

      beforeEach(function () {
        showWelcomeMessageStub = sandbox.stub(
          extensionManager,
          // @ts-ignore
          'showWelcomeMessage',
        );
        showNewVersionMessageStub = sandbox.stub(
          extensionManager,
          // @ts-ignore
          'showNewVersionMessage',
        );
      });

      context(`the welcome message gets`, function () {
        context(`shown`, function () {
          beforeEach(function () {
            settingsManagerStub.getState.returns({
              welcomeShown: false,
            });
            configManagerStub.getIconTheme.returns(undefined);
          });

          it(`when the 'welcomeShown' setting is 'false'`, function () {
            // @ts-ignore
            extensionManager.manageIntroMessage();

            expect(showWelcomeMessageStub.calledOnceWithExactly()).to.be.true;
            expect(showNewVersionMessageStub.called).to.be.false;
          });

          it(`when the icon theme is NOT set to this extension`, function () {
            // @ts-ignore
            extensionManager.manageIntroMessage();

            expect(showWelcomeMessageStub.calledOnceWithExactly()).to.be.true;
            expect(showNewVersionMessageStub.called).to.be.false;
          });
        });

        context(`NOT shown`, function () {
          beforeEach(function () {
            settingsManagerStub.getState.returns({
              welcomeShown: true,
            });
            configManagerStub.getIconTheme.returns(constants.extension.name);
          });

          it(`when the 'welcomeShown' setting is 'true'`, function () {
            // @ts-ignore
            extensionManager.manageIntroMessage();

            expect(showWelcomeMessageStub.called).to.be.false;
            expect(showNewVersionMessageStub.called).to.be.false;
          });

          it(`when the icon theme is set to this extension`, function () {
            // @ts-ignore
            extensionManager.manageIntroMessage();

            expect(showWelcomeMessageStub.called).to.be.false;
            expect(showNewVersionMessageStub.called).to.be.false;
          });
        });
      });

      context(`the new version message gets`, function () {
        beforeEach(function () {
          settingsManagerStub.getState.returns({
            welcomeShown: true,
          });
          configManagerStub.getIconTheme.returns(constants.extension.name);
        });

        context(`shown`, function () {
          beforeEach(function () {
            isNewVersion = true;
            configManagerStub.vsicons.dontShowNewVersionMessage = false;
          });

          it(`when the 'isNewVersion' setting is 'true'`, function () {
            // @ts-ignore
            extensionManager.manageIntroMessage();

            expect(settingsManagerStub.isNewVersion).to.be.true;
            expect(showWelcomeMessageStub.called).to.be.false;
            expect(
              showNewVersionMessageStub.calledOnceWithExactly(),
            ).to.be.true;
          });

          it(`when the 'dontShowNewVersionMessage' setting is 'false'`, function () {
            // @ts-ignore
            extensionManager.manageIntroMessage();

            expect(settingsManagerStub.isNewVersion).to.be.true;
            expect(showWelcomeMessageStub.called).to.be.false;
            expect(
              showNewVersionMessageStub.calledOnceWithExactly(),
            ).to.be.true;
          });
        });

        context(`NOT shown`, function () {
          beforeEach(function () {
            isNewVersion = false;
            configManagerStub.vsicons.dontShowNewVersionMessage = true;
          });

          it(`when the 'isNewVersion' setting is 'false'`, function () {
            // @ts-ignore
            extensionManager.manageIntroMessage();

            expect(settingsManagerStub.isNewVersion).to.be.false;
            expect(showWelcomeMessageStub.called).to.be.false;
            expect(showNewVersionMessageStub.called).to.be.false;
          });

          it(`when the 'dontShowNewVersionMessage' setting is 'true'`, function () {
            // @ts-ignore
            extensionManager.manageIntroMessage();

            expect(settingsManagerStub.isNewVersion).to.be.false;
            expect(showWelcomeMessageStub.called).to.be.false;
            expect(showNewVersionMessageStub.called).to.be.false;
          });
        });
      });
    });

    context(`managing the customizations`, function () {
      let applyCustomizationCommandStub: sinon.SinonStub;

      beforeEach(function () {
        // @ts-ignore
        sandbox.stub(Utils, 'unflattenProperties').returns({ vsicons });
        applyCustomizationCommandStub = sandbox.stub(
          extensionManager,
          // @ts-ignore
          'applyCustomizationCommand',
        );
      });

      context(`applies the customizations`, function () {
        context(`when there is a new version`, function () {
          it(`and the 'preset' or 'associations' configurations are different`, function () {
            isNewVersion = true;
            configManagerStub.hasConfigChanged.returns(true);

            // @ts-ignore
            extensionManager.manageCustomizations();

            expect(settingsManagerStub.isNewVersion).to.be.true;
            expect(
              applyCustomizationCommandStub.calledOnceWithExactly(),
            ).to.be.true;
          });
        });
      });

      context(`does NOT apply the customizations`, function () {
        context(`when there is a new version`, function () {
          it(`and the 'preset' or 'associatιons' configurations are NOT different`, function () {
            isNewVersion = true;
            configManagerStub.hasConfigChanged.returns(false);

            // @ts-ignore
            extensionManager.manageCustomizations();

            expect(settingsManagerStub.isNewVersion).to.be.true;
            expect(applyCustomizationCommandStub.called).to.be.false;
          });
        });

        context(`when there is NOT a new version`, function () {
          beforeEach(function () {
            isNewVersion = false;
          });

          context(
            `and the 'preset' or 'associatιons' configurations are`,
            function () {
              it(`different`, function () {
                configManagerStub.hasConfigChanged.returns(true);

                // @ts-ignore
                extensionManager.manageCustomizations();

                expect(settingsManagerStub.isNewVersion).to.be.false;
                expect(applyCustomizationCommandStub.called).to.be.false;
              });

              it(`NOT different`, function () {
                configManagerStub.hasConfigChanged.returns(false);

                // @ts-ignore
                extensionManager.manageCustomizations();

                expect(settingsManagerStub.isNewVersion).to.be.false;
                expect(applyCustomizationCommandStub.called).to.be.false;
              });
            },
          );
        });
      });
    });

    context(`showing the welcome message`, function () {
      it(`logs an Error, when displaying the message fails`, function () {
        const error = new Error();
        notifyManagerStub.notifyInfo.rejects(error);

        return (
          extensionManager
            // @ts-ignore
            .showWelcomeMessage()
            .then(
              () =>
                expect(logErrorStub.calledOnceWithExactly(error)).to.be.true,
            )
        );
      });

      context(`selecting`, function () {
        let activationCommandStub: sinon.SinonStub;
        let openStub: sinon.SinonStub;

        beforeEach(function () {
          activationCommandStub = sandbox.stub(
            extensionManager,
            // @ts-ignore
            'activationCommand',
          );
          openStub = sandbox.stub(Utils, 'open');
        });

        context(`an unsupported option`, function () {
          it(`does nothing`, function () {
            notifyManagerStub.notifyInfo.resolves();

            // @ts-ignore
            return extensionManager.showWelcomeMessage().then(() => {
              expect(
                notifyManagerStub.notifyInfo.calledOnceWithExactly(
                  models.LangResourceKeys.welcome,
                  models.LangResourceKeys.activate,
                  models.LangResourceKeys.aboutOfficialApi,
                  models.LangResourceKeys.seeReadme,
                ),
              ).to.be.true;
              expect(activationCommandStub.called).to.be.false;
              expect(openStub.called).to.be.false;
            });
          });
        });

        context(`to activate the extension`, function () {
          it(`calls the activation command`, function () {
            notifyManagerStub.notifyInfo.resolves(
              models.LangResourceKeys.activate,
            );

            // @ts-ignore
            return extensionManager.showWelcomeMessage().then(() => {
              expect(
                notifyManagerStub.notifyInfo.calledOnceWithExactly(
                  models.LangResourceKeys.welcome,
                  models.LangResourceKeys.activate,
                  models.LangResourceKeys.aboutOfficialApi,
                  models.LangResourceKeys.seeReadme,
                ),
              ).to.be.true;
              expect(activationCommandStub.calledOnceWithExactly()).to.be.true;
            });
          });
        });

        context(`to read about the official API`, function () {
          it(`opens the official API url and re-displays the message`, function () {
            notifyManagerStub.notifyInfo
              .onFirstCall()
              .resolves(models.LangResourceKeys.aboutOfficialApi)
              .resolves();

            // @ts-ignore
            return extensionManager.showWelcomeMessage().then(() => {
              expect(
                notifyManagerStub.notifyInfo.calledWithExactly(
                  models.LangResourceKeys.welcome,
                  models.LangResourceKeys.activate,
                  models.LangResourceKeys.aboutOfficialApi,
                  models.LangResourceKeys.seeReadme,
                ),
              ).to.be.true;
              expect(notifyManagerStub.notifyInfo.calledTwice).to.be.true;
              expect(openStub.calledOnceWithExactly(constants.urlOfficialApi))
                .to.be.true;
            });
          });
        });

        context(`to read about the extension`, function () {
          it(`opens the readme url and re-displays the message`, function () {
            notifyManagerStub.notifyInfo
              .onFirstCall()
              .resolves(models.LangResourceKeys.seeReadme)
              .resolves();

            // @ts-ignore
            return extensionManager.showWelcomeMessage().then(() => {
              expect(
                notifyManagerStub.notifyInfo.calledWithExactly(
                  models.LangResourceKeys.welcome,
                  models.LangResourceKeys.activate,
                  models.LangResourceKeys.aboutOfficialApi,
                  models.LangResourceKeys.seeReadme,
                ),
              ).to.be.true;
              expect(notifyManagerStub.notifyInfo.calledTwice).to.be.true;
              expect(openStub.calledOnceWithExactly(constants.urlReadme)).to.be
                .true;
            });
          });
        });
      });
    });

    context(`showing the new version message`, function () {
      it(`logs an Error, when displaying the message fails`, function () {
        const error = new Error();
        notifyManagerStub.notifyInfo.rejects(error);

        return (
          extensionManager
            // @ts-ignore
            .showNewVersionMessage()
            .then(
              () =>
                expect(logErrorStub.calledOnceWithExactly(error)).to.be.true,
            )
        );
      });

      context(`selecting`, function () {
        let openStub: sinon.SinonStub;

        beforeEach(function () {
          openStub = sandbox.stub(Utils, 'open');
        });

        context(`an unsupported option`, function () {
          it(`does nothing`, function () {
            notifyManagerStub.notifyInfo.resolves();

            // @ts-ignore
            return extensionManager.showNewVersionMessage().then(() => {
              expect(
                notifyManagerStub.notifyInfo.calledOnceWithExactly(
                  `%s v${constants.extension.version}`,
                  models.LangResourceKeys.newVersion,
                  models.LangResourceKeys.seeReleaseNotes,
                  models.LangResourceKeys.dontShowThis,
                ),
              ).to.be.true;
              expect(openStub.called).to.be.false;
              expect(configManagerStub.updateDontShowNewVersionMessage.called)
                .to.be.false;
            });
          });
        });

        context(`to read the release notes`, function () {
          it(`opens the release notes url`, function () {
            notifyManagerStub.notifyInfo
              .onFirstCall()
              .resolves(models.LangResourceKeys.seeReleaseNotes);

            // @ts-ignore
            return extensionManager.showNewVersionMessage().then(() => {
              expect(
                notifyManagerStub.notifyInfo.calledOnceWithExactly(
                  `%s v${constants.extension.version}`,
                  models.LangResourceKeys.newVersion,
                  models.LangResourceKeys.seeReleaseNotes,
                  models.LangResourceKeys.dontShowThis,
                ),
              ).to.be.true;
              expect(openStub.calledOnceWithExactly(constants.urlReleaseNote))
                .to.be.true;
            });
          });
        });

        context(`to NOT show this message again`, function () {
          it(`updates the configuration`, function () {
            notifyManagerStub.notifyInfo.resolves(
              models.LangResourceKeys.dontShowThis,
            );

            // @ts-ignore
            return extensionManager.showNewVersionMessage().then(() => {
              expect(
                notifyManagerStub.notifyInfo.calledOnceWithExactly(
                  `%s v${constants.extension.version}`,
                  models.LangResourceKeys.newVersion,
                  models.LangResourceKeys.seeReleaseNotes,
                  models.LangResourceKeys.dontShowThis,
                ),
              ).to.be.true;
              expect(
                configManagerStub.updateDontShowNewVersionMessage.calledOnceWithExactly(
                  true,
                ),
              ).to.be.true;
            });
          });
        });
      });
    });

    context(`showing the customization message`, function () {
      it(`calls the action handler`, function () {
        const message = 'test';
        const items = ['item'];
        const cb = sinon.fake();
        const cbArgs = [];
        notifyManagerStub.notifyInfo.resolves('btn');
        // @ts-ignore
        const handleActionStub = sandbox.stub(extensionManager, 'handleAction');

        return (
          extensionManager
            // @ts-ignore
            .showCustomizationMessage(message, items, cb, cbArgs)
            .then(() => {
              expect(
                notifyManagerStub.notifyInfo.calledOnceWithExactly(
                  message,
                  ...items,
                ),
              ).to.be.true;
              expect(handleActionStub.calledOnceWithExactly('btn', cb, cbArgs))
                .to.be.true;
            })
        );
      });

      it(`logs an Error, when displaying the message fails `, function () {
        const message = 'test';
        const items = ['item'];
        const error = new Error();
        notifyManagerStub.notifyInfo.rejects(error);

        return (
          extensionManager
            // @ts-ignore
            .showCustomizationMessage(message, ...items)
            .then(
              () =>
                expect(logErrorStub.calledOnceWithExactly(error)).to.be.true,
            )
        );
      });
    });
  });
});
