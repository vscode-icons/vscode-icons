import type { IIconsGenerator } from '../types';

import { ErrorHandler } from '../common/errorHandler';
import { constants } from '../constants';
import { IconsGenerator } from '../iconsManifest/iconsGenerator';

async function build(argv: string[]): Promise<void> {
  try {
    constants.environment.production = argv.some((arg: string): boolean =>
      /release|production/.test(arg),
    );
    const iconsGenerator: IIconsGenerator = new IconsGenerator();
    const iconsManifest = await iconsGenerator.generateIconsManifest();
    await iconsGenerator.persist(iconsManifest, /* updatePackageJson */ true);
  } catch (error: unknown) {
    ErrorHandler.logError(error);
  }
}

void build(process.argv);
