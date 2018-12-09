import { IProjectDetection, IPresets, IAssociations } from '.';

export interface IVSIcons {
  associations: IAssociations;
  customIconFolderPath: string;
  dontShowNewVersionMessage: boolean;
  dontShowConfigManuallyChangedMessage: boolean;
  projectDetection: IProjectDetection;
  presets: IPresets;
}
