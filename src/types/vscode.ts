import type { ConfigurationTarget } from './enums';

export interface IVSCode {
  env: IVSCodeEnv;
  commands: IVSCodeCommands;
  version: string;
  window: IVSCodeWindow;
  workspace: IVSCodeWorkspace;
}

export interface IVSCodeCancellationToken {
  isCancellationRequested: boolean;
  onCancellationRequested: IVSCodeEvent<unknown>;
}

export interface IVSCodeCommand {
  title: string;
  command: string;
  tooltip?: string;
  arguments?: unknown[];

  // custom types
  category?: string;
  callbackName?: string;
}

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

export interface IVSCodeConfigurationChangeEvent {
  affectsConfiguration(section: string, resource?: IVSCodeUri): boolean;
}

export interface IVSCodeDisposable {
  dispose(): unknown;
}

export interface IVSCodeEnv {
  appName: string;
  language: string;
}

export interface IVSCodeExtensionContext {
  extensionPath: string;
  globalState: IVSCodeMemento;
  storagePath: string | undefined;
  subscriptions: IVSCodeDisposable[];
  workspaceState: IVSCodeMemento;
}

export interface IVSCodeManager {
  context: IVSCodeExtensionContext;
  env: IVSCodeEnv;
  commands: IVSCodeCommands;
  version: string;
  window: IVSCodeWindow;
  workspace: IVSCodeWorkspace;
  supportsThemesReload: boolean;
  isSupportedVersion: boolean;
  getWorkspacePaths(): string[];
  getAppUserDirPath(): string;
}

export interface IVSCodeMemento {
  get<T>(key: string): T | undefined;
  get<T>(key: string, defaultValue: T): T;
  update(key: string, value: unknown): Thenable<void>;
  setKeysForSync(keys: readonly string[]): void;
}

export interface IVSCodeUri {
  readonly scheme: string;
  readonly authority: string;
  readonly path: string;
  readonly query: string;
  readonly fragment: string;
  readonly fsPath: string;
  with(change: {
    scheme?: string;
    authority?: string;
    path?: string;
    query?: string;
    fragment?: string;
  }): IVSCodeUri;
  toString(skipEncoding?: boolean): string;
  toJSON(): unknown;
}

export interface IVSCodeWindow {
  showInformationMessage(
    message: string,
    ...items: string[]
  ): Thenable<string | undefined>;

  showWarningMessage(
    message: string,
    ...items: string[]
  ): Thenable<string | undefined>;

  showErrorMessage(
    message: string,
    ...items: string[]
  ): Thenable<string | undefined>;
}

type GlobPattern = string | IVSCodeRelativePattern;

export type IVSCodeEvent<T> = (
  listener: (e: T) => unknown,
  thisArgs?: unknown,
  disposables?: IVSCodeDisposable[],
) => IVSCodeDisposable;

export interface IVSCodeFileSystem {
  readFile(uri: IVSCodeUri): Thenable<Uint8Array>;
}

export interface IVSCodeWorkspace {
  fs: IVSCodeFileSystem;
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

export interface IVSCodeRelativePattern {
  baseUri: IVSCodeUri;
  base: string;
  pattern: string;
  new (base: IVSCodeWorkspaceFolder | string, pattern: string);
}

export interface IVSCodePreset<T> {
  key: string;
  defaultValue?: T;
  globalValue?: T;
  workspaceValue?: T;
  workspaceFolderValue?: T;
}

export interface IVSCodeWorkspaceConfiguration {
  readonly [key: string]: unknown;
  get<T>(section: string): T | undefined;
  get<T>(section: string, defaultValue: T): T;
  has(section: string): boolean;
  inspect<T>(section: string): IVSCodePreset<T> | undefined;
  update(
    section: string,
    value: unknown,
    configurationTarget?: ConfigurationTarget | boolean,
  ): Thenable<void>;
}

export interface IVSCodeWorkspaceFolder {
  readonly uri: IVSCodeUri;
  readonly name: string;
  readonly index: number;
}
