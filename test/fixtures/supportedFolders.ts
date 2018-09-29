/* tslint:disable max-line-length */
import { FileFormat, IFolderCollection } from '../../src/models';

export const extensions: IFolderCollection = {
  default: {
    folder: { icon: 'folder', format: FileFormat.svg },
    root_folder: { icon: 'root_folder', format: FileFormat.svg },
  },
  supported: [
    { icon: 'api', extensions: ['api', '.api'], format: FileFormat.svg },
    { icon: 'aws', extensions: ['aws', '.aws'], format: FileFormat.svg },
    {
      icon: 'aws2',
      extensions: ['aws', '.aws'],
      format: FileFormat.svg,
      disabled: true,
    },
    {
      icon: 'fonts',
      extensions: ['fonts', 'font', 'fnt'],
      light: true,
      format: FileFormat.svg,
    },
  ],
};
