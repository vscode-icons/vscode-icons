import { SpecialExtensionType } from './SpecialExtensionType';
import { FileFormat } from './FileFormat';
export interface ISpecialExtension {
  icon: string; // name of the icon
  type: SpecialExtensionType | string; // type of the special extension
  format: FileFormat | string; // format of the icon
}
