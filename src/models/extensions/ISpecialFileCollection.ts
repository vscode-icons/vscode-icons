import { ISpecialExtension } from './ISpecialExtension';

export interface ISpecialFileCollection {
  special: {
    file: ISpecialExtension;
    file_light?: ISpecialExtension;
  };
}
