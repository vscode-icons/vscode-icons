/* eslint-disable @typescript-eslint/no-explicit-any */
import type { IVSCodeCancellationToken } from './vscodeCancellationToken';
import type { IVSCodeConfigurationChangeEvent } from './vscodeConfigurationChangeEvent';
import type { IVSCodeDisposable } from './vscodeDisposable';
import type { IVSCodeRelativePattern } from './vscodeRelativePattern';
import type { IVSCodeUri } from './vscodeUri';
import type { IVSCodeWorkspaceConfiguration } from './vscodeWorkspaceConfiguration';
import type { IVSCodeWorkspaceFolder } from './vscodeWorkspaceFolder';

type GlobPattern = string | IVSCodeRelativePattern;

export type IVSCodeEvent<T> = (
  listener: (e: T) => any,
  thisArgs?: any,
  disposables?: IVSCodeDisposable[],
) => IVSCodeDisposable;

export interface IVSCodeWorkspace {
  rootPath: string | undefined;
  workspaceFolders: readonly IVSCodeWorkspaceFolder[] | undefined;
  onDidChangeConfiguration: IVSCodeEvent<IVSCodeConfigurationChangeEvent>;
  getConfiguration(
    section?: string,
    resource?: IVSCodeUri,
  ): IVSCodeWorkspaceConfiguration;
  findFiles(
    include: GlobPattern,
    exclude?: GlobPattern,
    maxResults?: number,
    token?: IVSCodeCancellationToken,
  ): Thenable<IVSCodeUri[]>;
}
