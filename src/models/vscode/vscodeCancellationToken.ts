/* eslint-disable @typescript-eslint/no-explicit-any */
import type { IVSCodeEvent } from './vscodeWorkspace';

export interface IVSCodeCancellationToken {
  isCancellationRequested: boolean;
  onCancellationRequested: IVSCodeEvent<any>;
}
