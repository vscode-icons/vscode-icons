import { IVSCodeEnv } from './vscodeEnv';
import { IVSCodeWorkspace } from './vscodeWorkspace';

export interface IVSCode {
  env: IVSCodeEnv;
  version: string;
  workspace: IVSCodeWorkspace;
}
