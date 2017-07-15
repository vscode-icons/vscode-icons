import { WorkspaceConfiguration } from 'vscode';
import { IVSIcons } from './models/contributions';

declare module 'vscode' {
  interface WorkspaceConfiguration {
    vsicons: IVSIcons;
  }
}
