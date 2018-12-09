import { IState } from './state';
import { ExtensionStatus } from './extensionStatus';

export interface ISettingsManager {
  isNewVersion: boolean;
  moveStateFromLegacyPlace: () => Thenable<void>;
  getState: () => IState;
  setState: (state: IState) => Thenable<void>;
  updateStatus: (status?: ExtensionStatus) => IState;
  deleteState: () => Thenable<void>;
}
