import {
  IVSCode,
  IVSCodeEnv,
  IVSCodeCommands,
  IVSCodeWindow,
  IVSCodeWorkspace,
} from '../../src/models';

const env: IVSCodeEnv = {} as IVSCodeEnv;
const commands: IVSCodeCommands = {} as IVSCodeCommands;
const window: IVSCodeWindow = {} as IVSCodeWindow;
const workspace: IVSCodeWorkspace = {} as IVSCodeWorkspace;

export const vscode: IVSCode = {
  env,
  commands,
  version: '1.0.0',
  window,
  workspace,
};
