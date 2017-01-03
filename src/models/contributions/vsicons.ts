import { IFileExtension, IFolderExtension } from '../extensions';

export interface IVSIcons {
  dontShowNewVersionMessage?: boolean;
  presets: {
    angular2: boolean;
    jsOfficial: boolean;
    tsOfficial: boolean;
  };
  associations: {
    files: IFileExtension[];
    folders: IFolderExtension[];
  };
}
