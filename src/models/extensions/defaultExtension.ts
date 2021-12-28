import { FileFormat } from './fileFormat';

export interface IDefaultExtension {
  /**
   * name of the icon.
   */
  icon: string;
  /**
   * format of the icon
   */
  format: FileFormat | string;
  /**
   * user customization: if false the extension won't be exported.
   */
  disabled?: boolean;
}
