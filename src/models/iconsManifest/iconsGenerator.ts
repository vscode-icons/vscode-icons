import type { IFileCollection, IFolderCollection } from '../extensions';
import type { IIconSchema, IZedIconSchema } from '../iconSchema';
import type { IProjectDetectionResult } from '../projectDetector';
import type { IIconManifest } from './iconManifest';

export interface IIconsGenerator {
  generateIconsManifest(
    files?: IFileCollection,
    folders?: IFolderCollection,
    projectDetectionResults?: IProjectDetectionResult[],
  ): Promise<{ vscode: IIconSchema; zed: IZedIconSchema }>;
  persist(
    iconsManifest: IIconManifest,
    updatePackageJson?: boolean,
  ): Promise<void>;
}
