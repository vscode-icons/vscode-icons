import * as models from '../models';

export function isFolders(preset: string): boolean {
  return preset.toLowerCase().includes('folders');
}

export function getFunc(preset: string): (iconsJson: models.IIconSchema) => boolean {
  switch (preset) {
    case 'hideFolders':
      return (iconsJson: models.IIconSchema) =>
        Object.keys(iconsJson.folderNames).length === 0 &&
        iconsJson.iconDefinitions._folder.iconPath === '';
    case 'foldersAllDefaultIcon':
      return (iconsJson: models.IIconSchema) =>
        Object.keys(iconsJson.folderNames).length === 0 &&
        iconsJson.iconDefinitions._folder.iconPath !== '';
    default:
      throw new Error('Not Implemented');
  }
}

export function getIconName(preset: string): string {
  const iconName = models.IconNames[preset];
  if (!iconName) { throw new Error('Not Implemented'); }
  return iconName;
}
