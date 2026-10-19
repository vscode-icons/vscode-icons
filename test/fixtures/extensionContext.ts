import type { IVSCodeExtensionContext, IVSCodeMemento } from '../../src/types';

export const context: IVSCodeExtensionContext = {
  extensionPath: undefined,
  globalState: {} as IVSCodeMemento,
  storagePath: undefined,
  subscriptions: [],
  workspaceState: {} as IVSCodeMemento,
};
