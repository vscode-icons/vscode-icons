import { IState } from './state';
import { ExtensionStatus } from './extensionStatus';

export interface ISettingsManager {
  isNewVersion: boolean;
  moveStateFromLegacyPlace: () => Promise<void>;
  getState: () => IState;
  setState: (state: IState) => Promise<void>;
  updateStatus: (status?: ExtensionStatus) => Promise<IState>;
  deleteState: () => Promise<void>;
}
