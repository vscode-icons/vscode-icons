import type {
  VSCode,
  VSCodeCommands,
  VSCodeEnv,
  VSCodeUriStatic,
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
  Uri: VSCodeUriStatic;
}

export type TestVSCode = Pick<VSCode, 'commands' | 'window'> &
  VSCodeMutableExtension;

export const vscode: TestVSCode = {
  env: {} as Mutable<VSCodeEnv>,
  commands: {} as VSCodeCommands,
  version: '1.0.0',
  window: {} as VSCodeWindow,
  workspace: {} as Mutable<VSCodeWorkspace>,
  Uri: {} as VSCodeUriStatic,
};
