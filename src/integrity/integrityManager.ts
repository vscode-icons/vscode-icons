import { Integrity, IntegrityOptions } from 'nsri';
import { ErrorHandler } from '../common';
import { ConfigManager } from '../configuration/configManager';
import { IIntegrityManager } from '../models/integrity/integrityManager';

export class IntegrityManager implements IIntegrityManager {
  public async check(): Promise<boolean> {
    try {
      const options: IntegrityOptions = {
        exclude: await Integrity.getExclusionsFromIgnoreFile(
          ConfigManager.rootDir,
        ),
      };
      const pass = await Integrity.check(
        ConfigManager.rootDir,
        ConfigManager.rootDir,
        options,
      );
      return pass;
    } catch (error: unknown) {
      ErrorHandler.logError(error, true);
      return true;
    }
  }
}
