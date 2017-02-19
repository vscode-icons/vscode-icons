import * as vscode from 'vscode';
import { IExtendedWorkspaceConfiguration, IVSCodeUri } from '../models';

export function getConfig(): IExtendedWorkspaceConfiguration {
  return vscode.workspace.getConfiguration() as IExtendedWorkspaceConfiguration;
}

export function findFiles(
  include: string,
  exclude: string,
  maxResults?: number,
  token?: vscode.CancellationToken): Thenable<vscode.Uri[]> {
  return vscode.workspace.findFiles(include, exclude, maxResults, token);
}

export function asRelativePath(
  pathOrUri: string | IVSCodeUri): string {
  return vscode.workspace.asRelativePath(pathOrUri);
}
