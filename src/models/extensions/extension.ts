import { IDefaultExtension } from './defaultExtension';

export interface IExtension extends IDefaultExtension {
  /**
   * set of extensions associated to the icon.
   */
  extensions?: string[];
  /**
   * set it to true if the extension support light icons.
   */
  light?: boolean;
  /**
   * user customization: disables the specified extension.
   */
  overrides?: string;
  /**
   * user customization: extends the specified extension.
   */
  extends?: string;
}
