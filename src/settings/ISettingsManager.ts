import { ISettings, IState } from '../models';
import { ExtensionStatus } from './ExtensionStatus';

export interface ISettingsManager {
  getSettings: () => ISettings;
  getState: () => IState;
  setState: (state: IState) => void;
  setStatus: (sts: ExtensionStatus) => void;
  deleteState: () => void;
}
