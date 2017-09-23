import { ISettings } from './settings';
import { IState } from './state';
import { ExtensionStatus } from './extensionStatus';

export interface ISettingsManager {
  getSettings: () => ISettings;
  getState: () => IState;
  setState: (state: IState) => void;
  updateStatus: (sts: ExtensionStatus) => IState;
  deleteState: () => void;
  isNewVersion: () => boolean;
  setWelcomeShownToTrue: () => void;
}
