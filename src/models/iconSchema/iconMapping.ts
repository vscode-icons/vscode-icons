import { IIconAssociation } from './iconAssociation';

export interface IIconMapping extends Record<string, unknown> {
  rootFolder: string;
  rootFolderExpanded: string;
  file: string;
  folder: string;
  folderExpanded: string;
  folderNames: IIconAssociation;
  folderNamesExpanded: IIconAssociation;
  fileExtensions: IIconAssociation;
  fileNames: IIconAssociation;
  languageIds: IIconAssociation;
}
