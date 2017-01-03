import { FileFormat } from './fileFormat';

export interface IExtension {
  icon: string; // name of the icon.
  extensions: string[]; // set of extensions associated to the icon.
  format: FileFormat | string; // format of the icon
  light?: boolean; // set it to true if the extension support light icons.
  disabled?: boolean; // user customization: if false the extension won't be exported.
  overrides?: string; // user customization: disables the specified extension.
  extends?: string; // user customization: extends the specified extension.
  _custom?: boolean; // user customization: flag for the icon generator.
}
