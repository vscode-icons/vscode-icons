import type {
  IFileDefault,
  IFileExtension,
  IFolderDefault,
  IFolderExtension,
} from '../extensions';

export interface IAssociations {
  files: IFileExtension[];
  folders: IFolderExtension[];
  fileDefault: IFileDefault;
  folderDefault: IFolderDefault;
}
