import { ILanguage } from './ILanguage';

export interface IExtension {
  icon: string; // name of the icon.
  extensions: string[]; // set of extensions associated to the icon.
  format: FileFormat | string; // format of the icon
  svg?: boolean; // set it to true if the icon format is svg
  light?: boolean; // set it to true if the extension support light icons.
  disabled?: boolean; // user customization: if false the extension won't be exported.
  overrides?: string; // user customization: disables the specified extension.
  extends?: string; // user customization: extends the specified extension.
  _custom?: boolean; // user customization: flag for the icon generator.
}

export interface IExtensionCollection<T> {
  supported: T[];
}

export interface IFileExtension extends IExtension {
  filename?: boolean; // set to true if the extension represents the whole file name.
  languages?: ILanguage[]; // collection of languages associated to the icon.
}

export interface IFolderExtension extends IExtension {
  dot?: boolean; // does the folder begin with a dot?
}

export enum FileFormat {
  svg,
  png,
  jpg,
  gif,
  bmp,
  tiff,
  ico,
}
