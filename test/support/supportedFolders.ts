import { IExtensionCollection, IFolderExtension, FileFormat } from '../../src/models';
/* tslint:disable max-line-length */
export const extensions: IExtensionCollection<IFolderExtension> = {
  supported: [
    { icon: 'aws', extensions: ['aws', '.aws'], format: FileFormat.svg },
  ],
};
