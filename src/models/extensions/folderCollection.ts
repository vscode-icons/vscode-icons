import type { IExtensionCollection } from './extensionCollection';
import type { IFolderDefault } from './folderDefault';
import type { IFolderExtension } from './folderExtension';

export interface IFolderCollection extends IExtensionCollection<IFolderExtension> {
  default: IFolderDefault;
}
