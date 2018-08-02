/* tslint:disable max-line-length */
import { FileFormat, IFolderCollection } from '../../src/models';

export const extensions: IFolderCollection = {
  default: {
    folder: { icon: 'folder', format: FileFormat.svg },
    root_folder: { icon: 'root_folder', format: FileFormat.svg },
  },
  supported: [
    { icon: 'aws', extensions: ['aws', '.aws'], format: FileFormat.svg },
  ],
};
