import * as vscode from 'vscode';
import { IExtendedWorkspaceConfiguration } from '../models';

export function getConfig() {
  return vscode.workspace.getConfiguration() as IExtendedWorkspaceConfiguration;
}

export function findFiles(include: string, exclude: string, maxResults?: number, token?: vscode.CancellationToken) {
  return vscode.workspace.findFiles(include, exclude, maxResults, token);
}
