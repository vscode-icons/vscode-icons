import { IExtensionCollection } from './extensionCollection';
import { IFileDefault } from './fileDefault';
import { IFileExtension } from './fileExtension';

export interface IFileCollection extends IExtensionCollection<IFileExtension> {
  default: IFileDefault;
}
