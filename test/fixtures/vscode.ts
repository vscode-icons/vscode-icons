import { IVSCode } from '../../src/models';

const env: any = {};
const commands: any = {};
const window: any = {};
const workspace: any = {};

export const vscode: IVSCode = {
  env,
  commands,
  version: '1.0.0',
  window,
  workspace,
};
