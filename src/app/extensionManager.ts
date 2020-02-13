import { dirname, resolve } from 'path';
import * as manifest from '../../../package.json';
import { ErrorHandler } from '../common/errorHandler';
import { ConfigManager } from '../configuration/configManager';
import { constants } from '../constants';
import { ManifestReader } from '../iconsManifest';
import * as models from '../models';
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
    private projectAutoDetectionManager: models.IProjectAutoDetectionManager,
    private integrityManager: models.IIntegrityManager,
  ) {
    // register event listener for configuration changes
    this.vscodeManager.workspace.onDidChangeConfiguration(
      this.didChangeConfigurationListener,
      this,
      this.vscodeManager.context.subscriptions,
    );
  }
  //#endregion

  //#region Public functions
  public async activate(): Promise<void> {
    if (!this.vscodeManager.isSupportedVersion) {
      await this.notificationManager.notifyError(
        '%s %s',
        models.LangResourceKeys.unsupportedVersion,
        `${this.vscodeManager.version}`,
      );
      return;
    }

    constants.environment.production = new RegExp(
      `${constants.extension.distEntryFilename}`,
    ).test(manifest.main);
    if (constants.environment.production) {
      ConfigManager.rootDir = resolve(dirname(__filename), '../../');

      if (!(await this.integrityManager.check())) {
        this.notificationManager.notifyWarning(
          models.LangResourceKeys.integrityFailure,
        );
      }
    }

    // function calls has to be done in this order strictly
    await this.settingsManager.moveStateFromLegacyPlace();

    this.registerCommands(manifest.contributes.commands);
    await this.manageIntroMessage();
    await this.manageCustomizations();

    const detectionResults: models.IProjectDetectionResult[] = await this.projectAutoDetectionManager.detectProjects(
      [models.Projects.angular, models.Projects.nestjs],
    );
    await this.applyProjectDetection(detectionResults);

    // Update the version in settings
    if (this.settingsManager.isNewVersion) {
      await this.settingsManager.updateStatus();
    }
  }
  //#endregion

  //#region Private functions
  private registerCommands(commands: any[]): void {
    commands.forEach(command =>
      this.vscodeManager.context.subscriptions.push(
        this.vscodeManager.commands.registerCommand(
          command.command,
          Reflect.get(this, command.callbackName) || ((): void => void 0),
          this,
        ),
      ),
    );
  }

  private manageIntroMessage(): Promise<void> {
    if (
      !this.settingsManager.getState().welcomeShown &&
      this.configManager.getIconTheme() !== constants.extension.name
    ) {
      return this.showWelcomeMessage();
    }

    if (
      this.settingsManager.isNewVersion &&
      !this.configManager.vsicons.dontShowNewVersionMessage
    ) {
      return this.showNewVersionMessage();
    }
  }

  private manageCustomizations(): Promise<void> {
    const configChanged =
      this.settingsManager.isNewVersion &&
      this.configManager.hasConfigChanged(
        Utils.unflattenProperties<{ vsicons: models.IVSIcons }>(
          manifest.contributes.configuration.properties,
          'default',
        ).vsicons,
        [constants.vsicons.presets.name, constants.vsicons.associations.name],
      );
    if (configChanged) {
      return this.applyCustomizationCommand();
    }
  }

  private showWelcomeMessage(): Promise<void> {
    const displayMessage = async (): Promise<void> => {
      try {
        const btn = await this.notificationManager.notifyInfo(
          models.LangResourceKeys.welcome,
          models.LangResourceKeys.activate,
          models.LangResourceKeys.aboutOfficialApi,
          models.LangResourceKeys.seeReadme,
        );

        switch (btn) {
          case models.LangResourceKeys.activate:
            await this.activationCommand();
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
      } catch (error) {
        ErrorHandler.logError(error);
      }
    };
    return displayMessage();
  }

  private async showNewVersionMessage(): Promise<void> {
    try {
      const btn = await this.notificationManager.notifyInfo(
        `%s v${constants.extension.version}`,
        models.LangResourceKeys.newVersion,
        models.LangResourceKeys.seeReleaseNotes,
        models.LangResourceKeys.dontShowThis,
      );
      switch (btn) {
        case models.LangResourceKeys.seeReleaseNotes:
          Utils.open(constants.urlReleaseNote);
          break;
        case models.LangResourceKeys.dontShowThis:
          return this.configManager.updateDontShowNewVersionMessage(true);
        default:
          break;
      }
    } catch (error) {
      ErrorHandler.logError(error);
    }
  }

  private async showCustomizationMessage(
    message: models.LangResourceLike,
    items: models.LangResourceLike[],
    callback?: (...args: any[]) => void,
    cbArgs?: any[],
  ): Promise<void> {
    try {
      if (
        this.vscodeManager.supportsThemesReload &&
        items.some(item => item === models.LangResourceKeys.reload)
      ) {
        await this.handleAction(
          models.LangResourceKeys.reload,
          callback,
          cbArgs,
        );
      } else {
        this.customMsgShown = true;
        const btn = await this.notificationManager.notifyInfo(
          message,
          ...items,
        );
        await this.handleAction(btn, callback, cbArgs);
      }
    } catch (error) {
      ErrorHandler.logError(error);
    }
  }

  private async activationCommand(): Promise<void> {
    await this.configManager.updateIconTheme();
  }

  private async applyCustomizationCommand(
    additionalTitles: models.LangResourceLike[] = [],
  ): Promise<void> {
    await this.showCustomizationMessage(
      `%s %s`,
      [
        models.LangResourceKeys.iconCustomization,
        models.LangResourceKeys.restart,
        models.LangResourceKeys.reload,
        ...additionalTitles,
      ],
      this.applyCustomization,
    );
  }

  // @ts-ignore: Called via reflection
  private async restoreDefaultManifestCommand(): Promise<void> {
    await this.showCustomizationMessage(
      `%s %s`,
      [
        models.LangResourceKeys.iconRestore,
        models.LangResourceKeys.restart,
        models.LangResourceKeys.reload,
      ],
      this.restoreManifest,
    );
  }

  // @ts-ignore: Called via reflection
  private async resetProjectDetectionDefaultsCommand(): Promise<void> {
    await this.showCustomizationMessage(
      `%s %s`,
      [
        models.LangResourceKeys.projectDetectionReset,
        models.LangResourceKeys.restart,
        models.LangResourceKeys.reload,
      ],
      this.resetProjectDetectionDefaults,
    );
  }

  // @ts-ignore: Called via reflection
  private async toggleAngularPresetCommand(): Promise<void> {
    await this.togglePreset(
      models.PresetNames.angular,
      models.CommandNames.ngPreset,
      false,
      models.ConfigurationTarget.Workspace,
    );
  }

  // @ts-ignore: Called via reflection
  private async toggleNestPresetCommand(): Promise<void> {
    await this.togglePreset(
      models.PresetNames.nestjs,
      models.CommandNames.nestPreset,
      false,
      models.ConfigurationTarget.Workspace,
    );
  }

  // @ts-ignore: Called via reflection
  private async toggleJsPresetCommand(): Promise<void> {
    await this.togglePreset(
      models.PresetNames.jsOfficial,
      models.CommandNames.jsPreset,
      false,
      models.ConfigurationTarget.Global,
    );
  }

  // @ts-ignore: Called via reflection
  private async toggleTsPresetCommand(): Promise<void> {
    await this.togglePreset(
      models.PresetNames.tsOfficial,
      models.CommandNames.tsPreset,
      false,
      models.ConfigurationTarget.Global,
    );
  }

  // @ts-ignore: Called via reflection
  private async toggleJsonPresetCommand(): Promise<void> {
    await this.togglePreset(
      models.PresetNames.jsonOfficial,
      models.CommandNames.jsonPreset,
      false,
      models.ConfigurationTarget.Global,
    );
  }

  // @ts-ignore: Called via reflection
  private async toggleHideFoldersPresetCommand(): Promise<void> {
    await this.togglePreset(
      models.PresetNames.hideFolders,
      models.CommandNames.hideFoldersPreset,
      true,
      models.ConfigurationTarget.Global,
    );
  }

  // @ts-ignore: Called via reflection
  private async toggleFoldersAllDefaultIconPresetCommand(): Promise<void> {
    await this.togglePreset(
      models.PresetNames.foldersAllDefaultIcon,
      models.CommandNames.foldersAllDefaultIconPreset,
      true,
      models.ConfigurationTarget.Global,
    );
  }

  // @ts-ignore: Called via reflection
  private async toggleHideExplorerArrowsPresetCommand(): Promise<void> {
    await this.togglePreset(
      models.PresetNames.hideExplorerArrows,
      models.CommandNames.hideExplorerArrowsPreset,
      true,
      models.ConfigurationTarget.Global,
    );
  }

  private executeAndReload(
    callback: (...args: any[]) => any,
    cbArgs?: any[],
  ): void {
    if (callback) {
      callback.apply(this, cbArgs);
    }
    if (this.vscodeManager.supportsThemesReload) {
      return;
    }
    // reload
    this.vscodeManager.commands.executeCommand(
      constants.vscode.reloadWindowActionSetting,
    );
  }

  private async handleAction(
    btn: models.LangResourceLike,
    callback?: (...args: any[]) => void,
    cbArgs?: any[], // This is a workaround because `callback.arguments` is not accessible
  ): Promise<void> {
    if (!btn) {
      this.customMsgShown = false;
      return;
    }

    const setPreset = async (
      project: models.Projects,
      preset: models.PresetNames,
    ): Promise<void> => {
      cbArgs = [cbArgs[0].filter((cbArg: any) => cbArg.project === project)];
      await this.configManager.updatePreset(
        models.PresetNames[preset],
        true,
        models.ConfigurationTarget.Workspace,
      );
      this.handleUpdatePreset(callback, cbArgs);
    };

    this.callback = callback;

    switch (btn) {
      case models.ProjectNames.ng:
        await setPreset(models.Projects.angular, models.PresetNames.angular);
        break;
      case models.ProjectNames.nest:
        await setPreset(models.Projects.nestjs, models.PresetNames.nestjs);
        break;
      case models.LangResourceKeys.dontShowThis: {
        this.doReload = false;
        if (!callback) {
          break;
        }
        switch (callback.name) {
          case 'applyCustomization': {
            this.customMsgShown = false;
            await this.configManager.updateDontShowConfigManuallyChangedMessage(
              true,
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
        await this.configManager.updateDisableDetection(true);
        break;
      }
      case models.LangResourceKeys.autoReload: {
        await this.configManager.updateAutoReload(true);
        this.handleUpdatePreset(callback, cbArgs);
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
  }

  private handleUpdatePreset(
    callback: (...args: any[]) => void,
    cbArgs: any[],
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
      this.executeAndReload(this.applyCustomization);
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
    projectDetectionResults: models.IProjectDetectionResult[],
  ): Promise<void> {
    if (
      !projectDetectionResults ||
      !projectDetectionResults.length ||
      projectDetectionResults.every(pdr => !pdr.apply)
    ) {
      return;
    }

    const conflict = projectDetectionResults.find(
      pdr => pdr.conflictingProjects && pdr.conflictingProjects.length,
    );
    if (!conflict && this.configManager.vsicons.projectDetection.autoReload) {
      this.executeAndReload(this.applyCustomization, [projectDetectionResults]);
      return;
    }
    const items = conflict
      ? ([
          models.ProjectNames[conflict.project],
          ...conflict.conflictingProjects.map(cp => models.ProjectNames[cp]),
        ] as string[])
      : [
          models.LangResourceKeys.reload,
          models.LangResourceKeys.autoReload,
          models.LangResourceKeys.disableDetect,
        ];

    return this.showCustomizationMessage(
      projectDetectionResults[0].langResourceKey,
      items,
      this.applyCustomization,
      [projectDetectionResults],
    );
  }

  private async togglePreset(
    preset: models.PresetNames,
    command: models.CommandNames,
    reverseAction: boolean,
    configurationTarget: models.ConfigurationTarget | boolean,
  ): Promise<void> {
    const presetName = models.PresetNames[preset];
    const commandName = models.CommandNames[command];
    const toggledValue = await ManifestReader.getToggledValue(
      preset,
      this.configManager.vsicons.presets,
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
      [presetName, toggledValue, configurationTarget],
    );
  }

  private async applyCustomization(
    projectDetectionResults?: models.IProjectDetectionResult[],
  ): Promise<void> {
    const associations = this.configManager.vsicons.associations;
    const customFiles: models.IFileCollection = {
      default: associations.fileDefault,
      supported: associations.files,
    };
    const customFolders: models.IFolderCollection = {
      default: associations.folderDefault,
      supported: associations.folders,
    };
    const iconsManifest = await this.iconsGenerator.generateIconsManifest(
      customFiles,
      customFolders,
      projectDetectionResults,
    );
    this.iconsGenerator.persist(iconsManifest);
  }

  private async restoreManifest(): Promise<void> {
    const iconsManifest = await this.iconsGenerator.generateIconsManifest();
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
  private async didChangeConfigurationListener(
    e: models.IVSCodeConfigurationChangeEvent,
  ): Promise<void> {
    // Update the status in extension settings
    if (e.affectsConfiguration(constants.vscode.iconThemeSetting)) {
      const status =
        this.configManager.getIconTheme() === constants.extension.name
          ? models.ExtensionStatus.activated
          : models.ExtensionStatus.deactivated;
      if (this.settingsManager.getState().status !== status) {
        try {
          await this.settingsManager.updateStatus(status);
        } catch (error) {
          ErrorHandler.logError(error);
        }
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
        this.configManager.updateVSIconsConfigState();
      }
    }
    return;
  }
  //#endregion
}
