import * as vscode from 'vscode';
import { IExtendedWorkspaceConfiguration } from '../models/IExtendedWorkspaceConfiguration';

export function getConfig() {
  return vscode.workspace.getConfiguration() as IExtendedWorkspaceConfiguration;
}
