import type { IVSCodeDisposable } from './vscodeDisposable';
import type { IVSCodeMemento } from './vscodeMemento';

export interface IVSCodeExtensionContext {
  extensionPath: string;
  globalState: IVSCodeMemento;
  storagePath: string | undefined;
  subscriptions: IVSCodeDisposable[];
  workspaceState: IVSCodeMemento;
}
