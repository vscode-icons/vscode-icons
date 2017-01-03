import { IDefaultExtension } from './defaultExtension';

export interface IDefaultFileCollection {
  default: {
    file: IDefaultExtension;
    file_light?: IDefaultExtension;
  };
}
