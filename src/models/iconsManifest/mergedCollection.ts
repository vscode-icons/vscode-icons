import { IFileCollection, IFolderCollection } from '../extensions';

export interface IMergedCollection {
  files: IFileCollection;
  folders: IFolderCollection;
}
