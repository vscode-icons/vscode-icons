import { ISpecialExtension } from './specialExtension';

export interface ISpecialFolderCollection {
  special: {
    folder: ISpecialExtension;
    folder_light?: ISpecialExtension;
  };
}
