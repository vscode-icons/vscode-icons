import type { IExtensionCollection } from './extensionCollection';
import type { IFileDefault } from './fileDefault';
import type { IFileExtension } from './fileExtension';

export interface IFileCollection extends IExtensionCollection<IFileExtension> {
  default: IFileDefault;
}
