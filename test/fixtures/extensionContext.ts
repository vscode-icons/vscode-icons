import { IVSCodeExtensionContext, IVSCodeMemento } from '../../src/models';

export const context: IVSCodeExtensionContext = {
  extensionPath: undefined,
  globalState: {} as IVSCodeMemento,
  storagePath: undefined,
  subscriptions: [],
  workspaceState: {} as IVSCodeMemento,
};
