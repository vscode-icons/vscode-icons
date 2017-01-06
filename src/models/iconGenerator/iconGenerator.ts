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
    folders: IFolderCollection,
    outDir?: string): IIconSchema;
  persist(
    iconsFilename: string,
    json: IIconSchema,
    outDir?: string,
    updatePackageJson?: boolean): void;
}
