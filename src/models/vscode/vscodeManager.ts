import { IVSCodeWorkspace } from './vscodeWorkspace';
import { IVSCodeEnv } from './vscodeEnv';
import { IVSCodeCommands } from './vscodeCommands';
import { IVSCodeWindow } from './vscodeWindow';
import { IVSCodeExtensionContext } from './vscodeExtensionContext';

export interface IVSCodeManager {
  context: IVSCodeExtensionContext;
  env: IVSCodeEnv;
  commands: IVSCodeCommands;
  version: string;
  window: IVSCodeWindow;
  workspace: IVSCodeWorkspace;
  getWorkspacePaths(): string[];
  getAppUserDirPath(): string;
}
