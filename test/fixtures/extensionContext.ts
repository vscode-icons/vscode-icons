import type { VSCodeExtensionContext, VSCodeMemento } from '../../src/types';

export const context: VSCodeExtensionContext = {
  extensionPath: undefined,
  globalState: {} as VSCodeMemento,
  storagePath: undefined,
  subscriptions: [],
  workspaceState: {} as VSCodeMemento,
};
