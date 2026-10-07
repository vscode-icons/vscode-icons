import type { ExtensionStatus } from './extensionStatus';
import type { IState } from './state';

export interface ISettingsManager {
  isNewVersion: boolean;
  getState: () => IState;
  setState: (state: IState) => Promise<void>;
  updateStatus: (status?: ExtensionStatus) => Promise<IState>;
  deleteState: () => Promise<void>;
}
