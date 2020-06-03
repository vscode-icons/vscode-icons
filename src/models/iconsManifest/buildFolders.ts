import { IIconAssociation } from '../iconSchema/iconAssociation';

export interface IBuildFolders {
  defs: Record<string, unknown>;
  names: {
    folderNames: IIconAssociation;
    folderNamesExpanded: IIconAssociation;
  };
  light: {
    folderNames: IIconAssociation;
    folderNamesExpanded: IIconAssociation;
  };
}
