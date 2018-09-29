import { IVSCodeUri } from './vscodeUri';

export interface IVSCodeWorkspaceFolder {
  readonly uri: IVSCodeUri;
  readonly name: string;
  readonly index: number;
}
