import type {
  VSCode,
  VSCodeCommands,
  VSCodeEnv,
  VSCodeWindow,
  VSCodeWorkspace,
} from '../../src/types';

const env: VSCodeEnv = {} as VSCodeEnv;
const commands: VSCodeCommands = {} as VSCodeCommands;
const window: VSCodeWindow = {} as VSCodeWindow;
const workspace: VSCodeWorkspace = {} as VSCodeWorkspace;

export const vscode: VSCode = {
  env,
  commands,
  version: '1.0.0',
  window,
  workspace,
};
