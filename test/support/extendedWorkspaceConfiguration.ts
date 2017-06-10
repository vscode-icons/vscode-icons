import { IVSIcons } from '../../src/models';

export interface IExtendedWorkspaceConfiguration {
  vsicons: IVSIcons;
  get<T>(section: string): T | undefined;
  get<T>(section: string, defaultValue: T): T;
  has(section: string): boolean;
  inspect<T>(section: string): { defaultValue: T, globalValue: T, key: string, workspaceValue: T } | undefined;
  update(section: string, value: any, global?: boolean): Thenable<void>;
}
