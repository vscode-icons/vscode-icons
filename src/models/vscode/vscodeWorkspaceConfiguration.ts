import type { ConfigurationTarget } from './vscodeConfigurationTarget';
import type { IPreset } from './vscodePreset';

export interface IVSCodeWorkspaceConfiguration {
  readonly [key: string]: unknown;
  get<T>(section: string): T | undefined;
  get<T>(section: string, defaultValue: T): T;
  has(section: string): boolean;
  inspect<T>(section: string): IPreset<T> | undefined;
  update(
    section: string,
    value: unknown,
    configurationTarget?: ConfigurationTarget | boolean,
  ): Thenable<void>;
}
