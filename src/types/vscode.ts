import type { ConfigurationTarget } from './enums';

export interface VSCode {
  env: VSCodeEnv;
  commands: VSCodeCommands;
  version: string;
  window: VSCodeWindow;
  workspace: VSCodeWorkspace;
}

export interface VSCodeCancellationToken {
  isCancellationRequested: boolean;
  onCancellationRequested: VSCodeEvent<unknown>;
}

export interface VSCodeCommand {
  title: string;
  command: string;
  tooltip?: string;
  arguments?: unknown[];

  // custom types
  category?: string;
  callbackName?: string;
}

export interface VSCodeCommands {
  executeCommand<T>(
    command: string,
    ...rest: unknown[]
  ): Thenable<T | undefined>;
  registerCommand(
    command: string,
    callback: CallableFunction,
    thisArg?: unknown,
  ): VSCodeDisposable;
}

export interface VSCodeConfigurationChangeEvent {
  affectsConfiguration(section: string, resource?: VSCodeUri): boolean;
}

export interface VSCodeDisposable {
  dispose(): unknown;
}

export interface VSCodeEnv {
  appName: string;
  language: string;
}

export interface VSCodeExtensionContext {
  extensionPath: string;
  globalState: VSCodeMemento;
  storagePath: string | undefined;
  subscriptions: VSCodeDisposable[];
  workspaceState: VSCodeMemento;
}

export interface VSCodeManagerContract {
  context: VSCodeExtensionContext;
  env: VSCodeEnv;
  commands: VSCodeCommands;
  version: string;
  window: VSCodeWindow;
  workspace: VSCodeWorkspace;
  supportsThemesReload: boolean;
  isSupportedVersion: boolean;
  getWorkspacePaths(): string[];
  getAppUserDirPath(): string;
}

export interface VSCodeMemento {
  get<T>(key: string): T | undefined;
  get<T>(key: string, defaultValue: T): T;
  update(key: string, value: unknown): Thenable<void>;
  setKeysForSync(keys: readonly string[]): void;
}

export interface VSCodeUri {
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
  }): VSCodeUri;
  toString(skipEncoding?: boolean): string;
  toJSON(): unknown;
}

export interface VSCodeWindow {
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

type GlobPattern = string | VSCodeRelativePattern;

export type VSCodeEvent<T> = (
  listener: (e: T) => unknown,
  thisArgs?: unknown,
  disposables?: VSCodeDisposable[],
) => VSCodeDisposable;

export interface VSCodeWorkspace {
  rootPath: string | undefined;
  workspaceFolders: readonly VSCodeWorkspaceFolder[] | undefined;
  onDidChangeConfiguration: VSCodeEvent<VSCodeConfigurationChangeEvent>;
  getConfiguration(
    section?: string,
    resource?: VSCodeUri,
  ): VSCodeWorkspaceConfiguration;
  findFiles(
    include: GlobPattern,
    exclude?: GlobPattern,
    maxResults?: number,
    token?: VSCodeCancellationToken,
  ): Thenable<VSCodeUri[]>;
}

export interface VSCodeRelativePattern {
  baseUri: VSCodeUri;
  base: string;
  pattern: string;
  new (base: VSCodeWorkspaceFolder | string, pattern: string);
}

export interface VSCodePreset<T> {
  key: string;
  defaultValue?: T;
  globalValue?: T;
  workspaceValue?: T;
  workspaceFolderValue?: T;
}

export interface VSCodeWorkspaceConfiguration {
  readonly [key: string]: unknown;
  get<T>(section: string): T | undefined;
  get<T>(section: string, defaultValue: T): T;
  has(section: string): boolean;
  inspect<T>(section: string): VSCodePreset<T> | undefined;
  update(
    section: string,
    value: unknown,
    configurationTarget?: ConfigurationTarget | boolean,
  ): Thenable<void>;
}

export interface VSCodeWorkspaceFolder {
  readonly uri: VSCodeUri;
  readonly name: string;
  readonly index: number;
}
