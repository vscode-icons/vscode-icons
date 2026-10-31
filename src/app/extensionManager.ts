import type * as types from '../types';
import type { PackageManifest } from '../types/package';
import type { VSCodeCommand } from '../types/vscode';

import { dirname, resolve } from 'path';

import packageJson from '../../../package.json';
import { ErrorHandler } from '../common/errorHandler';
import { ConfigManager } from '../configuration/configManager';
import { constants } from '../constants';
import { ManifestReader } from '../iconsManifest';
import * as enums from '../types/enums';
import { Utils } from '../utils';

export class ExtensionManager implements types.ExtensionManagerContract {
  //#region Properties
  private readonly manifest: PackageManifest;
  private doReload: boolean;
  private customMsgShown: boolean;
  private callback: (...args: unknown[]) => unknown;
  //#endregion

  //#region Constructor
  constructor(
    private vscodeManager: types.VSCodeManagerContract,
    private configManager: types.ConfigManagerContract,
    private settingsManager: types.SettingsManagerContract,
    private notificationManager: types.NotificationManagerContract,
    private iconsGenerator: types.IconsGeneratorContract,
    private projectAutoDetectionManager: types.ProjectAutoDetectionManagerContract,
  ) {
    this.manifest = packageJson as PackageManifest;
    // register event listener for configuration changes
    this.vscodeManager.workspace.onDidChangeConfiguration(
      // eslint-disable-next-line @typescript-eslint/unbound-method
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
        enums.LangResourceKeys.unsupportedVersion,
        `${this.vscodeManager.version}`,
      );
      return;
    }

    constants.environment.production = new RegExp(
      `${constants.extension.distEntryFilename}`,
    ).test(this.manifest.main);

    if (constants.environment.production) {
      ConfigManager.rootDir = resolve(dirname(__filename), '../../');
    }

    // Mark extension state for Settings Sync so welcome-shown
    // status is preserved across synced machines
    this.vscodeManager.context.globalState.setKeysForSync([
      constants.vsicons.name,
    ]);

    // function calls has to be done in this order strictly
    this.registerCommands(this.manifest.contributes.commands);
    await this.manageIntroMessage();
    await this.manageCustomizations();

    const detectionResults: types.ProjectDetectionResult[] =
      await this.projectAutoDetectionManager.detectProjects([
        enums.Projects.angular,
        enums.Projects.nestjs,
      ]);
    await this.applyProjectDetection(detectionResults);

    // Update the version in settings
    if (this.settingsManager.isNewVersion) {
      await this.settingsManager.updateStatus();
    }
  }
  //#endregion

  //#region Private functions
  private registerCommands(commands: VSCodeCommand[]): void {
    commands.forEach((command: VSCodeCommand): number =>
      this.vscodeManager.context.subscriptions.push(
        this.vscodeManager.commands.registerCommand(
          command.command,
          (Reflect.get(this, command.callbackName) as CallableFunction) ||
            ((): void => void 0),
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
        Utils.unflattenProperties<{ vsicons: types.VSIcons }>(
          this.manifest.contributes.configuration.properties,
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
          enums.LangResourceKeys.welcome,
          enums.LangResourceKeys.activate,
          enums.LangResourceKeys.seeReadme,
          enums.LangResourceKeys.aboutOfficialApi,
        );

        switch (btn) {
          case enums.LangResourceKeys.activate:
            return this.activationCommand();
          case enums.LangResourceKeys.aboutOfficialApi: {
            void Utils.open(constants.urlOfficialApi);
            // Display the message again so the user can choose to activate or not
            return displayMessage();
          }
          case enums.LangResourceKeys.seeReadme: {
            void Utils.open(constants.urlReadme);
            // Display the message again so the user can choose to activate or not
            return displayMessage();
          }
          default:
            break;
        }
      } catch (error: unknown) {
        ErrorHandler.logError(error);
      }
    };
    return displayMessage();
  }

  private async showNewVersionMessage(): Promise<void> {
    try {
      const btn = await this.notificationManager.notifyInfo(
        `%s v${constants.extension.version}`,
        enums.LangResourceKeys.newVersion,
        enums.LangResourceKeys.seeReleaseNotes,
        enums.LangResourceKeys.dontShowThis,
      );
      switch (btn) {
        case enums.LangResourceKeys.seeReleaseNotes:
          return void Utils.open(constants.urlReleaseNote);
        case enums.LangResourceKeys.dontShowThis:
          return this.configManager.updateDontShowNewVersionMessage(true);
        default:
          break;
      }
    } catch (error: unknown) {
      ErrorHandler.logError(error);
    }
  }

  private async showCustomizationMessage(
    message: types.LangResourceLike,
    items: types.LangResourceLike[],
    callback?: (...args: unknown[]) => unknown,
    cbArgs?: unknown[],
  ): Promise<void> {
    try {
      if (
        this.vscodeManager.supportsThemesReload &&
        items.some(
          (item: types.LangResourceLike): boolean =>
            item === enums.LangResourceKeys.reload,
        )
      ) {
        await this.handleAction(
          enums.LangResourceKeys.reload,
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
    } catch (error: unknown) {
      ErrorHandler.logError(error);
    }
  }

  private activationCommand(): Promise<void> {
    return this.configManager.updateIconTheme();
  }

  private applyCustomizationCommand(
    additionalTitles: types.LangResourceLike[] = [],
  ): Promise<void> {
    return this.showCustomizationMessage(
      `%s %s`,
      [
        enums.LangResourceKeys.iconCustomization,
        enums.LangResourceKeys.restart,
        enums.LangResourceKeys.reload,
        ...additionalTitles,
      ],
      // eslint-disable-next-line @typescript-eslint/unbound-method
      this.applyCustomization,
    );
  }

  // @ts-ignore: Called via reflection
  private restoreDefaultManifestCommand(): Promise<void> {
    return this.showCustomizationMessage(
      `%s %s`,
      [
        enums.LangResourceKeys.iconRestore,
        enums.LangResourceKeys.restart,
        enums.LangResourceKeys.reload,
      ],
      // eslint-disable-next-line @typescript-eslint/unbound-method
      this.restoreManifest,
    );
  }

  // @ts-ignore: Called via reflection
  private resetProjectDetectionDefaultsCommand(): Promise<void> {
    return this.showCustomizationMessage(
      `%s %s`,
      [
        enums.LangResourceKeys.projectDetectionReset,
        enums.LangResourceKeys.restart,
        enums.LangResourceKeys.reload,
      ],
      // eslint-disable-next-line @typescript-eslint/unbound-method
      this.resetProjectDetectionDefaults,
    );
  }

  // @ts-ignore: Called via reflection
  private toggleAngularPresetCommand(): Promise<void> {
    return this.togglePreset(
      enums.PresetNames.angular,
      enums.CommandNames.ngPreset,
      false,
      enums.ConfigurationTarget.Workspace,
    );
  }

  // @ts-ignore: Called via reflection
  private toggleNestPresetCommand(): Promise<void> {
    return this.togglePreset(
      enums.PresetNames.nestjs,
      enums.CommandNames.nestPreset,
      false,
      enums.ConfigurationTarget.Workspace,
    );
  }

  // @ts-ignore: Called via reflection
  private toggleJsPresetCommand(): Promise<void> {
    return this.togglePreset(
      enums.PresetNames.jsOfficial,
      enums.CommandNames.jsPreset,
      false,
      enums.ConfigurationTarget.Global,
    );
  }

  // @ts-ignore: Called via reflection
  private toggleTsPresetCommand(): Promise<void> {
    return this.togglePreset(
      enums.PresetNames.tsOfficial,
      enums.CommandNames.tsPreset,
      false,
      enums.ConfigurationTarget.Global,
    );
  }

  // @ts-ignore: Called via reflection
  private toggleReactJsPresetCommand(): Promise<void> {
    return this.togglePreset(
      enums.PresetNames.reactjsOfficial,
      enums.CommandNames.reactjsPreset,
      false,
      enums.ConfigurationTarget.Global,
    );
  }

  // @ts-ignore: Called via reflection
  private toggleReactTsPresetCommand(): Promise<void> {
    return this.togglePreset(
      enums.PresetNames.reacttsOfficial,
      enums.CommandNames.reacttsPreset,
      false,
      enums.ConfigurationTarget.Global,
    );
  }

  // @ts-ignore: Called via reflection
  private toggleJsonPresetCommand(): Promise<void> {
    return this.togglePreset(
      enums.PresetNames.jsonOfficial,
      enums.CommandNames.jsonPreset,
      false,
      enums.ConfigurationTarget.Global,
    );
  }

  // @ts-ignore: Called via reflection
  private toggleYamlPresetCommand(): Promise<void> {
    return this.togglePreset(
      enums.PresetNames.yamlOfficial,
      enums.CommandNames.yamlPreset,
      false,
      enums.ConfigurationTarget.Global,
    );
  }

  // @ts-ignore: Called via reflection
  private toggleHideFoldersPresetCommand(): Promise<void> {
    return this.togglePreset(
      enums.PresetNames.hideFolders,
      enums.CommandNames.hideFoldersPreset,
      true,
      enums.ConfigurationTarget.Global,
    );
  }

  // @ts-ignore: Called via reflection
  private toggleFoldersAllDefaultIconPresetCommand(): Promise<void> {
    return this.togglePreset(
      enums.PresetNames.foldersAllDefaultIcon,
      enums.CommandNames.foldersAllDefaultIconPreset,
      true,
      enums.ConfigurationTarget.Global,
    );
  }

  // @ts-ignore: Called via reflection
  private toggleHideExplorerArrowsPresetCommand(): Promise<void> {
    return this.togglePreset(
      enums.PresetNames.hideExplorerArrows,
      enums.CommandNames.hideExplorerArrowsPreset,
      true,
      enums.ConfigurationTarget.Global,
    );
  }

  private executeAndReload(
    callback: (...args: unknown[]) => unknown,
    cbArgs?: unknown[],
  ): void {
    if (callback) {
      callback.apply(this, cbArgs);
    }
    if (this.vscodeManager.supportsThemesReload) {
      return;
    }
    // reload
    void this.vscodeManager.commands.executeCommand(
      constants.vscode.reloadWindowActionSetting,
    );
  }

  private async handleAction(
    btn: types.LangResourceLike,
    callback?: (...args: unknown[]) => unknown,
    cbArgs?: unknown[], // This is a workaround because `callback.arguments` is not accessible
  ): Promise<void> {
    if (!btn) {
      this.customMsgShown = false;
      return;
    }

    const setPreset = async (
      project: enums.Projects,
      preset: enums.PresetNames,
    ): Promise<void> => {
      if (!cbArgs || !cbArgs.length) {
        throw new Error('Arguments missing');
      }
      cbArgs = [
        (cbArgs[0] as types.ProjectDetectionResult[]).filter(
          (cbArg: types.ProjectDetectionResult): boolean =>
            cbArg.project === project,
        ),
      ];
      await this.configManager.updatePreset(
        enums.PresetNames[preset],
        true,
        enums.ConfigurationTarget.Workspace,
      );
      this.handleUpdatePreset(callback, cbArgs);
    };

    this.callback = callback;

    switch (btn) {
      case enums.ProjectNames.ng:
        return setPreset(enums.Projects.angular, enums.PresetNames.angular);
      case enums.ProjectNames.nest:
        return setPreset(enums.Projects.nestjs, enums.PresetNames.nestjs);
      case enums.LangResourceKeys.dontShowThis: {
        this.doReload = false;
        if (!callback) {
          break;
        }
        switch (callback.name) {
          case 'applyCustomization': {
            this.customMsgShown = false;
            return this.configManager.updateDontShowConfigManuallyChangedMessage(
              true,
            );
          }
          default:
            break;
        }
        break;
      }
      case enums.LangResourceKeys.disableDetect: {
        this.doReload = false;
        return this.configManager.updateDisableDetection(true);
      }
      case enums.LangResourceKeys.autoReload: {
        await this.configManager.updateAutoReload(true);
        this.handleUpdatePreset(callback, cbArgs);
        break;
      }
      case enums.LangResourceKeys.reload: {
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
    callback: (...args: unknown[]) => unknown,
    cbArgs: unknown[],
  ): void {
    if (!callback) {
      throw new Error('Callback function missing');
    }
    if (!cbArgs || !cbArgs.length) {
      throw new Error('Arguments missing');
    }
    // If the preset is the same as the toggle value then trigger an explicit reload
    // Note: This condition works also for auto-reload handling
    if (
      this.configManager.vsicons.presets[cbArgs[0] as string] ===
      (cbArgs[1] as types.Presets)
    ) {
      // eslint-disable-next-line @typescript-eslint/unbound-method
      this.executeAndReload(this.applyCustomization);
    } else {
      if (cbArgs.length !== 3) {
        throw new Error('Arguments mismatch');
      }
      this.doReload = true;
      // eslint-disable-next-line @typescript-eslint/unbound-method
      this.callback = this.applyCustomization;
      callback.apply(this.configManager, cbArgs);
    }
  }

  private async applyProjectDetection(
    projectDetectionResults: types.ProjectDetectionResult[],
  ): Promise<void> {
    if (
      !projectDetectionResults ||
      !projectDetectionResults.length ||
      projectDetectionResults.every(
        (pdr: types.ProjectDetectionResult): boolean => !pdr.apply,
      )
    ) {
      return;
    }

    const conflict = projectDetectionResults.find(
      (pdr: types.ProjectDetectionResult): boolean =>
        !!pdr.conflictingProjects && !!pdr.conflictingProjects.length,
    );
    if (!conflict && this.configManager.vsicons.projectDetection.autoReload) {
      // eslint-disable-next-line @typescript-eslint/unbound-method
      this.executeAndReload(this.applyCustomization, [projectDetectionResults]);
      return;
    }
    const items = conflict
      ? ([
          enums.ProjectNames[conflict.project],
          ...conflict.conflictingProjects.map(
            (cp: enums.Projects): string => enums.ProjectNames[cp],
          ),
        ] as string[])
      : [
          enums.LangResourceKeys.reload,
          enums.LangResourceKeys.autoReload,
          enums.LangResourceKeys.disableDetect,
        ];

    return this.showCustomizationMessage(
      projectDetectionResults[0].langResourceKey,
      items,
      // eslint-disable-next-line @typescript-eslint/unbound-method
      this.applyCustomization,
      [projectDetectionResults],
    );
  }

  private async togglePreset(
    preset: enums.PresetNames,
    command: enums.CommandNames,
    reverseAction: boolean,
    configurationTarget: enums.ConfigurationTarget | boolean,
  ): Promise<void> {
    const presetName = enums.PresetNames[preset];
    const commandName = enums.CommandNames[command];
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

    if (!Reflect.has(enums.LangResourceKeys, `${commandName}${action}`)) {
      throw Error(`${commandName}${action} is not valid`);
    }

    return this.showCustomizationMessage(
      '%s %s',
      [
        enums.LangResourceKeys[`${commandName}${action}`],
        enums.LangResourceKeys.restart,
        enums.LangResourceKeys.reload,
      ] as types.LangResourceLike[],
      // eslint-disable-next-line @typescript-eslint/unbound-method
      this.configManager.updatePreset,
      [presetName, toggledValue, configurationTarget],
    );
  }

  private async applyCustomization(
    projectDetectionResults?: types.ProjectDetectionResult[],
  ): Promise<void> {
    const associations = this.configManager.vsicons.associations;
    const customFiles: types.FileCollection = {
      default: associations.fileDefault,
      supported: associations.files,
    };
    const customFolders: types.FolderCollection = {
      default: associations.folderDefault,
      supported: associations.folders,
    };
    const iconsManifest = await this.iconsGenerator.generateIconsManifest(
      customFiles,
      customFolders,
      projectDetectionResults,
    );
    return this.iconsGenerator.persist(iconsManifest);
  }

  private async restoreManifest(): Promise<void> {
    const iconsManifest = await this.iconsGenerator.generateIconsManifest();
    return this.iconsGenerator.persist(iconsManifest);
  }

  private resetProjectDetectionDefaults(): Promise<void> {
    // We always need a fresh 'vsicons' configuration when checking the values
    // to take into account for user manually changed values
    if (this.configManager.vsicons.projectDetection.autoReload) {
      return this.configManager.updateAutoReload(false);
    }
    if (this.configManager.vsicons.projectDetection.disableDetect) {
      return this.configManager.updateDisableDetection(false);
    }
  }

  //#endregion

  //#region Event Listeners
  private async didChangeConfigurationListener(
    e: types.VSCodeConfigurationChangeEvent,
  ): Promise<void> {
    // Update the status in extension settings
    if (e.affectsConfiguration(constants.vscode.iconThemeSetting)) {
      const status =
        this.configManager.getIconTheme() === constants.extension.name
          ? enums.ExtensionStatus.activated
          : enums.ExtensionStatus.deactivated;
      if (this.settingsManager.getState().status !== status) {
        try {
          await this.settingsManager.updateStatus(status);
        } catch (error: unknown) {
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
      setTimeout((): void => this.executeAndReload(this.callback), 500);
    } else if (!this.customMsgShown) {
      const currentConfig = this.configManager.vsicons;
      const configChanged =
        !currentConfig.dontShowConfigManuallyChangedMessage &&
        this.configManager.hasConfigChanged(currentConfig, [
          constants.vsicons.presets.name,
          constants.vsicons.associations.name,
        ]);
      if (configChanged) {
        await this.applyCustomizationCommand([
          enums.LangResourceKeys.dontShowThis,
        ]);
        this.configManager.updateVSIconsConfigState();
      }
    }
    return;
  }
  //#endregion
}
