import { ExtensionStatus } from '../../settings/';

export interface IState {
  version: string;
  status: ExtensionStatus;
  welcomeShown: boolean;
}
