import { readFileSync } from 'fs';
import { join } from 'path';
import * as models from '../models';
import { Utils } from '../utils';
import { constants } from '../constants';

export class ManifestReader {
  public static getToggledValue(
    preset: models.PresetNames,
    presets: models.IPresets
  ): boolean {
    const isNonIconsRelatedPreset = () =>
      [models.PresetNames.hideExplorerArrows].some(prst => prst === preset);
    const isFoldersRelatedPreset = () =>
      [
        models.PresetNames.hideFolders,
        models.PresetNames.foldersAllDefaultIcon,
      ].some(prst => prst === preset);
    const presetName = models.PresetNames[preset];

    return isNonIconsRelatedPreset()
      ? !presets[presetName]
      : isFoldersRelatedPreset()
        ? !ManifestReader.folderIconsDisabled(presetName)
        : ManifestReader.iconsDisabled(models.IconNames[presetName]);
  }

  public static iconsDisabled(name: string, isFile: boolean = true): boolean {
    const iconManifest: string = this.getIconManifest();
    const iconsJson: models.IIconSchema = Utils.parseJSON(iconManifest);
    const prefix: string = isFile
      ? constants.iconsManifest.definitionFilePrefix
      : constants.iconsManifest.definitionFolderPrefix;
    const suffix: string = Reflect.ownKeys(models.Projects).some(
      key => models.Projects[key] === name
    )
      ? '_'
      : '';
    const defNamePattern = `${prefix}${name}${suffix}`;
    return (
      !iconsJson ||
      !Reflect.ownKeys(iconsJson.iconDefinitions).filter(key =>
        key.toString().startsWith(defNamePattern)
      ).length
    );
  }

  public static folderIconsDisabled(presetName: string): boolean {
    const manifest: string = this.getIconManifest();
    const iconsJson: models.IIconSchema = Utils.parseJSON(manifest);
    if (!iconsJson) {
      return true;
    }
    switch (models.PresetNames[presetName]) {
      case models.PresetNames.hideFolders:
        return (
          Reflect.ownKeys(iconsJson.folderNames).length === 0 &&
          iconsJson.iconDefinitions._folder.iconPath === ''
        );
      case models.PresetNames.foldersAllDefaultIcon:
        return (
          Reflect.ownKeys(iconsJson.folderNames).length === 0 &&
          iconsJson.iconDefinitions._folder.iconPath !== ''
        );
      default:
        throw new Error('Not Implemented');
    }
  }

  private static getIconManifest(): string {
    const manifestFilePath = join(
      __dirname,
      '..',
      constants.iconsManifest.filename
    );
    try {
      return readFileSync(manifestFilePath, 'utf8');
    } catch (err) {
      return null;
    }
  }
}
