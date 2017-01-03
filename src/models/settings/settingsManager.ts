import { ISettings } from './settings';
import { IState } from './state';
import { ExtensionStatus } from './extensionStatus';

export interface ISettingsManager {
  getSettings: () => ISettings;
  getState: () => IState;
  setState: (state: IState) => void;
  setStatus: (sts: ExtensionStatus) => void;
  deleteState: () => void;
}
