/* eslint-disable @typescript-eslint/no-explicit-any */
import { IVSCodeMemento } from './vscodeMemento';

export interface IVSCodeExtensionContext {
  extensionPath: string;
  globalState: IVSCodeMemento;
  storagePath: string | undefined;
  subscriptions: Array<{ dispose: any }>;
  workspaceState: IVSCodeMemento;
}
