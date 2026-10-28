import type * as types from '../../src/types';
import type { VSCodeCommand } from '../../src/types/vscode';

import { expect } from 'chai';
import * as sinon from 'sinon';

import { ExtensionManager } from '../../src/app/extensionManager';
import { ConfigManager } from '../../src/configuration/configManager';
import { IconsGenerator } from '../../src/iconsManifest';
import { NotificationManager } from '../../src/notification/notificationManager';
import { ProjectAutoDetectionManager } from '../../src/pad/projectAutoDetectionManager';
import { SettingsManager } from '../../src/settings/settingsManager';
import * as enums from '../../src/types/enums';
import { VSCodeManager } from '../../src/vscode/vscodeManager';

describe('ExtensionManagerContract: commands tests', function () {
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
    let showCustomizationMessageStub: sinon.SinonStub;
    let togglePresetStub: sinon.SinonStub;
    let extensionManager: types.ExtensionManagerContract;

    beforeEach(function () {
      sandbox = sinon.createSandbox();

      vscodeManagerStub =
        sandbox.createStubInstance<types.VSCodeManagerContract>(VSCodeManager);
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
        sandbox.createStubInstance<types.ConfigManagerContract>(ConfigManager);

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
      let commands: VSCodeCommand[];
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
                enums.LangResourceKeys.iconCustomization,
                enums.LangResourceKeys.restart,
                enums.LangResourceKeys.reload,
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
                enums.LangResourceKeys.iconRestore,
                enums.LangResourceKeys.restart,
                enums.LangResourceKeys.reload,
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
                enums.LangResourceKeys.projectDetectionReset,
                enums.LangResourceKeys.restart,
                enums.LangResourceKeys.reload,
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
            enums.PresetNames.angular,
            enums.CommandNames.ngPreset,
            false,
            enums.ConfigurationTarget.Workspace,
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
            enums.PresetNames.nestjs,
            enums.CommandNames.nestPreset,
            false,
            enums.ConfigurationTarget.Workspace,
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
            enums.PresetNames.jsOfficial,
            enums.CommandNames.jsPreset,
            false,
            enums.ConfigurationTarget.Global,
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
            enums.PresetNames.tsOfficial,
            enums.CommandNames.tsPreset,
            false,
            enums.ConfigurationTarget.Global,
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
            enums.PresetNames.jsonOfficial,
            enums.CommandNames.jsonPreset,
            false,
            enums.ConfigurationTarget.Global,
          ),
        ).to.be.true;
      });
    });

    context(`the toggle yaml preset command`, function () {
      it(`toggles the yaml preset`, function () {
        const toggleYamlPresetCommand =
          // @ts-ignore
          extensionManager.toggleYamlPresetCommand as () => void;

        toggleYamlPresetCommand.call(extensionManager);

        expect(
          togglePresetStub.calledOnceWithExactly(
            enums.PresetNames.yamlOfficial,
            enums.CommandNames.yamlPreset,
            false,
            enums.ConfigurationTarget.Global,
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
            enums.PresetNames.hideFolders,
            enums.CommandNames.hideFoldersPreset,
            true,
            enums.ConfigurationTarget.Global,
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
            enums.PresetNames.foldersAllDefaultIcon,
            enums.CommandNames.foldersAllDefaultIconPreset,
            true,
            enums.ConfigurationTarget.Global,
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
            enums.PresetNames.hideExplorerArrows,
            enums.CommandNames.hideExplorerArrowsPreset,
            true,
            enums.ConfigurationTarget.Global,
          ),
        ).to.be.true;
      });
    });
  });
});
