import type {
  SettingsManagerContract,
  State,
  VSCodeManagerContract,
} from '../types';

import { lt } from 'semver';

import { ErrorHandler } from '../common/errorHandler';
import { constants } from '../constants';
import * as enums from '../types/enums';

export class SettingsManager implements SettingsManagerContract {
  public static defaultState: State = {
    version: '0.0.0',
    status: enums.ExtensionStatus.deactivated,
    welcomeShown: false,
  };

  constructor(private vscodeManager: VSCodeManagerContract) {
    if (!vscodeManager) {
      throw new ReferenceError(`'vscodeManager' not set to an instance`);
    }
  }

  public get isNewVersion(): boolean {
    return lt(this.getState().version, constants.extension.version);
  }

  public getState(): State {
    const state = this.vscodeManager.context.globalState.get<State>(
      constants.vsicons.name,
    );
    return state || SettingsManager.defaultState;
  }

  public async setState(state: State): Promise<void> {
    try {
      await this.vscodeManager.context.globalState.update(
        constants.vsicons.name,
        state,
      );
    } catch (error: unknown) {
      ErrorHandler.logError(error);
    }
  }

  public async updateStatus(status?: enums.ExtensionStatus): Promise<State> {
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
