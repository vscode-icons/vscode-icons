import * as fs from 'fs';
import * as path from 'path';
import * as models from '../models';
import { parseJSON } from '../utils';
import { extensionSettings } from '../settings';

export class ManifestReader {

  public static iconsDisabled(name: string, isFile: boolean = true): boolean {
    const iconManifest = this.getIconManifest();
    const iconsJson = iconManifest && parseJSON(iconManifest) as models.IIconSchema;
    const prefix = isFile ? extensionSettings.manifestFilePrefix : extensionSettings.manifestFolderPrefix;
    const suffix = Reflect.ownKeys(models.Projects).some(key => models.Projects[key] === name) ? '_' : '';
    const defNamePattern = `${prefix}${name}${suffix}`;
    return !iconsJson || !Reflect.ownKeys(iconsJson.iconDefinitions)
      .filter(key => key.toString().startsWith(defNamePattern)).length;
  }

  public static folderIconsDisabled(func: (iconsJson: models.IIconSchema) => boolean): boolean {
    const iconManifest = this.getIconManifest();
    const iconsJson = iconManifest && parseJSON(iconManifest) as models.IIconSchema;
    return !iconsJson || !func(iconsJson);
  }

  private static getIconManifest(): string {
    const manifestFilePath = path.join(__dirname, '..', extensionSettings.iconJsonFileName);
    try {
      return fs.readFileSync(manifestFilePath, 'utf8');
    } catch (err) {
      return null;
    }
  }
}
