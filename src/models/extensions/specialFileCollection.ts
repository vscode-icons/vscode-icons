import { ISpecialExtension } from './specialExtension';

export interface ISpecialFileCollection {
  special: {
    file: ISpecialExtension;
    file_light?: ISpecialExtension;
  };
}
