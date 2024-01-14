import { readFileAsync } from '../common/fsAsync';
import { ConfigManager } from '../configuration/configManager';
import { constants } from '../constants';
import * as models from '../models';
import { Utils } from '../utils';

export class ManifestReader {
  public static async getToggledValue(
    preset: models.PresetNames,
    presets: models.IPresets,
  ): Promise<boolean> {
    const isNonIconsRelatedPreset = (): boolean =>
      [models.PresetNames.hideExplorerArrows].some(
        (prst: models.PresetNames) => prst === preset,
      );
    const isFoldersRelatedPreset = (): boolean =>
      [
        models.PresetNames.hideFolders,
        models.PresetNames.foldersAllDefaultIcon,
      ].some((prst: models.PresetNames) => prst === preset);
    const presetName: string = models.PresetNames[preset];
    const iconName: string =
      models.IconNames[presetName as keyof typeof models.IconNames]?.toString();

    return isNonIconsRelatedPreset()
      ? !presets[presetName]
      : isFoldersRelatedPreset()
        ? !(await ManifestReader.folderIconsDisabled(presetName))
        : ManifestReader.iconsDisabled(iconName);
  }

  public static async iconsDisabled(
    name: string,
    isFile = true,
  ): Promise<boolean> {
    const iconManifest: string = await this.getIconManifest();
    const iconsJson: models.IIconSchema =
      Utils.parseJSONSafe<models.IIconSchema>(iconManifest);
    const prefix: string = isFile
      ? constants.iconsManifest.definitionFilePrefix
      : constants.iconsManifest.definitionFolderPrefix;
    const suffix: string = Reflect.ownKeys(models.Projects).some(
      (key: string | number | symbol) => models.Projects[key] === name,
    )
      ? '_'
      : '';
    const defNamePattern = `${prefix}${name}${suffix}`;
    return (
      !iconsJson ||
      !Reflect.ownKeys(iconsJson.iconDefinitions).filter(
        (key: string | number | symbol) =>
          key.toString().startsWith(defNamePattern),
      ).length
    );
  }

  public static async folderIconsDisabled(
    presetName: string,
  ): Promise<boolean> {
    const manifest: string = await this.getIconManifest();
    const iconsJson: models.IIconSchema =
      Utils.parseJSONSafe<models.IIconSchema>(manifest);
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

  private static async getIconManifest(): Promise<string> {
    const manifestFilePath = Utils.pathUnixJoin(
      ConfigManager.sourceDir,
      constants.iconsManifest.filename,
    );
    try {
      return readFileAsync(manifestFilePath, 'utf8');
    } catch (err) {
      return null;
    }
  }
}
