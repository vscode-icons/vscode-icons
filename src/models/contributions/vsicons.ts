import { IProjectDetection, IPresets, IAssociations } from './';

export interface IVSIcons {
  dontShowNewVersionMessage?: boolean;
  projectDetection: IProjectDetection;
  presets: IPresets;
  associations: IAssociations;
}
