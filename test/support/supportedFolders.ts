/* tslint:disable max-line-length */
import {
  FileFormat,
  IFolderCollection,
  DefaultExtensionType,
} from '../../src/models';

export const extensions: IFolderCollection = {
  default: {
    folder: { icon: 'folder', type: DefaultExtensionType.folder, format: FileFormat.svg },
  },
  supported: [
    { icon: 'aws', extensions: ['aws', '.aws'], format: FileFormat.svg },
  ],
};
