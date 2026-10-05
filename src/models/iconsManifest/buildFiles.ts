import type { IIconAssociation } from '../iconSchema/iconAssociation';

export interface IBuildFiles {
  defs: Record<string, unknown>;
  names: {
    fileExtensions: IIconAssociation;
    fileNames: IIconAssociation;
  };
  zedFileNames: IIconAssociation;
  light: {
    fileExtensions: IIconAssociation;
    fileNames: IIconAssociation;
    zedFileNames: IIconAssociation;
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
