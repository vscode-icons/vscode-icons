/* eslint-disable @typescript-eslint/no-explicit-any */
import { ConfigurationTarget } from './vscodeConfigurationTarget';

export interface IPreset<T> {
  key: string;
  defaultValue?: T;
  globalValue?: T;
  workspaceValue?: T;
  workspaceFolderValue?: T;
}

export interface IVSCodeWorkspaceConfiguration {
  readonly [key: string]: any;
  get<T>(section: string): T | undefined;
  get<T>(section: string, defaultValue: T): T;
  has(section: string): boolean;
  inspect<T>(section: string): IPreset<T> | undefined;
  update(
    section: string,
    value: any,
    configurationTarget?: ConfigurationTarget | boolean,
  ): Thenable<void>;
}
