import { IExtensionCollection } from './extensionCollection';
import { IFolderDefault } from './folderDefault';
import { IFolderExtension } from './folderExtension';

export interface IFolderCollection extends IExtensionCollection<IFolderExtension> {
  default: IFolderDefault;
}
