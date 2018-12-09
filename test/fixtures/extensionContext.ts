import { IVSCodeExtensionContext } from '../../src/models';

const memento: any = {};

export const context: IVSCodeExtensionContext = {
  extensionPath: undefined,
  globalState: memento,
  storagePath: undefined,
  subscriptions: [],
  workspaceState: memento,
};
