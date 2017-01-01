import { IIconSchema } from './IIconSchema';
import { IExtensionCollection, IFolderExtension, IFileExtension } from './IExtension';

export interface IIconGenerator {
  buildFolders(
    folders: IExtensionCollection<IFolderExtension>,
    iconsFolderBasePath: string,
    hasDefaultLightFolder: boolean,
    suffix: string);

  buildFiles(
    files: IExtensionCollection<IFileExtension>,
    iconsFolderBasePath: string,
    hasDefaultLightFile: boolean,
    suffix: string);

  getDefaultSchema(iconsFolderBasePath?: string): IIconSchema;

  generateJson(
    files: IExtensionCollection<IFileExtension>,
    folders: IExtensionCollection<IFolderExtension>,
    outDir: string): IIconSchema;

  persist(
    iconsFilename: string,
    json: IIconSchema,
    outDir: string): void;
}
