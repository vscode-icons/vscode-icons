import { cloneDeep, unionWith, isEqual } from 'lodash';
import { dirname, isAbsolute } from 'path';
import { existsSync } from 'fs';
import {
  IConfigManager,
  IVSCodeManager,
  IVSCodeWorkspaceConfiguration,
  IVSIcons,
  IFileExtension,
  ConfigurationTarget,
} from '../models';
import { constants } from '../constants';
import { Utils } from '../utils';
import { ErrorHandler } from '../errorHandler';

export class ConfigManager implements IConfigManager {
  /**
   * Returns a `user` and `workspace` merged `vsicons` configuration
   *
   * **Note:** When you want to access `vsicons` configuration always
   * call this function
   */
  public get vsicons(): IVSIcons {
    // ALWAYS use 'getConfiguration' to get a fresh copy of the `vsicons` configurations
    const mergedConfig = cloneDeep(
      this.vscodeManager.workspace.getConfiguration()[constants.vsicons.name]
    );
    const files = this.configuration.inspect<IFileExtension[]>(
      constants.vsicons.associations.filesSetting
    );
    mergedConfig.associations.files = unionWith(
      files.workspaceValue,
      files.globalValue,
      isEqual
    );
    const folders = this.configuration.inspect<IFileExtension[]>(
      constants.vsicons.associations.foldersSetting
    );
    mergedConfig.associations.folders = unionWith(
      folders.workspaceValue,
      folders.globalValue,
      isEqual
    );
    return mergedConfig;
  }

  public static removeSettings(): Thenable<void> {
    const vscodeSettingsFilePath = Utils.pathUnixJoin(
      this.getAppUserPath(dirname(__filename)),
      constants.vscode.settingsFilename
    );
    const replacer = (rawText: string[]): string[] => {
      rawText = this.removeVSIconsConfigs(rawText);
      rawText = this.resetIconTheme(rawText);
      rawText = this.removeLastEntryTrailingComma(rawText);
      return rawText;
    };
    return Utils.updateFile(vscodeSettingsFilePath, replacer).then(
      void 0,
      error => ErrorHandler.logError(error)
    );
  }

  private static getAppUserPath(dirPath: string): string {
    const vscodeAppName = /[\\|/]\.vscode-oss-dev/i.test(dirPath)
      ? 'code-oss-dev'
      : /[\\|/]\.vscode-oss/i.test(dirPath)
        ? 'Code - OSS'
        : /[\\|/]\.vscode-insiders/i.test(dirPath)
          ? 'Code - Insiders'
          : /[\\|/]\.vscode/i.test(dirPath)
            ? 'Code'
            : 'user-data';
    // workaround until `process.env.VSCODE_PORTABLE` gets available
    const vscodePortable = () => {
      if (vscodeAppName !== 'user-data') {
        return undefined;
      }
      let dataDir: string;
      switch (process.platform) {
        case 'darwin':
          const isInsiders = existsSync(
            Utils.pathUnixJoin(
              process.env.VSCODE_CWD,
              'code-insiders-portable-data'
            )
          );
          dataDir = `code-${isInsiders ? 'insiders-' : ''}portable-data`;
          break;
        default:
          dataDir = 'data';
          break;
      }
      return Utils.pathUnixJoin(process.env.VSCODE_CWD, dataDir);
    };
    const appPath =
      process.env.VSCODE_PORTABLE ||
      vscodePortable() ||
      Utils.getAppDataDirPath();
    return Utils.pathUnixJoin(appPath, vscodeAppName, 'User');
  }

  private static removeVSIconsConfigs(source: string[]): string[] {
    const findLinesToRemove = (): number[] => {
      const linesToRemove = [];
      const regexp = new RegExp(`^\\s*"${constants.vsicons.name}\\.`);
      const addTo = (value: string, index: number, array: string[]) => {
        if (!regexp.test(value)) {
          return;
        }
        linesToRemove.push(index);
        let counter = 0;
        if (/[\{\[]\s*$/.test(array[index])) {
          counter++;
          while (counter > 0) {
            linesToRemove.push(++index);
            if (/[\{\[]/.test(array[index])) {
              counter++;
            }
            if (/[\}\]]/.test(array[index])) {
              counter--;
            }
          }
        }
      };
      source.forEach(addTo);
      return linesToRemove;
    };
    findLinesToRemove().forEach((lineIndex, i) =>
      source.splice(lineIndex - i, 1)
    );
    return source;
  }

  private static resetIconTheme(source: string[]): string[] {
    const foundLineIndex = source.findIndex(
      line =>
        line.includes(constants.vscode.iconThemeSetting) &&
        line.includes(constants.extension.name)
    );
    if (foundLineIndex > -1) {
      source.splice(foundLineIndex, 1);
    }
    return source;
  }

  private static removeLastEntryTrailingComma(source: string[]): string[] {
    const lastSettingsLine = source.lastIndexOf('}') - 1;
    if (lastSettingsLine < 0) {
      return source;
    }
    source[lastSettingsLine] = source[lastSettingsLine].replace(/,\s*$/, '');
    return source;
  }

  private readonly configuration: IVSCodeWorkspaceConfiguration;
  private readonly initVSIconsConfig: IVSIcons;

  constructor(private vscodeManager: IVSCodeManager) {
    // Acts as a static reference to configuration
    // Should only be used when you want to access the configuration functions
    // DO NOT use it to access the `vsicons` configuration,
    // use the `vsicons` function instead
    this.configuration = this.vscodeManager.workspace.getConfiguration();

    this.initVSIconsConfig = this.vsicons;
  }

  // This function is much faster than the old one
  public hasConfigChanged(
    currentConfig: IVSIcons | undefined,
    sections?: string[]
  ): boolean {
    const filter = (obj: IVSIcons, keys: string[]) =>
      (Reflect.ownKeys(obj || {}) as string[])
        .filter((key, __, array) => (keys || array).indexOf(key) !== -1)
        .reduce((nObj, key) => ({ ...nObj, [key]: obj[key] }), {});
    const a = filter(this.initVSIconsConfig, sections);
    const b = filter(currentConfig, sections);
    return !isEqual(a, b);
  }

  public getCustomIconsDirPath(dirPath: string): string {
    if (!dirPath) {
      return this.vscodeManager.getAppUserDirPath();
    }
    const workspacePaths: string[] = this.vscodeManager.getWorkspacePaths();
    const dPath = dirPath.trim();
    if (isAbsolute(dPath) || !workspacePaths || !workspacePaths.length) {
      return dPath;
    }
    const absWspPath = workspacePaths.find(wsp => existsSync(wsp)) || '';
    return Utils.pathUnixJoin(absWspPath, dPath);
  }

  public getIconTheme(): string {
    return this.configuration.get<string>(constants.vscode.iconThemeSetting);
  }

  public getPreset<T>(
    presetName: string
  ):
    | {
        key: string;
        defaultValue?: T;
        globalValue?: T;
        workspaceValue?: T;
        workspaceFolderValue?: T;
      }
    | undefined {
    return this.configuration.inspect<T>(presetName);
  }

  public updateDontShowNewVersionMessage(value: boolean): Thenable<void> {
    return this.configuration.update(
      constants.vsicons.dontShowNewVersionMessageSetting,
      value,
      ConfigurationTarget.Global
    );
  }

  public updateDontShowConfigManuallyChangedMessage(
    value: boolean
  ): Thenable<void> {
    return this.configuration.update(
      constants.vsicons.dontShowConfigManuallyChangedMessageSetting,
      value,
      ConfigurationTarget.Global
    );
  }

  public updateAutoReload(value: boolean): Thenable<void> {
    return this.configuration.update(
      constants.vsicons.projectDetectionAutoReloadSetting,
      value,
      ConfigurationTarget.Global
    );
  }

  public updateDisableDetection(value: boolean): Thenable<void> {
    return this.configuration.update(
      constants.vsicons.projectDetectionDisableDetectSetting,
      value,
      ConfigurationTarget.Global
    );
  }

  public updateIconTheme(): Thenable<void> {
    return this.configuration.update(
      constants.vscode.iconThemeSetting,
      constants.extension.name,
      ConfigurationTarget.Global
    );
  }

  public updatePreset(
    presetName: string,
    value: boolean,
    configurationTarget: ConfigurationTarget | boolean
  ): Thenable<void> {
    const removePreset =
      this.configuration.inspect(
        `${constants.vsicons.presets.fullname}.${presetName}`
      ).defaultValue === value;
    return this.configuration.update(
      `${constants.vsicons.presets.fullname}.${presetName}`,
      removePreset ? undefined : value,
      configurationTarget
    );
  }
}
