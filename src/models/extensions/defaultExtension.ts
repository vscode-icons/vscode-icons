import { DefaultExtensionType } from './defaultExtensionType';
import { FileFormat } from './fileFormat';

export interface IDefaultExtension {
  icon: string; // name of the icon
  type: DefaultExtensionType | string; // type of the default extension
  format: FileFormat | string; // format of the icon
}
