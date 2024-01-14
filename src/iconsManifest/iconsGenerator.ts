import * as packageJson from '../../../package.json';
import { ErrorHandler } from '../common/errorHandler';
import { existsAsync, writeFileAsync } from '../common/fsAsync';
import { ConfigManager } from '../configuration/configManager';
import { constants } from '../constants';
import * as models from '../models';
import { Utils } from '../utils';
import { CustomsMerger } from './customsMerger';
import { ManifestBuilder } from './manifestBuilder';
import { extensions as extFiles } from './supportedExtensions';
import { extensions as extFolders } from './supportedFolders';
import { IPackageManifest } from '../models/packageManifest';

export class IconsGenerator implements models.IIconsGenerator {
  private readonly manifest: IPackageManifest;
  private affectedPresets: models.IPresets;

  constructor(
    private vscodeManager?: models.IVSCodeManager,
    private configManager?: models.IConfigManager,
  ) {
    this.manifest = packageJson as IPackageManifest;
    // register event listener for configuration changes
    if (this.vscodeManager) {
      this.vscodeManager.workspace.onDidChangeConfiguration(
        // eslint-disable-next-line @typescript-eslint/unbound-method
        this.didChangeConfigurationListener,
        this,
        this.vscodeManager.context.subscriptions,
      );
    }
  }

  public async generateIconsManifest(
    files?: models.IFileCollection,
    folders?: models.IFolderCollection,
    projectDetectionResults?: models.IProjectDetectionResult[],
  ): Promise<models.IIconSchema> {
    // default icons manifest
    if (!files && !folders) {
      return ManifestBuilder.buildManifest(extFiles, extFolders);
    }

    // customs merged icons manifest
    if (!this.configManager) {
      throw new ReferenceError(`'configManager' not set to an instance`);
    }
    const vsiconsConfig = this.configManager.vsicons;
    const mergedCollection = await CustomsMerger.merge(
      files,
      extFiles,
      folders,
      extFolders,
      vsiconsConfig.presets,
      projectDetectionResults,
      this.affectedPresets,
    );
    const customIconsDirPath = await this.configManager.getCustomIconsDirPath(
      vsiconsConfig.customIconFolderPath,
    );
    const iconsManifest = await ManifestBuilder.buildManifest(
      mergedCollection.files,
      mergedCollection.folders,
      customIconsDirPath,
    );

    // apply non icons related config settings
    iconsManifest.hidesExplorerArrows =
      vsiconsConfig.presets.hideExplorerArrows;

    return iconsManifest;
  }

  public async persist(
    iconsManifest: models.IIconSchema,
    updatePackageJson = false,
  ): Promise<void> {
    await this.writeIconsManifestToFile(
      constants.iconsManifest.filename,
      iconsManifest,
      ConfigManager.sourceDir,
    );
    if (!updatePackageJson) {
      return;
    }
    return this.updatePackageJson();
  }

  private async writeIconsManifestToFile(
    iconsFilename: string,
    iconsManifest: models.IIconSchema,
    outDir: string,
  ): Promise<void> {
    try {
      const dirExists = await existsAsync(outDir);
      if (!dirExists) {
        await Utils.createDirectoryRecursively(outDir);
      }

      await writeFileAsync(
        Utils.pathUnixJoin(outDir, iconsFilename),
        JSON.stringify(
          iconsManifest,
          null,
          constants.environment.production ? 0 : 2,
        ),
      );

      console.info(
        `[${constants.extension.name}] Icons manifest file successfully generated!`,
      );
    } catch (error: unknown) {
      ErrorHandler.logError(error);
    }
  }

  private async updatePackageJson(): Promise<void> {
    const sourceDirRelativePath = await Utils.getRelativePath(
      ConfigManager.rootDir,
      ConfigManager.sourceDir,
    );

    const entryFilename = constants.environment.production
      ? constants.extension.distEntryFilename
      : '';
    const entryPath = `${sourceDirRelativePath}${entryFilename}`;
    const oldMainPath = this.manifest.main;
    const mainPathChanged = oldMainPath && oldMainPath !== entryPath;

    const uninstallEntryFilename = constants.environment.production
      ? constants.extension.uninstallEntryFilename
      : 'uninstall.js';
    const uninstallEntryPath = `node ./${sourceDirRelativePath}${uninstallEntryFilename}`;
    const oldUninstallScriptPath = this.manifest.scripts['vscode:uninstall'];
    const uninstallScriptPathChanged =
      oldUninstallScriptPath && oldUninstallScriptPath !== uninstallEntryPath;

    const iconsDirRelativePath = `${sourceDirRelativePath}${constants.iconsManifest.filename}`;
    const iconTheme = this.manifest.contributes.iconThemes[0];
    const oldIconsThemesPath = iconTheme.path;
    const iconThemePathChanged =
      oldIconsThemesPath && oldIconsThemesPath !== iconsDirRelativePath;

    if (
      !iconThemePathChanged &&
      !mainPathChanged &&
      !uninstallScriptPathChanged
    ) {
      return;
    }
    const replacer = (rawText: string[]): string[] => {
      // update 'contributes.iconTheme.path'
      let predicate = (line: string): boolean => line.includes('"path"');
      let lineIndex = rawText.findIndex(predicate);
      if (lineIndex > -1) {
        rawText[lineIndex] = rawText[lineIndex].replace(
          oldIconsThemesPath,
          iconsDirRelativePath,
        );
        console.info(
          `[${constants.extension.name}] Icons path in 'package.json' updated`,
        );
      }
      // update 'main'
      predicate = (line: string): boolean => line.includes('"main"');
      lineIndex = rawText.findIndex(predicate);
      if (lineIndex > -1) {
        rawText[lineIndex] = rawText[lineIndex].replace(
          this.manifest.main,
          entryPath,
        );
        console.info(
          `[${constants.extension.name}] Entrypoint in 'package.json' updated`,
        );
      }
      // update 'vscode:uninstall' script
      predicate = (line: string): boolean =>
        line.includes('"vscode:uninstall"');
      lineIndex = rawText.findIndex(predicate);
      if (lineIndex > -1) {
        rawText[lineIndex] = rawText[lineIndex].replace(
          this.manifest.scripts['vscode:uninstall'],
          uninstallEntryPath,
        );
        // eslint-disable-next-line no-console
        console.info(
          `[${constants.extension.name}] Script 'vscode:uninstall' in 'package.json' updated`,
        );
      }
      return rawText;
    };
    try {
      await Utils.updateFile(
        Utils.pathUnixJoin(ConfigManager.rootDir, 'package.json'),
        replacer,
      );
    } catch (error: unknown) {
      ErrorHandler.logError(error);
    }
  }

  private didChangeConfigurationListener(
    e: models.IVSCodeConfigurationChangeEvent,
  ): void {
    this.affectedPresets = {
      angular: e.affectsConfiguration(constants.vsicons.presets.angular),
      nestjs: e.affectsConfiguration(constants.vsicons.presets.nestjs),
      jsOfficial: false,
      tsOfficial: false,
      jsonOfficial: false,
      foldersAllDefaultIcon: false,
      hideExplorerArrows: false,
      hideFolders: false,
    };
  }
}
