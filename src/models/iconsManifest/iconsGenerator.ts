import { IIconSchema } from '../iconSchema';
import { IFileCollection, IFolderCollection } from '../extensions';
import { IProjectDetectionResult } from '../projectDetector';

export interface IIconsGenerator {
  generateIconsManifest(
    files?: IFileCollection,
    folders?: IFolderCollection,
    projectDetectionResult?: IProjectDetectionResult
  ): IIconSchema;
  persist(
    iconsManifest: IIconSchema,
    updatePackageJson?: boolean
  ): Thenable<void>;
}
