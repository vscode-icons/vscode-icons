import type { VSCodeExtensionContext } from '../../src/types';

export const context = {
  extensionPath: undefined,
  globalState: {},
  storagePath: undefined,
  subscriptions: [],
  workspaceState: {},
} as unknown as VSCodeExtensionContext;
