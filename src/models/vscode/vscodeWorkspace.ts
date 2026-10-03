/* eslint-disable @typescript-eslint/no-explicit-any */
import { IVSCodeCancellationToken } from './vscodeCancellationToken';
import { IVSCodeConfigurationChangeEvent } from './vscodeConfigurationChangeEvent';
import { IVSCodeDisposable } from './vscodeDisposable';
import { IVSCodeUri } from './vscodeUri';
import { IVSCodeWorkspaceConfiguration } from './vscodeWorkspaceConfiguration';
import { IVSCodeWorkspaceFolder } from './vscodeWorkspaceFolder';

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

export type IVSCodeEvent<T> = (
  listener: (e: T) => any,
  thisArgs?: any,
  disposables?: IVSCodeDisposable[],
) => IVSCodeDisposable;

type GlobPattern = string | IVSCodeRelativePattern;

export interface IVSCodeRelativePattern {
  baseUri: IVSCodeUri;
  base: string;
  pattern: string;
  new (base: IVSCodeWorkspaceFolder | string, pattern: string);
}
