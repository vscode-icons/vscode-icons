/* tslint:disable max-line-length */
import {
  IExtensionCollection,
  IFolderExtension,
  FileFormat,
  IDefaultFolderCollection,
  DefaultExtensionType,
} from '../../src/models';

export const extensions: (IExtensionCollection<IFolderExtension> & IDefaultFolderCollection) = {
  default: {
    folder: { icon: 'folder', type: DefaultExtensionType.folder, format: FileFormat.svg },
  },
  supported: [
    { icon: 'aws', extensions: ['aws', '.aws'], format: FileFormat.svg },
  ],
};
