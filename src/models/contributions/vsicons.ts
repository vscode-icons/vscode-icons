import { IFileExtension, IFolderExtension, IFileDefault, IFolderDefault} from '../extensions';

export interface IVSIcons {
  dontShowNewVersionMessage?: boolean;
  presets: {
    angular2: boolean;
    jsOfficial: boolean;
    tsOfficial: boolean;
    hideFolders: boolean;
  };
  associations: {
    files: IFileExtension[];
    folders: IFolderExtension[];
    fileDefault: IFileDefault;
    folderDefault: IFolderDefault;
  };
}
