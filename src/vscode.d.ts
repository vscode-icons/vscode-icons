import { WorkspaceConfiguration } from 'vscode';
import { IVSIcons } from './models/contributions';

declare module 'vscode' {
  interface WorkspaceConfiguration {
    vsicons: IVSIcons;
    inspect<T>(section: string): {defaultValue: T, globalValue: T, key: string, workspaceValue: T} | undefined;
  }
}
