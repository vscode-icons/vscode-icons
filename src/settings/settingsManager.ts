import { eq, lt } from 'semver';
import { ErrorHandler } from '../common/errorHandler';
import { existsAsync, readFileAsync, unlinkAsync } from '../common/fsAsync';
import { constants } from '../constants';
import {
  ExtensionStatus,
  ISettingsManager,
  IState,
  IVSCodeManager,
} from '../models';
import { Utils } from '../utils';

export class SettingsManager implements ISettingsManager {
  public static defaultState: IState = {
    version: '0.0.0',
    status: ExtensionStatus.deactivated,
    welcomeShown: false,
  };

  constructor(private vscodeManager: IVSCodeManager) {
    if (!vscodeManager) {
      throw new ReferenceError(`'vscodeManager' not set to an instance`);
    }
  }

  public get isNewVersion(): boolean {
    return lt(this.getState().version, constants.extension.version);
  }

  public getState(): IState {
    const state = this.vscodeManager.context.globalState.get<IState>(
      constants.vsicons.name,
    );
    return state || SettingsManager.defaultState;
  }

  public async setState(state: IState): Promise<void> {
    try {
      await this.vscodeManager.context.globalState.update(
        constants.vsicons.name,
        state,
      );
    } catch (error: unknown) {
      ErrorHandler.logError(error);
    }
  }

  public async updateStatus(status?: ExtensionStatus): Promise<IState> {
    const state = this.getState();
    state.version = constants.extension.version;
    state.status = status == null ? state.status : status;
    state.welcomeShown = true;
    await this.setState(state);
    return state;
  }

  public async deleteState(): Promise<void> {
    try {
      await this.vscodeManager.context.globalState.update(
        constants.vsicons.name,
        undefined,
      );
    } catch (error: unknown) {
      ErrorHandler.logError(error);
    }
  }

  public async moveStateFromLegacyPlace(): Promise<void> {
    // read state from legacy place
    const state: IState = await this.getStateLegacy();
    // state not found in legacy place
    if (eq(state.version, SettingsManager.defaultState.version)) {
      return;
    }
    // store in new place: 'globalState'
    await this.setState(state);
    // delete state from legacy place
    return this.deleteStateLegacy();
  }

  /** Obsolete */
  private async getStateLegacy(): Promise<IState> {
    const extensionSettingsLegacyFilePath = Utils.pathUnixJoin(
      this.vscodeManager.getAppUserDirPath(),
      constants.extension.settingsFilename,
    );

    const pathExists = await existsAsync(extensionSettingsLegacyFilePath);
    if (!pathExists) {
      return SettingsManager.defaultState;
    }
    try {
      const state = await readFileAsync(
        extensionSettingsLegacyFilePath,
        'utf8',
      );
      return Utils.parseJSONSafe<IState>(state) || SettingsManager.defaultState;
    } catch (error: unknown) {
      ErrorHandler.logError(error, true);
      return SettingsManager.defaultState;
    }
  }

  /** Obsolete */
  private async deleteStateLegacy(): Promise<void> {
    const extensionSettingsLegacyFilePath = Utils.pathUnixJoin(
      this.vscodeManager.getAppUserDirPath(),
      constants.extension.settingsFilename,
    );
    try {
      await unlinkAsync(extensionSettingsLegacyFilePath);
    } catch (error: unknown) {
      ErrorHandler.logError(error);
    }
  }
}
