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
  /**
   * set this to true if you want to use a bundle icon.
   * This will override the `default` prefix with the one for files or folders.
   */
  useBundledIcon?: boolean;
}
