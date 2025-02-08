import { IVSIcons } from '../contributions';
import { ConfigurationTarget } from '../vscode';

export interface IConfigManager {
  vsicons: IVSIcons;
  updateVSIconsConfigState(): void;
  hasConfigChanged(
    currentConfig: IVSIcons | undefined,
    sections?: string[],
  ): boolean;
  getCustomIconsDirPath(path: string): Promise<string>;
  getIconTheme(): string;
  getPreset<T>(presetName: string):
    | {
        key: string;
        defaultValue?: Partial<T>;
        globalValue?: Partial<T>;
        workspaceValue?: Partial<T>;
        workspaceFolderValue?: Partial<T>;
      }
    | undefined;
  updateDontShowNewVersionMessage(value: boolean): Promise<void>;
  updateDontShowConfigManuallyChangedMessage(value: boolean): Promise<void>;
  updateAutoReload(value: boolean): Promise<void>;
  updateDisableDetection(value: boolean): Promise<void>;
  updateIconTheme(): Promise<void>;
  updatePreset(
    presetName: string,
    value: boolean,
    configurationTarget: ConfigurationTarget | boolean,
  ): Promise<void>;
}
