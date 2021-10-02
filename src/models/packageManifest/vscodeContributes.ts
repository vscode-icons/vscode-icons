import { IVSCodeCommand } from '../vscode/vscodeCommand';
import { IVSCodeConfiguration } from './vscodeConfiguration';
import { IVSCodeIconTheme } from './vscodeIconTheme';

export interface IVSCodeContributes {
  iconThemes: IVSCodeIconTheme[];
  commands: IVSCodeCommand[];
  configuration: IVSCodeConfiguration;
}
