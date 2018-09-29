import { join } from 'path';
import { existsSync, writeFileSync, mkdirSync } from 'fs';
import * as models from '../models';
import * as manifest from '../../../package.json';
import { constants } from '../constants';
import { Utils } from '../utils';
import { ErrorHandler } from '../errorHandler';
import { CustomsMerger } from './customsMerger';
import { ManifestBuilder } from './manifestBuilder';
import { extensions as extFiles } from './supportedExtensions';
import { extensions as extFolders } from './supportedFolders';

export class IconsGenerator implements models.IIconsGenerator {
  private affectedPresets: models.IPresets;

  constructor(
    private vscodeManager?: models.IVSCodeManager,
    private configManager?: models.IConfigManager
  ) {
    // register event listener for configuration changes
    if (this.vscodeManager) {
      this.vscodeManager.workspace.onDidChangeConfiguration(
        this.didChangeConfigurationListener,
        this,
        this.vscodeManager.context.subscriptions
      );
    }
  }

  public generateIconsManifest(
    files?: models.IFileCollection,
    folders?: models.IFolderCollection,
    projectDetectionResult?: models.IProjectDetectionResult
  ): models.IIconSchema {
    // default icons manifest
    if (!files && !folders) {
      return ManifestBuilder.buildManifest(extFiles, extFolders);
    }

    // customs merged icons manifest
    if (!this.configManager) {
      throw new ReferenceError(`'configManager' not set to an instance`);
    }
    const vsiconsConfig = this.configManager.vsicons;
    const merged = CustomsMerger.merge(
      files,
      extFiles,
      folders,
      extFolders,
      vsiconsConfig.presets,
      projectDetectionResult,
      this.affectedPresets
    );
    const customIconsDirPath =
      vsiconsConfig.customIconFolderPath &&
      this.configManager.getCustomIconsDirPath(
        vsiconsConfig.customIconFolderPath
      );
    const iconsManifest = ManifestBuilder.buildManifest(
      merged.files,
      merged.folders,
      customIconsDirPath
    );

    // apply non icons related config settings
    iconsManifest.hidesExplorerArrows =
      vsiconsConfig.presets.hideExplorerArrows;

    return iconsManifest;
  }

  public persist(
    iconsManifest: models.IIconSchema,
    updatePackageJson: boolean = false
  ): Thenable<void> {
    const iconsManifestDirPath = join(__dirname, '../../../', 'out/src');
    this.writeIconsManifestToFile(
      constants.iconsManifest.filename,
      iconsManifest,
      iconsManifestDirPath
    );
    if (updatePackageJson) {
      const iconsFolderRelativePath = `${Utils.getRelativePath(
        '.',
        iconsManifestDirPath
      )}${constants.iconsManifest.filename}`;
      return this.updatePackageJson(iconsFolderRelativePath);
    }
    return Promise.resolve();
  }

  private writeIconsManifestToFile(
    iconsFilename: string,
    iconsManifest: models.IIconSchema,
    outDir: string
  ): void {
    try {
      if (!existsSync(outDir)) {
        mkdirSync(outDir);
      }

      writeFileSync(
        Utils.pathUnixJoin(outDir, iconsFilename),
        JSON.stringify(iconsManifest, null, 2)
      );
      // tslint:disable-next-line no-console
      console.info(
        `[${
          constants.extension.name
        }] Icons manifest file successfully generated!`
      );
    } catch (error) {
      ErrorHandler.logError(error);
    }
  }

  private updatePackageJson(iconsFolderPath: string): Thenable<void> {
    const oldIconsThemesFolderPath = manifest.contributes.iconThemes[0].path;
    const replacer = (rawText: string[]): string[] => {
      const foundLineIndex = rawText.findIndex(
        line =>
          line.includes('"path"') &&
          line.includes(constants.iconsManifest.filename)
      );
      if (foundLineIndex < 0) {
        return rawText;
      }
      const dotEscapedFilename = constants.iconsManifest.filename.replace(
        '.',
        '\\.'
      );
      rawText[foundLineIndex] = rawText[foundLineIndex].replace(
        new RegExp(`(.*").*${dotEscapedFilename}(.*".*)`),
        `$1${iconsFolderPath}$2`
      );
      return rawText;
    };
    if (
      !oldIconsThemesFolderPath ||
      oldIconsThemesFolderPath === iconsFolderPath
    ) {
      return Promise.resolve();
    }
    return Utils.updateFile(
      Utils.pathUnixJoin(__dirname, '../../../', 'package.json'),
      replacer
    ).then(
      () =>
        // tslint:disable-next-line no-console
        console.info(
          `[${constants.extension.name}] Icons path in 'package.json' updated`
        ),
      (error: Error) => ErrorHandler.logError(error)
    );
  }

  private didChangeConfigurationListener(
    e: models.IVSCodeConfigurationChangeEvent
  ): void {
    if (!e || !e.affectsConfiguration) {
      throw new Error(
        `Unsupported 'vscode' version: ${this.vscodeManager.version}`
      );
    }

    this.affectedPresets = {
      angular: e.affectsConfiguration(constants.vsicons.presets.angular),
      jsOfficial: false,
      tsOfficial: false,
      jsonOfficial: false,
      foldersAllDefaultIcon: false,
      hideExplorerArrows: false,
      hideFolders: false,
    };
  }
}
