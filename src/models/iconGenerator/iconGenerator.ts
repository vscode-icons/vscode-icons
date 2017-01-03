import { IIconSchema } from '../iconSchema';
import { IExtensionCollection, IFileExtension, IFolderExtension } from '../extensions';

export interface IIconGenerator {
  getDefaultSchema(iconsFolderBasePath?: string): IIconSchema;
  generateJson(
    files: IExtensionCollection<IFileExtension>,
    folders: IExtensionCollection<IFolderExtension>,
    defaultSchema?: IIconSchema,
    outDir?: string): IIconSchema;
  persist(
    iconsFilename: string,
    json: IIconSchema,
    outDir?: string): void;
}
