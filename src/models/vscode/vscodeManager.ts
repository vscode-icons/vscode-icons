import type { IVSCodeCommands } from './vscodeCommands';
import type { IVSCodeEnv } from './vscodeEnv';
import type { IVSCodeExtensionContext } from './vscodeExtensionContext';
import type { IVSCodeWindow } from './vscodeWindow';
import type { IVSCodeWorkspace } from './vscodeWorkspace';

export interface IVSCodeManager {
  context: IVSCodeExtensionContext;
  env: IVSCodeEnv;
  commands: IVSCodeCommands;
  version: string;
  window: IVSCodeWindow;
  workspace: IVSCodeWorkspace;
  supportsThemesReload: boolean;
  isSupportedVersion: boolean;
  getWorkspacePaths(): string[];
  getAppUserDirPath(): string;
}
