import {
  IFileExtension,
  IFolderExtension,
  IFileDefault,
  IFolderDefault,
} from '../extensions';

export interface IAssociations {
  files: IFileExtension[];
  folders: IFolderExtension[];
  fileDefault: IFileDefault;
  folderDefault: IFolderDefault;
}
