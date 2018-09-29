import { existsSync, readFileSync, unlinkSync } from 'fs';
import { eq, lt } from 'semver';
import {
  IState,
  ISettingsManager,
  ExtensionStatus,
  IVSCodeManager,
} from '../models';
import { Utils } from '../utils';
import { ErrorHandler } from '../errorHandler';
import { constants } from '../constants';

export class SettingsManager implements ISettingsManager {
  private defaultState: IState = {
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
      constants.vsicons.name
    );
    return state || this.defaultState;
  }

  public setState(state: IState): Thenable<void> {
    return this.vscodeManager.context.globalState
      .update(constants.vsicons.name, state)
      .then(
        () => {
          return void 0;
        },
        reason => {
          return ErrorHandler.logError(reason);
        }
      );
  }

  public updateStatus(status?: ExtensionStatus): IState {
    const state = this.getState();
    state.version = constants.extension.version;
    state.status = status == null ? state.status : status;
    state.welcomeShown = true;
    this.setState(state);
    return state;
  }

  public deleteState(): Thenable<void> {
    return this.vscodeManager.context.globalState
      .update(constants.vsicons.name, undefined)
      .then(void 0, reason => ErrorHandler.logError(reason));
  }

  public moveStateFromLegacyPlace(): Thenable<void> {
    // read state from legacy place
    const state: IState = this.getStateLegacy();
    // state not found in legacy place
    if (eq(state.version, this.defaultState.version)) {
      return Promise.resolve();
    }
    // store in new place: 'globalState'
    return this.setState(state).then(() =>
      // delete state from legacy place
      this.deleteStateLegacy()
    );
  }

  /** Obsolete */
  private getStateLegacy(): IState {
    const extensionSettingsLegacyFilePath = Utils.pathUnixJoin(
      this.vscodeManager.getAppUserDirPath(),
      constants.extension.settingsFilename
    );

    if (!existsSync(extensionSettingsLegacyFilePath)) {
      return this.defaultState;
    }
    try {
      const state = readFileSync(extensionSettingsLegacyFilePath, 'utf8');
      return (Utils.parseJSON(state) as IState) || this.defaultState;
    } catch (error) {
      ErrorHandler.logError(error, true);
      return this.defaultState;
    }
  }

  /** Obsolete */
  private deleteStateLegacy(): void {
    const extensionSettingsLegacyFilePath = Utils.pathUnixJoin(
      this.vscodeManager.getAppUserDirPath(),
      constants.extension.settingsFilename
    );
    try {
      unlinkSync(extensionSettingsLegacyFilePath);
    } catch (error) {
      ErrorHandler.logError(error);
    }
  }
}
