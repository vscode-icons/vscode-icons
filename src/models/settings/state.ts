import { ExtensionStatus } from './extensionStatus';

export interface IState {
  version: string;
  status: ExtensionStatus;
  welcomeShown: boolean;
}
