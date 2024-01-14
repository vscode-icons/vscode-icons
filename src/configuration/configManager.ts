import { cloneDeep, isEqual, unionWith } from 'lodash';
import { dirname, isAbsolute, resolve } from 'path';
import { ErrorHandler } from '../common/errorHandler';
import { existsAsync, readdirAsync } from '../common/fsAsync';
import { constants } from '../constants';
import {
  ConfigurationTarget,
  IConfigManager,
  IFileExtension,
  IFolderExtension,
  IPreset,
  IVSCodeManager,
  IVSCodeWorkspaceConfiguration,
  IVSIcons,
} from '../models';
import { Utils } from '../utils';

export class ConfigManager implements IConfigManager {
  private static rootdir: string;

  private readonly configuration: IVSCodeWorkspaceConfiguration;
  private initVSIconsConfig: IVSIcons;

  constructor(private vscodeManager: IVSCodeManager) {
    // Acts as a static reference to configuration
    // Should only be used when you want to access the configuration functions
    // DO NOT use it to access the `vsicons` configuration,
    // use the `vsicons` function instead
    this.configuration = this.vscodeManager.workspace.getConfiguration();

    this.initVSIconsConfig = this.vsicons;
  }

  public static get rootDir(): string {
    return this.rootdir || resolve(dirname(__filename), '../../../');
  }

  public static get outDir(): string {
    const dirName = constants.environment.production
      ? constants.extension.distDirName
      : constants.extension.outDirName;
    return resolve(this.rootDir, dirName);
  }

  public static get sourceDir(): string {
    return resolve(this.outDir, constants.extension.srcDirName);
  }

  public static get iconsDir(): string {
    return resolve(this.rootDir, constants.extension.iconsDirName);
  }

  /**
   * Returns a `user` and `workspace` merged `vsicons` configuration
   *
   * **Note:** When you want to access `vsicons` configuration always
   * call this function
   */
  public get vsicons(): IVSIcons {
    // ALWAYS use 'getConfiguration' to get a fresh copy of the `vsicons` configurations
    const mergedConfig: IVSIcons = cloneDeep<IVSIcons>(
      this.vscodeManager.workspace.getConfiguration()[
        constants.vsicons.name
      ] as IVSIcons,
    );
    const files: IPreset<IFileExtension[]> = this.configuration.inspect<
      IFileExtension[]
    >(constants.vsicons.associations.filesSetting);
    mergedConfig.associations.files = unionWith<IFileExtension>(
      files.workspaceValue,
      files.globalValue,
      isEqual,
    );
    const folders: IPreset<IFolderExtension[]> = this.configuration.inspect<
      IFolderExtension[]
    >(constants.vsicons.associations.foldersSetting);
    mergedConfig.associations.folders = unionWith<IFolderExtension>(
      folders.workspaceValue,
      folders.globalValue,
      isEqual,
    );
    return mergedConfig;
  }

  public static set rootDir(value: string) {
    this.rootdir = value || this.rootdir;
  }

  public static async removeSettings(): Promise<void> {
    const isSingleInstallation = await this.isSingleInstallation();
    if (!isSingleInstallation) {
      return;
    }
    const vscodeSettingsFilePath = Utils.pathUnixJoin(
      await this.getAppUserPath(dirname(__filename)),
      constants.vscode.settingsFilename,
    );
    const replacer = (rawText: string[]): string[] => {
      rawText = this.removeVSIconsConfigs(rawText);
      rawText = this.resetIconTheme(rawText);
      rawText = this.removeLastEntryTrailingComma(rawText);
      return rawText;
    };
    try {
      await Utils.updateFile(vscodeSettingsFilePath, replacer);
    } catch (error: unknown) {
      ErrorHandler.logError(error);
    }
  }

  public static async isSingleInstallation(): Promise<boolean> {
    const regex = new RegExp(
      `(.+[\\|/]extensions[\\|/])(?:.*${constants.extension.name})`,
    );
    const matches = regex.exec(dirname(__filename));
    const vscodeExtensionDirPath: string =
      (matches && matches.length > 0 && matches[1]) || './';
    const extensionNameRegExp = new RegExp(`.*${constants.extension.name}`);
    const existingInstallations: number = (
      await readdirAsync(vscodeExtensionDirPath)
    ).filter((filename: string) => extensionNameRegExp.test(filename)).length;
    return existingInstallations === 1;
  }

  private static async getAppUserPath(dirPath: string): Promise<string> {
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
    const vscodePortable = async (): Promise<string> => {
      if (vscodeAppName !== 'user-data') {
        return undefined;
      }
      const isInsiders = await existsAsync(
        Utils.pathUnixJoin(
          process.env.VSCODE_CWD,
          'code-insiders-portable-data',
        ),
      );
      let dataDir: string;
      switch (process.platform) {
        case 'darwin':
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
      (await vscodePortable()) ||
      Utils.getAppDataDirPath();
    return Utils.pathUnixJoin(appPath, vscodeAppName, 'User');
  }

  private static removeVSIconsConfigs(source: string[]): string[] {
    const findLinesToRemove = (): number[] => {
      const linesToRemove: number[] = [];
      const regexp = new RegExp(`^\\s*"${constants.vsicons.name}\\.`);
      const addTo = (value: string, index: number, array: string[]): void => {
        if (!regexp.test(value)) {
          return;
        }
        linesToRemove.push(index);
        let counter = 0;
        if (/[{[]\s*$/.test(array[index])) {
          counter++;
        }
        if (/\[\{\s*$/.test(array[index])) {
          counter++;
        }
        while (counter > 0) {
          linesToRemove.push(++index);
          if (/[{[]/.test(array[index])) {
            counter++;
          }
          if (/[}\]]/.test(array[index])) {
            counter--;
          }
        }
      };
      source.forEach(addTo);
      return linesToRemove;
    };
    findLinesToRemove().forEach((lineIndex, i) =>
      source.splice(lineIndex - i, 1),
    );
    return source;
  }

  private static resetIconTheme(source: string[]): string[] {
    const foundLineIndex = source.findIndex(
      (line: string) =>
        line.includes(constants.vscode.iconThemeSetting) &&
        line.includes(constants.extension.name),
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

  public updateVSIconsConfigState(): void {
    if (!this.vscodeManager.supportsThemesReload) {
      return;
    }
    this.initVSIconsConfig = this.vsicons;
  }

  public hasConfigChanged(
    currentConfig: IVSIcons | undefined,
    sections?: string[],
  ): boolean {
    const filter = (obj: IVSIcons, keys: string[]): Record<string, string[]> =>
      (Reflect.ownKeys(obj || {}) as string[])
        .filter((key, __, array) => (keys || array).includes(key))
        .reduce((nObj, key) => ({ ...nObj, [key]: obj[key] as string[] }), {});
    const a = filter(this.initVSIconsConfig, sections);
    const b = filter(currentConfig, sections);
    return !isEqual(a, b);
  }

  public async getCustomIconsDirPath(dirPath: string): Promise<string> {
    if (!dirPath) {
      return this.vscodeManager.getAppUserDirPath();
    }
    const workspacePaths: string[] = this.vscodeManager.getWorkspacePaths();
    const dPath = dirPath.trim();
    if (isAbsolute(dPath) || !workspacePaths || !workspacePaths.length) {
      return dPath;
    }
    const iterator = async (wsp: string): Promise<string> =>
      (await existsAsync(wsp)) ? wsp : '';

    const promises: Array<Promise<string>> = [];
    workspacePaths.forEach((wsp: string) => promises.push(iterator(wsp)));
    const absWspPath: string = (await Promise.all(promises)).find(
      (path: string) => !!path,
    );
    return Utils.pathUnixJoin(absWspPath, dPath);
  }

  public getIconTheme(): string {
    return this.configuration.get<string>(constants.vscode.iconThemeSetting);
  }

  public getPreset<T>(presetName: string): IPreset<T> | undefined {
    return this.configuration.inspect<T>(presetName);
  }

  public async updateDontShowNewVersionMessage(value: boolean): Promise<void> {
    return this.configuration.update(
      constants.vsicons.dontShowNewVersionMessageSetting,
      value,
      ConfigurationTarget.Global,
    );
  }

  public async updateDontShowConfigManuallyChangedMessage(
    value: boolean,
  ): Promise<void> {
    return this.configuration.update(
      constants.vsicons.dontShowConfigManuallyChangedMessageSetting,
      value,
      ConfigurationTarget.Global,
    );
  }

  public async updateAutoReload(value: boolean): Promise<void> {
    return this.configuration.update(
      constants.vsicons.projectDetectionAutoReloadSetting,
      value,
      ConfigurationTarget.Global,
    );
  }

  public async updateDisableDetection(value: boolean): Promise<void> {
    return this.configuration.update(
      constants.vsicons.projectDetectionDisableDetectSetting,
      value,
      ConfigurationTarget.Global,
    );
  }

  public async updateIconTheme(): Promise<void> {
    return this.configuration.update(
      constants.vscode.iconThemeSetting,
      constants.extension.name,
      ConfigurationTarget.Global,
    );
  }

  public async updatePreset(
    presetName: string,
    value: boolean,
    configurationTarget: ConfigurationTarget | boolean,
  ): Promise<void> {
    const removePreset =
      this.configuration.inspect(
        `${constants.vsicons.presets.fullname}.${presetName}`,
      ).defaultValue === value;
    return this.configuration.update(
      `${constants.vsicons.presets.fullname}.${presetName}`,
      removePreset ? undefined : value,
      configurationTarget,
    );
  }
}
