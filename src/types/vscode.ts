import type * as vscode from 'vscode';

interface VSCodeCommandExtension {
  category?: string;
  callbackName?: string;
}

export type VSCode = Pick<
  typeof vscode,
  | 'commands'
  | 'env'
  | 'version'
  | 'window'
  | 'workspace'
  | 'Uri'
  | 'CancellationTokenSource'
>;

export type {
  ConfigurationTarget,
  CancellationToken as VSCodeCancellationToken,
  CancellationTokenSource as VSCodeCancellationTokenSource,
  ConfigurationChangeEvent as VSCodeConfigurationChangeEvent,
  Disposable as VSCodeDisposable,
  Event as VSCodeEvent,
  ExtensionContext as VSCodeExtensionContext,
  Memento as VSCodeMemento,
  RelativePattern as VSCodeRelativePattern,
  Uri as VSCodeUri,
  WorkspaceConfiguration as VSCodeWorkspaceConfiguration,
  WorkspaceFolder as VSCodeWorkspaceFolder,
} from 'vscode';

export type VSCodeCommand = vscode.Command & VSCodeCommandExtension;

export type VSCodeCommands = typeof vscode.commands;

export type VSCodeEnv = typeof vscode.env;

export type VSCodeWindow = typeof vscode.window;

export type VSCodeWorkspace = typeof vscode.workspace;

export type VSCodeUriStatic = typeof vscode.Uri;

export interface VSCodePreset<T> {
  key: string;
  defaultValue?: T;
  globalValue?: T;
  workspaceValue?: T;
  workspaceFolderValue?: T;
}
