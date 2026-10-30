import type * as types from '../types';

import { readFileAsync } from '../common/fsAsync';
import { ConfigManager } from '../configuration/configManager';
import { constants } from '../constants';
import * as enums from '../types/enums';
import { Utils } from '../utils';

export class ManifestReader {
  public static async getToggledValue(
    preset: enums.PresetNames,
    presets: types.Presets,
  ): Promise<boolean> {
    const isNonIconsRelatedPreset = (): boolean =>
      [enums.PresetNames.hideExplorerArrows].some(
        (prst: enums.PresetNames): boolean => prst === preset,
      );
    const isFoldersRelatedPreset = (): boolean =>
      [
        enums.PresetNames.hideFolders,
        enums.PresetNames.foldersAllDefaultIcon,
      ].some((prst: enums.PresetNames): boolean => prst === preset);
    const presetName: string = enums.PresetNames[preset];
    const iconName: string =
      enums.IconNames[presetName as keyof typeof enums.IconNames]?.toString();

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
    const iconsJson: types.VSCodeIconSchema =
      Utils.parseJSONSafe<types.VSCodeIconSchema>(iconManifest);
    const prefix: string = isFile
      ? constants.iconsManifest.definitionFilePrefix
      : constants.iconsManifest.definitionFolderPrefix;
    const suffix: string = Reflect.ownKeys(enums.Projects).some(
      (key: string | number | symbol): boolean => enums.Projects[key] === name,
    )
      ? '_'
      : '';
    const defNamePattern = `${prefix}${name}${suffix}`;
    return (
      !iconsJson ||
      !Reflect.ownKeys(iconsJson.iconDefinitions).filter(
        (key: string | number | symbol): boolean =>
          key.toString().startsWith(defNamePattern),
      ).length
    );
  }

  public static async folderIconsDisabled(
    presetName: string,
  ): Promise<boolean> {
    const manifest: string = await this.getIconManifest();
    const iconsJson: types.VSCodeIconSchema =
      Utils.parseJSONSafe<types.VSCodeIconSchema>(manifest);
    if (!iconsJson) {
      return true;
    }
    switch (enums.PresetNames[presetName]) {
      case enums.PresetNames.hideFolders:
        return (
          Reflect.ownKeys(iconsJson.folderNames).length === 0 &&
          iconsJson.iconDefinitions._folder.iconPath === ''
        );
      case enums.PresetNames.foldersAllDefaultIcon:
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
    } catch {
      return null;
    }
  }
}
