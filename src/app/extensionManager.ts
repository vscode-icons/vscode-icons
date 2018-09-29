import * as models from '../models';
import * as manifest from '../../../package.json';
import { constants } from '../constants';
import { ManifestReader } from '../iconsManifest';
import { ErrorHandler } from '../errorHandler';
import { Utils } from '../utils';

export class ExtensionManager implements models.IExtensionManager {
  //#region Properties
  private doReload: boolean;
  private customMsgShown: boolean;
  private callback: (...args: any[]) => any;
  //#endregion

  //#region Constructor
  constructor(
    private vscodeManager: models.IVSCodeManager,
    private configManager: models.IConfigManager,
    private settingsManager: models.ISettingsManager,
    private notificationManager: models.INotificationManager,
    private iconsGenerator: models.IIconsGenerator,
    private projectAutoDetectionManager: models.IProjectAutoDetectionManager
  ) {
    // register event listener for configuration changes
    this.vscodeManager.workspace.onDidChangeConfiguration(
      this.didChangeConfigurationListener,
      this,
      this.vscodeManager.context.subscriptions
    );
  }
  //#endregion

  //#region Public functions
  public activate(): void {
    // function calls has to be done in this order strictly
    this.settingsManager.moveStateFromLegacyPlace();

    this.registerCommands(manifest.contributes.commands);
    this.manageIntroMessage();
    this.manageCustomizations();

    this.projectAutoDetectionManager
      .detectProjects([models.Projects.angular])
      .then(detectionResult => this.applyProjectDetection(detectionResult));

    // Update the version in settings
    if (this.settingsManager.isNewVersion) {
      this.settingsManager.updateStatus();
    }
  }
  //#endregion

  //#region Private functions
  private registerCommands(commands: any[]): void {
    commands.forEach(command => {
      this.vscodeManager.context.subscriptions.push(
        this.vscodeManager.commands.registerCommand(
          command.command,
          Reflect.get(this, command.callbackName) || (() => void 0),
          this
        )
      );
    });
  }

  private manageIntroMessage(): void {
    if (
      !this.settingsManager.getState().welcomeShown &&
      this.configManager.getIconTheme() !== constants.extension.name
    ) {
      this.showWelcomeMessage();
      return;
    }

    if (
      this.settingsManager.isNewVersion &&
      !this.configManager.vsicons.dontShowNewVersionMessage
    ) {
      this.showNewVersionMessage();
    }
  }

  private manageCustomizations(): void {
    const configChanged =
      this.settingsManager.isNewVersion &&
      this.configManager.hasConfigChanged(
        Utils.unflattenProperties<{ vsicons }>(
          manifest.contributes.configuration.properties,
          'default'
        ).vsicons,
        [constants.vsicons.presets.name, constants.vsicons.associations.name]
      );
    if (configChanged) {
      this.applyCustomizationCommand();
    }
  }

  private showWelcomeMessage(): Thenable<void> {
    const displayMessage = (): Thenable<void> =>
      this.notificationManager
        .notifyInfo<models.LangResourceKeys>(
          models.LangResourceKeys.welcome,
          models.LangResourceKeys.activate,
          models.LangResourceKeys.aboutOfficialApi,
          models.LangResourceKeys.seeReadme
        )
        .then(
          btn => {
            switch (btn) {
              case models.LangResourceKeys.activate:
                this.activationCommand();
                break;
              case models.LangResourceKeys.aboutOfficialApi: {
                Utils.open(constants.urlOfficialApi);
                // Display the message again so the user can choose to activate or not
                return displayMessage();
              }
              case models.LangResourceKeys.seeReadme: {
                Utils.open(constants.urlReadme);
                // Display the message again so the user can choose to activate or not
                return displayMessage();
              }
              default:
                break;
            }
          },
          reason => ErrorHandler.logError(reason)
        );
    return displayMessage();
  }

  private showNewVersionMessage(): Thenable<void> {
    return this.notificationManager
      .notifyInfo<models.LangResourceKeys>(
        `%s v${constants.extension.version}`,
        models.LangResourceKeys.newVersion,
        models.LangResourceKeys.seeReleaseNotes,
        models.LangResourceKeys.dontShowThis
      )
      .then(
        btn => {
          switch (btn) {
            case models.LangResourceKeys.seeReleaseNotes:
              Utils.open(constants.urlReleaseNote);
              break;
            case models.LangResourceKeys.dontShowThis:
              return this.configManager.updateDontShowNewVersionMessage(true);
            default:
              break;
          }
        },
        reason => ErrorHandler.logError(reason)
      );
  }

  private showCustomizationMessage(
    message: string | models.LangResourceKeys,
    items: Array<string | models.LangResourceKeys>,
    callback?: (...args: any[]) => void,
    cbArgs?: any[]
  ): Thenable<void> {
    this.customMsgShown = true;
    return this.notificationManager
      .notifyInfo(message, ...items)
      .then(
        btn => this.handleAction(btn, callback, cbArgs),
        reason => ErrorHandler.logError(reason)
      );
  }

  private activationCommand(): void {
    this.configManager.updateIconTheme();
  }

  private applyCustomizationCommand(
    additionalTitles: Array<string | models.LangResourceKeys> = []
  ): void {
    this.showCustomizationMessage(
      `%s %s`,
      [
        models.LangResourceKeys.iconCustomization,
        models.LangResourceKeys.restart,
        models.LangResourceKeys.reload,
        ...additionalTitles,
      ],
      this.applyCustomization
    );
  }

  // @ts-ignore: Called via reflection
  private restoreDefaultManifestCommand(): void {
    this.showCustomizationMessage(
      `%s %s`,
      [
        models.LangResourceKeys.iconRestore,
        models.LangResourceKeys.restart,
        models.LangResourceKeys.reload,
      ],
      this.restoreManifest
    );
  }

  // @ts-ignore: Called via reflection
  private resetProjectDetectionDefaultsCommand(): void {
    this.showCustomizationMessage(
      `%s %s`,
      [
        models.LangResourceKeys.projectDetectionReset,
        models.LangResourceKeys.restart,
        models.LangResourceKeys.reload,
      ],
      this.resetProjectDetectionDefaults
    );
  }

  // @ts-ignore: Called via reflection
  private toggleAngularPresetCommand(): void {
    this.togglePreset(
      models.PresetNames.angular,
      models.CommandNames.ngPreset,
      false,
      models.ConfigurationTarget.Workspace
    );
  }

  // @ts-ignore: Called via reflection
  private toggleJsPresetCommand(): void {
    this.togglePreset(
      models.PresetNames.jsOfficial,
      models.CommandNames.jsPreset,
      false,
      models.ConfigurationTarget.Global
    );
  }

  // @ts-ignore: Called via reflection
  private toggleTsPresetCommand(): void {
    this.togglePreset(
      models.PresetNames.tsOfficial,
      models.CommandNames.tsPreset,
      false,
      models.ConfigurationTarget.Global
    );
  }

  // @ts-ignore: Called via reflection
  private toggleJsonPresetCommand(): void {
    this.togglePreset(
      models.PresetNames.jsonOfficial,
      models.CommandNames.jsonPreset,
      false,
      models.ConfigurationTarget.Global
    );
  }

  // @ts-ignore: Called via reflection
  private toggleHideFoldersPresetCommand(): void {
    this.togglePreset(
      models.PresetNames.hideFolders,
      models.CommandNames.hideFoldersPreset,
      true,
      models.ConfigurationTarget.Global
    );
  }

  // @ts-ignore: Called via reflection
  private toggleFoldersAllDefaultIconPresetCommand(): void {
    this.togglePreset(
      models.PresetNames.foldersAllDefaultIcon,
      models.CommandNames.foldersAllDefaultIconPreset,
      true,
      models.ConfigurationTarget.Global
    );
  }

  // @ts-ignore: Called via reflection
  private toggleHideExplorerArrowsPresetCommand(): void {
    this.togglePreset(
      models.PresetNames.hideExplorerArrows,
      models.CommandNames.hideExplorerArrowsPreset,
      true,
      models.ConfigurationTarget.Global
    );
  }

  private executeAndReload(
    callback: (...args: any[]) => any,
    cbArgs?: any[]
  ): void {
    if (callback) {
      callback.apply(this, cbArgs);
    }
    // reload
    this.vscodeManager.commands.executeCommand(
      constants.vscode.reloadWindowActionSetting
    );
  }

  private handleAction(
    btn: string | models.LangResourceKeys,
    callback?: (...args: any[]) => void,
    cbArgs?: any[] // This is a workaround because `callback.arguments` is not accessible
  ): Thenable<void> {
    if (!btn) {
      this.customMsgShown = false;
      return Promise.resolve();
    }

    this.callback = callback;

    let retVal: Thenable<void>;
    switch (btn) {
      case models.LangResourceKeys.dontShowThis: {
        this.doReload = false;
        if (!callback) {
          break;
        }
        switch (callback.name) {
          case 'applyCustomization': {
            this.customMsgShown = false;
            retVal = this.configManager.updateDontShowConfigManuallyChangedMessage(
              true
            );
            break;
          }
          default:
            break;
        }
        break;
      }
      case models.LangResourceKeys.disableDetect: {
        this.doReload = false;
        retVal = this.configManager.updateDisableDetection(true);
        break;
      }
      case models.LangResourceKeys.autoReload: {
        retVal = this.configManager
          .updateAutoReload(true)
          .then(() => this.handleUpdatePreset(callback, cbArgs));
        break;
      }
      case models.LangResourceKeys.reload: {
        if (!cbArgs || cbArgs.length !== 3) {
          this.executeAndReload(callback, cbArgs);
          break;
        }
        this.handleUpdatePreset(callback, cbArgs);
        break;
      }
      default:
        break;
    }
    return retVal || Promise.resolve();
  }

  private handleUpdatePreset(
    callback: (...args: any[]) => void,
    cbArgs: any[]
  ): void {
    if (!callback) {
      throw new Error('Callback function missing');
    }
    if (!cbArgs || !cbArgs.length) {
      throw new Error('Arguments missing');
    }
    // If the preset is the same as the toggle value then trigger an explicit reload
    // Note: This condition works also for auto-reload handling
    if (this.configManager.vsicons.presets[cbArgs[0]] === cbArgs[1]) {
      this.executeAndReload(this.applyCustomization, cbArgs);
    } else {
      if (cbArgs.length !== 3) {
        throw new Error('Arguments mismatch');
      }
      this.doReload = true;
      this.callback = this.applyCustomization;
      callback.apply(this.configManager, cbArgs);
    }
  }

  private applyProjectDetection(
    projectDetectionResult: models.IProjectDetectionResult
  ): void {
    if (!projectDetectionResult || !projectDetectionResult.apply) {
      return;
    }
    if (this.configManager.vsicons.projectDetection.autoReload) {
      this.executeAndReload(this.applyCustomization, [projectDetectionResult]);
      return;
    }
    this.showCustomizationMessage(
      projectDetectionResult.langResourceKey,
      [
        models.LangResourceKeys.reload,
        models.LangResourceKeys.autoReload,
        models.LangResourceKeys.disableDetect,
      ],
      this.applyCustomization,
      [projectDetectionResult]
    );
  }

  private togglePreset(
    preset: models.PresetNames,
    command: models.CommandNames,
    reverseAction: boolean,
    configurationTarget: models.ConfigurationTarget | boolean
  ): void {
    const presetName = models.PresetNames[preset];
    const commandName = models.CommandNames[command];
    const toggledValue = ManifestReader.getToggledValue(
      preset,
      this.configManager.vsicons.presets
    );
    const action = reverseAction
      ? toggledValue
        ? 'Disabled'
        : 'Enabled'
      : toggledValue
        ? 'Enabled'
        : 'Disabled';

    if (!Reflect.has(models.LangResourceKeys, `${commandName}${action}`)) {
      throw Error(`${commandName}${action} is not valid`);
    }

    this.showCustomizationMessage(
      '%s %s',
      [
        models.LangResourceKeys[`${commandName}${action}`],
        models.LangResourceKeys.restart,
        models.LangResourceKeys.reload,
      ],
      this.configManager.updatePreset,
      [presetName, toggledValue, configurationTarget]
    );
  }

  private applyCustomization(
    projectDetectionResult?: models.IProjectDetectionResult
  ): void {
    const associations = this.configManager.vsicons.associations;
    const customFiles: models.IFileCollection = {
      default: associations.fileDefault,
      supported: associations.files,
    };
    const customFolders: models.IFolderCollection = {
      default: associations.folderDefault,
      supported: associations.folders,
    };
    const iconsManifest = this.iconsGenerator.generateIconsManifest(
      customFiles,
      customFolders,
      projectDetectionResult
    );
    this.iconsGenerator.persist(iconsManifest);
  }

  private restoreManifest(): void {
    const iconsManifest = this.iconsGenerator.generateIconsManifest();
    this.iconsGenerator.persist(iconsManifest);
  }

  private resetProjectDetectionDefaults(): void {
    // We always need a fresh 'vsicons' configuration when checking the values
    // to take into account for user manually changed values
    if (this.configManager.vsicons.projectDetection.autoReload) {
      this.configManager.updateAutoReload(false);
    }
    if (this.configManager.vsicons.projectDetection.disableDetect) {
      this.configManager.updateDisableDetection(false);
    }
  }

  //#endregion

  //#region Event Listeners
  private didChangeConfigurationListener(
    e: models.IVSCodeConfigurationChangeEvent
  ): void {
    if (!e || !e.affectsConfiguration) {
      throw new Error(
        `Unsupported 'vscode' version: ${this.vscodeManager.version}`
      );
    }

    // Update the status in extension settings
    if (e.affectsConfiguration(constants.vscode.iconThemeSetting)) {
      const status =
        this.configManager.getIconTheme() === constants.extension.name
          ? models.ExtensionStatus.activated
          : models.ExtensionStatus.deactivated;
      if (this.settingsManager.getState().status !== status) {
        this.settingsManager.updateStatus(status);
      }
      return;
    }

    // react only on 'vsicons.presets' and 'vsicons.associations' configuration changes
    if (
      !e.affectsConfiguration(constants.vsicons.presets.fullname) &&
      !e.affectsConfiguration(constants.vsicons.associations.fullname)
    ) {
      return;
    }

    if (this.doReload) {
      this.doReload = false;
      // In case the 'user settings' file has just been created
      // a delay needs to be introduced, in order for the 'preset'
      // change to get persisted on disk
      setTimeout(() => this.executeAndReload(this.callback), 500);
    } else if (!this.customMsgShown) {
      const currentConfig = this.configManager.vsicons;
      const configChanged =
        !currentConfig.dontShowConfigManuallyChangedMessage &&
        this.configManager.hasConfigChanged(currentConfig, [
          constants.vsicons.presets.name,
          constants.vsicons.associations.name,
        ]);
      if (configChanged) {
        this.applyCustomizationCommand([models.LangResourceKeys.dontShowThis]);
      }
    }
    return;
  }
  //#endregion
}
