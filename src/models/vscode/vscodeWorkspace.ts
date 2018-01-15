import * as vscode from 'vscode';

export interface IVSCodeWorkspace {
  rootPath?: string;
  workspaceFolders?: vscode.WorkspaceFolder[] | undefined;
}
