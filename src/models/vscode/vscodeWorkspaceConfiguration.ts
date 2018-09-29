import { ConfigurationTarget } from './vscodeConfigurationTarget';

export interface IVSCodeWorkspaceConfiguration {
  get<T>(section: string): T | undefined;
  get<T>(section: string, defaultValue: T): T;
  has(section: string): boolean;
  inspect<T>(
    section: string
  ):
    | {
        key: string;
        defaultValue?: T;
        globalValue?: T;
        workspaceValue?: T;
        workspaceFolderValue?: T;
      }
    | undefined;
  update(
    section: string,
    value: any,
    configurationTarget?: ConfigurationTarget | boolean
  ): Thenable<void>;
  readonly [key: string]: any;
}
