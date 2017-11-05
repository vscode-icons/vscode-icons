import { IExtension } from './extension';
import { ILanguage } from '../language';

export interface IFileExtension extends IExtension {
  filename?: boolean; // set to true if the extension represents the whole file name.
  languages?: ILanguage[]; // collection of languages associated to the icon.
  filenamesGlob?: string[]; // array of file names to generate with file extensions to associate to the icon.
  extensionsGlob?: string[]; // array of file extensions to generate with file names to associate to the icon.
}
