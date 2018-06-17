import { IExtensionSettings } from '../models';
import * as manifest from '../../../package.json';

export const extensionSettings: IExtensionSettings = {
  version: manifest.version,
  iconJsonFileName: 'icons.json',
  iconSuffix: '',
  filePrefix: 'file_type_',
  fileLightPrefix: 'file_type_light_',
  folderPrefix: 'folder_type_',
  folderLightPrefix: 'folder_type_light_',
  defaultExtensionPrefix: 'default_',
  manifestFilePrefix: '_f_',
  manifestFileLightPrefix: '_f_light_',
  manifestFolderPrefix: '_fd_',
  manifestFolderLightPrefix: '_fd_light_',
  customIconFolderName: 'vsicons-custom-icons',
};
