import { IIconSchema } from '../iconSchema';
import {
  IExtensionCollection,
  IFileExtension,
  IFolderExtension,
  IFileCollection,
  IFolderCollection,
} from '../extensions';

export interface IIconGenerator {
  generateJson(
    files: IFileCollection,
    folders: IFolderCollection): IIconSchema;
  persist(
    iconsFilename: string,
    json: IIconSchema,
    updatePackageJson?: boolean): void;
}
