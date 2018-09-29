import { IVSCodeDisposable } from './vscodeDisposable';

export interface IVSCodeCommands {
  executeCommand<T>(command: string, ...rest: any[]): Thenable<T | undefined>;
  registerCommand(
    command: string,
    callback: (args: any[]) => any,
    thisArg?: any
  ): IVSCodeDisposable;
}
