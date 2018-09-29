import { IVSIcons } from '../contributions';
import { ConfigurationTarget } from '../vscode';

export interface IConfigManager {
  vsicons: IVSIcons;
  hasConfigChanged(
    currentConfig: IVSIcons | undefined,
    sections?: string[]
  ): boolean;
  getCustomIconsDirPath(path: string): string;
  getIconTheme(): string;
  getPreset<T>(
    presetName: string
  ):
    | {
        key: string;
        defaultValue?: T;
        globalValue?: T;
        workspaceValue?: T;
        workspaceFolderValue?: T;
      }
    | undefined;
  updateDontShowNewVersionMessage(value: boolean): Thenable<void>;
  updateDontShowConfigManuallyChangedMessage(value: boolean): Thenable<void>;
  updateAutoReload(value: boolean): Thenable<void>;
  updateDisableDetection(value: boolean): Thenable<void>;
  updateIconTheme(): Thenable<void>;
  updatePreset(
    presetName: string,
    value: boolean,
    configurationTarget: ConfigurationTarget | boolean
  ): Thenable<void>;
}
