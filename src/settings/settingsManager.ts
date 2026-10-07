import type { ISettingsManager, IState, IVSCodeManager } from '../models';

import { lt } from 'semver';

import { ErrorHandler } from '../common/errorHandler';
import { constants } from '../constants';
import { ExtensionStatus } from '../models';

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
}
