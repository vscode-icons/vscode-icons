import { IExtension } from './extension';
import { ILanguage } from '../language';

export interface IFileExtension extends IExtension {
  filename?: boolean; // set to true if the extension represents the whole file name.
  languages?: ILanguage[]; // collection of languages associated to the icon.
}
