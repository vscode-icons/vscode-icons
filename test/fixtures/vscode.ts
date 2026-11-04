import type {
  VSCode,
  VSCodeCommands,
  VSCodeEnv,
  VSCodeWindow,
  VSCodeWorkspace,
} from '../../src/types';

type Mutable<T> = {
  -readonly [Key in keyof T]: T[Key];
};

interface VSCodeMutableExtension {
  env: Mutable<VSCodeEnv>;
  version: string;
  workspace: Mutable<VSCodeWorkspace>;
}

export type TestVSCode = Omit<VSCode, 'env' | 'version' | 'workspace'> &
  VSCodeMutableExtension;

export const vscode: TestVSCode = {
  env: {} as Mutable<VSCodeEnv>,
  commands: {} as VSCodeCommands,
  version: '1.0.0',
  window: {} as VSCodeWindow,
  workspace: {} as Mutable<VSCodeWorkspace>,
};
