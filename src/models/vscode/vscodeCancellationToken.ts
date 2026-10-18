import type { IVSCodeEvent } from './vscodeWorkspace';

export interface IVSCodeCancellationToken {
  isCancellationRequested: boolean;
  onCancellationRequested: IVSCodeEvent<unknown>;
}
