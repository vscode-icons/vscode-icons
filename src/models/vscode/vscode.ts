import type { IVSCodeCommands } from './vscodeCommands';
import type { IVSCodeEnv } from './vscodeEnv';
import type { IVSCodeWindow } from './vscodeWindow';
import type { IVSCodeWorkspace } from './vscodeWorkspace';

export interface IVSCode {
  env: IVSCodeEnv;
  commands: IVSCodeCommands;
  version: string;
  window: IVSCodeWindow;
  workspace: IVSCodeWorkspace;
}
