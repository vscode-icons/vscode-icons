import { IExtensionCollection } from './extensionCollection';
import { IFileExtension } from './fileExtension';
import { IFileDefault } from './fileDefault';

export interface IFileCollection extends IExtensionCollection<IFileExtension> {
  default: IFileDefault;
}
