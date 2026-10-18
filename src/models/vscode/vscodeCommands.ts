import type { IVSCodeDisposable } from './vscodeDisposable';

export interface IVSCodeCommands {
  executeCommand<T>(
    command: string,
    ...rest: unknown[]
  ): Thenable<T | undefined>;
  registerCommand(
    command: string,
    callback: CallableFunction,
    thisArg?: unknown,
  ): IVSCodeDisposable;
}
