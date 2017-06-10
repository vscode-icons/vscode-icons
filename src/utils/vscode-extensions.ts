import * as _ from 'lodash';
import * as vscode from 'vscode';
import {  IVSCodeUri, IVSIcons, IFileExtension } from '../models';

export function getConfig(): vscode.WorkspaceConfiguration {
  return vscode.workspace.getConfiguration();
}

export function getVsiconsConfig(): IVSIcons {
  const config = vscode.workspace.getConfiguration();
  const mergedConfig = config.vsicons;
  const files = config.inspect<IFileExtension[]>('vsicons.associations.files');
  const folders = config.inspect<IFileExtension[]>('vsicons.associations.folders');

  if (files.workspaceValue && files.globalValue) {
    mergedConfig.associations.files = _.unionWith(files.workspaceValue, files.globalValue, _.isEqual);
  }

  if (folders.workspaceValue && folders.globalValue) {
    mergedConfig.associations.folders = _.unionWith(folders.workspaceValue, folders.globalValue, _.isEqual);
  }

  return mergedConfig;
}

export function findFiles(
  include: string,
  exclude: string,
  maxResults?: number,
  token?: vscode.CancellationToken): Thenable<vscode.Uri[]> {
  return vscode.workspace.findFiles(include, exclude, maxResults, token);
}

export function asRelativePath(pathOrUri: string | IVSCodeUri): string {
  return vscode.workspace.asRelativePath(pathOrUri);
}
