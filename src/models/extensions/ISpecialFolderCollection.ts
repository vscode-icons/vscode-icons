import { ISpecialExtension } from './ISpecialExtension';

export interface ISpecialFolderCollection {
  special: {
    folder: ISpecialExtension;
    folder_light?: ISpecialExtension;
  };
}
