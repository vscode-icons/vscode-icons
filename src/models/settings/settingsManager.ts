import { ISettings } from './settings';
import { IState } from './state';
import { ExtensionStatus } from './extensionStatus';

export interface ISettingsManager {
  getSettings: () => ISettings;
  getState: () => IState;
  setState: (state: IState) => void;
  updateStatus: (sts: ExtensionStatus) => void;
  deleteState: () => void;
  isNewVersion: () => boolean;
}
