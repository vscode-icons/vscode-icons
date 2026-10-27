import type { IIconManifest } from '../types';

import { ErrorHandler } from '../common/errorHandler';
import { constants } from '../constants';
import { IconsGenerator } from '../iconsManifest/iconsGenerator';

async function build(argv: string[]): Promise<void> {
  try {
    constants.environment.production = argv.some((arg: string): boolean =>
      /release|production/.test(arg),
    );
    const iconsGenerator = new IconsGenerator();
    const iconsManifest: IIconManifest =
      await iconsGenerator.generateIconsManifest();
    await iconsGenerator.persist(
      iconsManifest,
      constants.environment.production,
    );
  } catch (error: unknown) {
    ErrorHandler.logError(error);
    process.exitCode = 1;
  }
}

void build(process.argv);
