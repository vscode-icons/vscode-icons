import { IIconAssociation } from './iconAssociation';

export interface IIconMapping {
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
