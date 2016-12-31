import { ILanguage } from './ILanguage';

interface IExtension {
  icon: string;
  extensions: string[];
  format: FileFormat;
  alternate?: boolean;
  light?: boolean;
}

export interface IExtensionCollection<T> {
  supported: T[];
}

export interface IFileExtension extends IExtension {
  filename?: boolean;
  languages?: ILanguage[];
}

export interface IFolderExtension extends IExtension {
  dot?: boolean;
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
