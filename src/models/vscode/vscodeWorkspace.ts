import { IVSCodeUri } from './vscodeUri';
import { IVSCodeDisposable } from './vscodeDisposable';
import { IVSCodeWorkspaceFolder } from './vscodeWorkspaceFolder';
import { IVSCodeCancellationToken } from './vscodeCancellationToken';
import { IVSCodeWorkspaceConfiguration } from './vscodeWorkspaceConfiguration';
import { IVSCodeConfigurationChangeEvent } from './vscodeConfigurationChangeEvent';

export interface IVSCodeWorkspace {
  rootPath: string | undefined;
  workspaceFolders: IVSCodeWorkspaceFolder[] | undefined;
  onDidChangeConfiguration: IVSCodeEvent<IVSCodeConfigurationChangeEvent>;
  getConfiguration(
    section?: string,
    resource?: IVSCodeUri
  ): IVSCodeWorkspaceConfiguration;
  findFiles(
    include: GlobPattern,
    exclude?: GlobPattern,
    maxResults?: number,
    token?: IVSCodeCancellationToken
  ): Thenable<IVSCodeUri[]>;
}

export type IVSCodeEvent<T> = (
  listener: (e: T) => any,
  thisArgs?: any,
  disposables?: IVSCodeDisposable[]
) => IVSCodeDisposable;

type GlobPattern = string | IVSCodeRelativePattern;

interface IVSCodeRelativePattern {
  base: string;
  pattern: string;
  new (base: IVSCodeWorkspaceFolder | string, pattern: string);
}
