import { IDefaultExtension } from './defaultExtension';

export interface IExtension extends IDefaultExtension {
  extensions: string[]; // set of extensions associated to the icon.
  light?: boolean; // set it to true if the extension support light icons.
  overrides?: string; // user customization: disables the specified extension.
  extends?: string; // user customization: extends the specified extension.
}
