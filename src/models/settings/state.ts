import { ExtensionStatus } from './extensionStatus';

export interface IState extends Record<string, unknown> {
  version: string;
  status: ExtensionStatus;
  welcomeShown: boolean;
}
