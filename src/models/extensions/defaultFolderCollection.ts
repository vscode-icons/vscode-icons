import { IDefaultExtension } from './defaultExtension';

export interface IDefaultFolderCollection {
  default: {
    folder: IDefaultExtension;
    folder_light?: IDefaultExtension;
  };
}
