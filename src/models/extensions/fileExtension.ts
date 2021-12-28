import { IExtension } from './extension';
import { ILanguage } from '../language';

export interface IFileExtension extends IExtension {
  /** @interal */
  checked?: boolean;
  /**
   * set to true if the extension represents the whole file name.
   */
  filename?: boolean;
  /**
   * collection of languages associated to the icon.
   */
  languages?: ILanguage[];
  /**
   * array of file names to generate with file extensions to associate to the icon.
   */
  filenamesGlob?: string[];
  /**
   * array of file extensions to generate with file names to associate to the icon.
   */
  extensionsGlob?: string[];
}
