import type { IVSCodeConfiguration } from './vscodeConfiguration';
import type { IVSCodeIconTheme } from './vscodeIconTheme';
import type { IVSCodeCommand } from '../vscode/vscodeCommand';

export interface IVSCodeContributes {
  iconThemes: IVSCodeIconTheme[];
  commands: IVSCodeCommand[];
  configuration: IVSCodeConfiguration;
}
