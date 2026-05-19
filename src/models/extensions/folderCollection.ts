import { IExtensionCollection } from './extensionCollection';
import { IFolderExtension } from './folderExtension';
import { IFolderDefault } from './folderDefault';

export interface IFolderCollection extends IExtensionCollection<IFolderExtension> {
  default: IFolderDefault;
}
