/* eslint-disable @typescript-eslint/no-explicit-any */
import { IVSCodeEvent } from './vscodeWorkspace';

export interface IVSCodeCancellationToken {
  isCancellationRequested: boolean;
  onCancellationRequested: IVSCodeEvent<any>;
}
