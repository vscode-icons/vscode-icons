import { IIconAssociation } from '../iconSchema/iconAssociation';

export interface IBuildFiles {
  defs: Record<string, unknown>;
  names: {
    fileExtensions: IIconAssociation;
    fileNames: IIconAssociation;
  };
  light: {
    fileExtensions: IIconAssociation;
    fileNames: IIconAssociation;
    language: {
      fileExtensions: IIconAssociation;
      fileNames: IIconAssociation;
      languageIds: IIconAssociation;
    };
  };
  language: {
    fileExtensions: IIconAssociation;
    fileNames: IIconAssociation;
    languageIds: IIconAssociation;
  };
}
