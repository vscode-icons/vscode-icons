// tslint:disable only-arrow-functions
// tslint:disable no-unused-expression
import { expect } from 'chai';
import * as sinon from 'sinon';
import * as models from '../../src/models';
import { VSCodeManager } from '../../src/vscode/vscodeManager';
import { ConfigManager } from '../../src/configuration/configManager';
import { SettingsManager } from '../../src/settings/settingsManager';
import { NotificationManager } from '../../src/notification/notificationManager';
import { IconsGenerator } from '../../src/iconsManifest';
import { ProjectAutoDetectionManager } from '../../src/pad/projectAutoDetectionManager';
import { ExtensionManager } from '../../src/app/extensionManager';

describe('ExtensionManager: commands tests', function () {
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
    let showCustomizationMessageStub: sinon.SinonStub;
    let togglePresetStub: sinon.SinonStub;
    let extensionManager: models.IExtensionManager;

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
      sandbox.stub(vscodeManagerStub, 'commands').get(() => ({
        registerCommand: registerCommandStub,
        executeCommand: sandbox.stub(),
      }));

      configManagerStub = sandbox.createStubInstance<models.IConfigManager>(
        ConfigManager
      );

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

      showCustomizationMessageStub = sandbox.stub(
        extensionManager,
        // @ts-ignore
        'showCustomizationMessage'
      );

      togglePresetStub = sandbox.stub(
        extensionManager,
        // @ts-ignore
        'togglePreset'
      );
    });

    afterEach(function () {
      sandbox.restore();
    });

    context(`registering the commands`, function () {
      let commands: any[];
      let reflectGetSpy: sinon.SinonSpy;

      beforeEach(function () {
        reflectGetSpy = sandbox.spy(Reflect, 'get');
      });

      it(`reflects the provided callbacks`, function () {
        commands = [
          { command: 'activateIcons', callbackName: 'activationCommand' },
        ];

        // @ts-ignore
        extensionManager.registerCommands(commands);

        expect(reflectGetSpy.returned(undefined)).to.be.false;
      });

      it(`uses an empty function, when the callback does NOT exist`, function () {
        commands = [{ command: '', callbackName: '' }];

        // @ts-ignore
        extensionManager.registerCommands(commands);
        registerCommandStub.callArg(1);

        expect(reflectGetSpy.returned(undefined)).to.be.true;
        expect(
          registerCommandStub.calledOnceWith(commands[0].command)
        ).to.be.true;
      });
    });

    context(`the activation command`, function () {
      it(`updates the icon theme setting`, function () {
        // @ts-ignore
        extensionManager.activationCommand();

        expect(
          configManagerStub.updateIconTheme.calledOnceWithExactly()
        ).to.be.true;
      });
    });

    context(`the apply customization command`, function () {
      context(`shows the customization message`, function () {
        it(`with 'applyCustomization' as callback`, function () {
          const applyCustomizationStub = sandbox.stub(
            extensionManager,
            // @ts-ignore
            'applyCustomization'
          );

          // @ts-ignore
          extensionManager.applyCustomizationCommand();

          expect(
            showCustomizationMessageStub.calledOnceWithExactly(
              `%s %s`,
              [
                models.LangResourceKeys.iconCustomization,
                models.LangResourceKeys.restart,
                models.LangResourceKeys.reload,
                ...[],
              ],
              applyCustomizationStub
            )
          ).to.be.true;
        });
      });
    });

    context(`the restore default manifest command`, function () {
      context(`shows the customization message`, function () {
        it(`with 'restoreManifest' as callback`, function () {
          const restoreManifestStub = sandbox.stub(
            extensionManager,
            // @ts-ignore
            'restoreManifest'
          );

          // @ts-ignore
          extensionManager.restoreDefaultManifestCommand();

          expect(
            showCustomizationMessageStub.calledOnceWithExactly(
              `%s %s`,
              [
                models.LangResourceKeys.iconRestore,
                models.LangResourceKeys.restart,
                models.LangResourceKeys.reload,
                ...[],
              ],
              restoreManifestStub
            )
          ).to.be.true;
        });
      });
    });

    context(`the reset project detection defaults command`, function () {
      context(`shows the customization message`, function () {
        it(`with 'resetProjectDetectionDefaults' as callback`, function () {
          const resetProjectDetectionDefaultsStub = sandbox.stub(
            extensionManager,
            // @ts-ignore
            'resetProjectDetectionDefaults'
          );

          // @ts-ignore
          extensionManager.resetProjectDetectionDefaultsCommand();

          expect(
            showCustomizationMessageStub.calledOnceWithExactly(
              `%s %s`,
              [
                models.LangResourceKeys.projectDetectionReset,
                models.LangResourceKeys.restart,
                models.LangResourceKeys.reload,
                ...[],
              ],
              resetProjectDetectionDefaultsStub
            )
          ).to.be.true;
        });
      });
    });

    context(`the toggle angular preset command`, function () {
      it(`toggles the angular preset`, function () {
        // @ts-ignore
        extensionManager.toggleAngularPresetCommand();

        expect(
          togglePresetStub.calledOnceWithExactly(
            models.PresetNames.angular,
            models.CommandNames.ngPreset,
            false,
            models.ConfigurationTarget.Workspace
          )
        ).to.be.true;
      });
    });

    context(`the toggle js preset command`, function () {
      it(`toggles the js preset`, function () {
        // @ts-ignore
        extensionManager.toggleJsPresetCommand();

        expect(
          togglePresetStub.calledOnceWithExactly(
            models.PresetNames.jsOfficial,
            models.CommandNames.jsPreset,
            false,
            models.ConfigurationTarget.Global
          )
        ).to.be.true;
      });
    });

    context(`the toggle ts preset command`, function () {
      it(`toggles the ts preset`, function () {
        // @ts-ignore
        extensionManager.toggleTsPresetCommand();

        expect(
          togglePresetStub.calledOnceWithExactly(
            models.PresetNames.tsOfficial,
            models.CommandNames.tsPreset,
            false,
            models.ConfigurationTarget.Global
          )
        ).to.be.true;
      });
    });

    context(`the toggle json preset command`, function () {
      it(`toggles the json preset`, function () {
        // @ts-ignore
        extensionManager.toggleJsonPresetCommand();

        expect(
          togglePresetStub.calledOnceWithExactly(
            models.PresetNames.jsonOfficial,
            models.CommandNames.jsonPreset,
            false,
            models.ConfigurationTarget.Global
          )
        ).to.be.true;
      });
    });

    context(`the toggle hide folders preset command`, function () {
      it(`toggles the hide folders preset`, function () {
        // @ts-ignore
        extensionManager.toggleHideFoldersPresetCommand();

        expect(
          togglePresetStub.calledOnceWithExactly(
            models.PresetNames.hideFolders,
            models.CommandNames.hideFoldersPreset,
            true,
            models.ConfigurationTarget.Global
          )
        ).to.be.true;
      });
    });

    context(`the toggle folders all default icon preset command`, function () {
      it(`toggles the folders all default icon preset`, function () {
        // @ts-ignore
        extensionManager.toggleFoldersAllDefaultIconPresetCommand();

        expect(
          togglePresetStub.calledOnceWithExactly(
            models.PresetNames.foldersAllDefaultIcon,
            models.CommandNames.foldersAllDefaultIconPreset,
            true,
            models.ConfigurationTarget.Global
          )
        ).to.be.true;
      });
    });

    context(`the toggle hide explorer arrows preset command`, function () {
      it(`toggles the hide explorer arrows preset`, function () {
        // @ts-ignore
        extensionManager.toggleHideExplorerArrowsPresetCommand();

        expect(
          togglePresetStub.calledOnceWithExactly(
            models.PresetNames.hideExplorerArrows,
            models.CommandNames.hideExplorerArrowsPreset,
            true,
            models.ConfigurationTarget.Global
          )
        ).to.be.true;
      });
    });
  });
});
