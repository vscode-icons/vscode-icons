import { Bundler } from '../common/bundler';
import { ErrorHandler } from '../common/errorHandler';
import { constants } from '../constants';

const bundle = async (argv: string[]): Promise<void> => {
  try {
    constants.environment.production = argv.some((arg: string) =>
      /release|production/.test(arg),
    );
    await Bundler.bundleLangResources(
      './locale/lang',
      './lang.nls.bundle.json',
    );
    await Bundler.copyPackageResources('./locale/package', '.');
  } catch (error: unknown) {
    ErrorHandler.logError(error);
  }
};

void bundle(process.argv);
