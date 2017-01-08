import { FileFormat } from './fileFormat';

export interface IDefaultExtension {
  icon: string; // name of the icon.
  format: FileFormat | string; // format of the icon
  disabled?: boolean; // user customization: if false the extension won't be exported.
}
