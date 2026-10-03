import type { IAssociations, IPresets, IProjectDetection } from '.';

export interface IVSIcons {
  associations: IAssociations;
  customIconFolderPath: string;
  dontShowNewVersionMessage: boolean;
  dontShowConfigManuallyChangedMessage: boolean;
  projectDetection: IProjectDetection;
  presets: IPresets;
}
