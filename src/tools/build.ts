import { ErrorHandler } from '../common/errorHandler';
import { constants } from '../constants';
import { IconsGenerator } from '../iconsManifest/iconsGenerator';
import { IIconsGenerator } from '../models';

const build = async (argv: any[]): Promise<void> => {
  try {
    constants.environment.production = argv.some(arg =>
      /release|production/.test(arg),
    );
    const iconsGenerator: IIconsGenerator = new IconsGenerator();
    const iconsManifest = await iconsGenerator.generateIconsManifest();
    await iconsGenerator.persist(iconsManifest, /*updatePackageJson*/ true);
  } catch (error) {
    ErrorHandler.logError(error);
  }
};

build(process.argv);
