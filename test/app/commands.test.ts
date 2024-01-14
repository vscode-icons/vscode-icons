/* eslint-disable prefer-arrow-callback */
/* eslint-disable no-unused-expressions */
import { expect } from 'chai';
import * as sinon from 'sinon';
import { ExtensionManager } from '../../src/app/extensionManager';
import { ConfigManager } from '../../src/configuration/configManager';
import { IconsGenerator } from '../../src/iconsManifest';
import { IntegrityManager } from '../../src/integrity/integrityManager';
import * as models from '../../src/models';
import { NotificationManager } from '../../src/notification/notificationManager';
import { ProjectAutoDetectionManager } from '../../src/pad/projectAutoDetectionManager';
import { SettingsManager } from '../../src/settings/settingsManager';
import { VSCodeManager } from '../../src/vscode/vscodeManager';
import { IVSCodeCommand } from '../../src/models/vscode/vscodeCommand';

describe('ExtensionManager: commands tests', function () {
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
    let registerCommandStub: sinon.SinonStub;
    let showCustomizationMessageStub: sinon.SinonStub;
    let togglePresetStub: sinon.SinonStub;
    let extensionManager: models.IExtensionManager;

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
      registerCommandStub = sandbox.stub();
      sandbox.stub(vscodeManagerStub, 'commands').get(() => ({
        registerCommand: registerCommandStub,
        executeCommand: sandbox.stub(),
      }));

      configManagerStub =
        sandbox.createStubInstance<models.IConfigManager>(ConfigManager);

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

      showCustomizationMessageStub = sandbox.stub(
        extensionManager,
        // @ts-ignore
        'showCustomizationMessage',
      );

      togglePresetStub = sandbox.stub(
        extensionManager,
        // @ts-ignore
        'togglePreset',
      );
    });

    afterEach(function () {
      sandbox.restore();
    });

    context(`registering the commands`, function () {
      let commands: IVSCodeCommand[];
      let reflectGetSpy: sinon.SinonSpy;
      let registerCommands: (...arg: unknown[]) => void;

      beforeEach(function () {
        reflectGetSpy = sandbox.spy(Reflect, 'get');
        registerCommands =
          // @ts-ignore
          extensionManager.registerCommands as (...arg: unknown[]) => void;
      });

      it(`reflects the provided callbacks`, function () {
        commands = [
          {
            title: '',
            command: 'activateIcons',
            callbackName: 'activationCommand',
          },
        ];

        registerCommands.call(extensionManager, commands);

        expect(reflectGetSpy.returned(undefined)).to.be.false;
      });

      it(`uses an empty function, when the callback does NOT exist`, function () {
        commands = [{ title: '', command: '', callbackName: '' }];

        registerCommands.call(extensionManager, commands);
        registerCommandStub.callArg(1);

        expect(reflectGetSpy.returned(undefined)).to.be.true;
        expect(registerCommandStub.calledOnceWith(commands[0].command)).to.be
          .true;
      });
    });

    context(`the activation command`, function () {
      it(`updates the icon theme setting`, function () {
        const activationCommand =
          // @ts-ignore
          extensionManager.activationCommand as () => void;

        activationCommand.call(extensionManager);

        expect(configManagerStub.updateIconTheme.calledOnceWithExactly()).to.be
          .true;
      });
    });

    context(`the apply customization command`, function () {
      context(`shows the customization message`, function () {
        it(`with 'applyCustomization' as callback`, function () {
          const applyCustomizationCommand =
            // @ts-ignore
            extensionManager.applyCustomizationCommand as () => void;
          const applyCustomizationStub = sandbox.stub(
            extensionManager,
            // @ts-ignore
            'applyCustomization',
          );

          applyCustomizationCommand.call(extensionManager);

          expect(
            showCustomizationMessageStub.calledOnceWithExactly(
              `%s %s`,
              [
                models.LangResourceKeys.iconCustomization,
                models.LangResourceKeys.restart,
                models.LangResourceKeys.reload,
                ...[],
              ],
              applyCustomizationStub,
            ),
          ).to.be.true;
        });
      });
    });

    context(`the restore default manifest command`, function () {
      context(`shows the customization message`, function () {
        it(`with 'restoreManifest' as callback`, function () {
          const restoreDefaultManifestCommand =
            // @ts-ignore
            extensionManager.restoreDefaultManifestCommand as () => void;
          const restoreManifestStub = sandbox.stub(
            extensionManager,
            // @ts-ignore
            'restoreManifest',
          );

          restoreDefaultManifestCommand.call(extensionManager);

          expect(
            showCustomizationMessageStub.calledOnceWithExactly(
              `%s %s`,
              [
                models.LangResourceKeys.iconRestore,
                models.LangResourceKeys.restart,
                models.LangResourceKeys.reload,
                ...[],
              ],
              restoreManifestStub,
            ),
          ).to.be.true;
        });
      });
    });

    context(`the reset project detection defaults command`, function () {
      context(`shows the customization message`, function () {
        it(`with 'resetProjectDetectionDefaults' as callback`, function () {
          const resetProjectDetectionDefaultsCommand =
            // @ts-ignore
            extensionManager.resetProjectDetectionDefaultsCommand as () => void;
          const resetProjectDetectionDefaultsStub = sandbox.stub(
            extensionManager,
            // @ts-ignore
            'resetProjectDetectionDefaults',
          );

          resetProjectDetectionDefaultsCommand.call(extensionManager);

          expect(
            showCustomizationMessageStub.calledOnceWithExactly(
              `%s %s`,
              [
                models.LangResourceKeys.projectDetectionReset,
                models.LangResourceKeys.restart,
                models.LangResourceKeys.reload,
                ...[],
              ],
              resetProjectDetectionDefaultsStub,
            ),
          ).to.be.true;
        });
      });
    });

    context(`the toggle angular preset command`, function () {
      it(`toggles the angular preset`, function () {
        const toggleAngularPresetCommand =
          // @ts-ignore
          extensionManager.toggleAngularPresetCommand as () => void;

        toggleAngularPresetCommand.call(extensionManager);

        expect(
          togglePresetStub.calledOnceWithExactly(
            models.PresetNames.angular,
            models.CommandNames.ngPreset,
            false,
            models.ConfigurationTarget.Workspace,
          ),
        ).to.be.true;
      });
    });

    context(`the toggle nestjs preset command`, function () {
      it(`toggles the nestjs preset`, function () {
        const toggleNestPresetCommand =
          // @ts-ignore
          extensionManager.toggleNestPresetCommand as () => void;

        toggleNestPresetCommand.call(extensionManager);

        expect(
          togglePresetStub.calledOnceWithExactly(
            models.PresetNames.nestjs,
            models.CommandNames.nestPreset,
            false,
            models.ConfigurationTarget.Workspace,
          ),
        ).to.be.true;
      });
    });

    context(`the toggle js preset command`, function () {
      it(`toggles the js preset`, function () {
        const toggleJsPresetCommand =
          // @ts-ignore
          extensionManager.toggleJsPresetCommand as () => void;

        toggleJsPresetCommand.call(extensionManager);

        expect(
          togglePresetStub.calledOnceWithExactly(
            models.PresetNames.jsOfficial,
            models.CommandNames.jsPreset,
            false,
            models.ConfigurationTarget.Global,
          ),
        ).to.be.true;
      });
    });

    context(`the toggle ts preset command`, function () {
      it(`toggles the ts preset`, function () {
        const toggleTsPresetCommand =
          // @ts-ignore
          extensionManager.toggleTsPresetCommand as () => void;

        toggleTsPresetCommand.call(extensionManager);

        expect(
          togglePresetStub.calledOnceWithExactly(
            models.PresetNames.tsOfficial,
            models.CommandNames.tsPreset,
            false,
            models.ConfigurationTarget.Global,
          ),
        ).to.be.true;
      });
    });

    context(`the toggle json preset command`, function () {
      it(`toggles the json preset`, function () {
        const toggleJsonPresetCommand =
          // @ts-ignore
          extensionManager.toggleJsonPresetCommand as () => void;

        toggleJsonPresetCommand.call(extensionManager);

        expect(
          togglePresetStub.calledOnceWithExactly(
            models.PresetNames.jsonOfficial,
            models.CommandNames.jsonPreset,
            false,
            models.ConfigurationTarget.Global,
          ),
        ).to.be.true;
      });
    });

    context(`the toggle hide folders preset command`, function () {
      it(`toggles the hide folders preset`, function () {
        const toggleHideFoldersPresetCommand =
          // @ts-ignore
          extensionManager.toggleHideFoldersPresetCommand as () => void;

        toggleHideFoldersPresetCommand.call(extensionManager);

        expect(
          togglePresetStub.calledOnceWithExactly(
            models.PresetNames.hideFolders,
            models.CommandNames.hideFoldersPreset,
            true,
            models.ConfigurationTarget.Global,
          ),
        ).to.be.true;
      });
    });

    context(`the toggle folders all default icon preset command`, function () {
      it(`toggles the folders all default icon preset`, function () {
        const toggleFoldersAllDefaultIconPresetCommand =
          // @ts-ignore
          extensionManager.toggleFoldersAllDefaultIconPresetCommand as () => void;

        toggleFoldersAllDefaultIconPresetCommand.call(extensionManager);

        expect(
          togglePresetStub.calledOnceWithExactly(
            models.PresetNames.foldersAllDefaultIcon,
            models.CommandNames.foldersAllDefaultIconPreset,
            true,
            models.ConfigurationTarget.Global,
          ),
        ).to.be.true;
      });
    });

    context(`the toggle hide explorer arrows preset command`, function () {
      it(`toggles the hide explorer arrows preset`, function () {
        const toggleHideExplorerArrowsPresetCommand =
          // @ts-ignore
          extensionManager.toggleHideExplorerArrowsPresetCommand as () => void;

        toggleHideExplorerArrowsPresetCommand.call(extensionManager);

        expect(
          togglePresetStub.calledOnceWithExactly(
            models.PresetNames.hideExplorerArrows,
            models.CommandNames.hideExplorerArrowsPreset,
            true,
            models.ConfigurationTarget.Global,
          ),
        ).to.be.true;
      });
    });
  });
});
