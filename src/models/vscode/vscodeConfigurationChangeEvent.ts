import { IVSCodeUri } from './vscodeUri';

export interface IVSCodeConfigurationChangeEvent {
  affectsConfiguration(section: string, resource?: IVSCodeUri): boolean;
}
