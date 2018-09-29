import { IVSCodeEnv } from './vscodeEnv';
import { IVSCodeWorkspace } from './vscodeWorkspace';
import { IVSCodeWindow } from './vscodeWindow';
import { IVSCodeCommands } from './vscodeCommands';

export interface IVSCode {
  env: IVSCodeEnv;
  commands: IVSCodeCommands;
  version: string;
  window: IVSCodeWindow;
  workspace: IVSCodeWorkspace;
}
