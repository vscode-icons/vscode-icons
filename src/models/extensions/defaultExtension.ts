import { FileFormat } from './fileFormat';

export interface IDefaultExtension {
  icon: string; // name of the icon.
  format: FileFormat | string; // format of the icon
  _custom?: boolean; // user customization: flag for the icon generator.
  disabled?: boolean; // user customization: if false the extension won't be exported.
}
