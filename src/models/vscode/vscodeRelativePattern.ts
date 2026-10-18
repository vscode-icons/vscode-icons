import type { IVSCodeUri } from './vscodeUri';
import type { IVSCodeWorkspaceFolder } from './vscodeWorkspaceFolder';

export interface IVSCodeRelativePattern {
  baseUri: IVSCodeUri;
  base: string;
  pattern: string;
  new (base: IVSCodeWorkspaceFolder | string, pattern: string);
}
