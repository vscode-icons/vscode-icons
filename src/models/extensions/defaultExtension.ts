import { FileFormat } from './fileFormat';

export interface IDefaultExtension {
  icon: string; // name of the icon
  format: FileFormat | string; // format of the icon
}
