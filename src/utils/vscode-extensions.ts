import * as vscode from 'vscode';
import { IExtendedWorkspaceConfiguration } from '../models';

export function getConfig() {
  return vscode.workspace.getConfiguration() as IExtendedWorkspaceConfiguration;
}
