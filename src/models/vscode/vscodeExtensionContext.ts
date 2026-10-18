import type { IVSCodeMemento } from './vscodeMemento';

export interface IVSCodeExtensionContext {
  extensionPath: string;
  globalState: IVSCodeMemento;
  storagePath: string | undefined;
  subscriptions: Array<{ dispose: unknown }>;
  workspaceState: IVSCodeMemento;
}
