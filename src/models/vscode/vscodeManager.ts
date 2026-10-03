import { IVSCodeCommands } from './vscodeCommands';
import { IVSCodeEnv } from './vscodeEnv';
import { IVSCodeExtensionContext } from './vscodeExtensionContext';
import { IVSCodeWindow } from './vscodeWindow';
import { IVSCodeWorkspace } from './vscodeWorkspace';

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
