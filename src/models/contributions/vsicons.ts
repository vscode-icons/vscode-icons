import { IFileExtension, IFolderExtension, IFileDefault, IFolderDefault} from '../extensions';

export interface IVSIcons {
  dontShowNewVersionMessage?: boolean;
  presets: {
    angular: boolean;
    jsOfficial: boolean;
    tsOfficial: boolean;
    jsonOfficial: boolean,
    hideFolders: boolean;
  };
  associations: {
    files: IFileExtension[];
    folders: IFolderExtension[];
    fileDefault: IFileDefault;
    folderDefault: IFolderDefault;
  };
}
