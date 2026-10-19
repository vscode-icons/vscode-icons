import type { IIconAssociation } from './common';

export const schema: IIconSchema = {
  $schema: 'vscode://schemas/icon-theme',
  iconDefinitions: {
    _file: { iconPath: '' },
    _folder: { iconPath: '' },
    _folder_open: { iconPath: '' },
    _root_folder: { iconPath: '' },
    _root_folder_open: { iconPath: '' },
    _file_light: { iconPath: '' },
    _folder_light: { iconPath: '' },
    _folder_light_open: { iconPath: '' },
    _root_folder_light: { iconPath: '' },
    _root_folder_light_open: { iconPath: '' },
  },
  file: '_file',
  folder: '_folder',
  folderExpanded: '_folder_open',
  rootFolder: '_root_folder',
  rootFolderExpanded: '_root_folder_open',
  folderNames: {},
  folderNamesExpanded: {},
  fileExtensions: {},
  fileNames: {},
  languageIds: {},
  light: {
    file: '_file_light',
    folder: '_folder_light',
    folderExpanded: '_folder_light_open',
    rootFolder: '_root_folder_light',
    rootFolderExpanded: '_root_folder_light_open',
    folderNames: {},
    folderNamesExpanded: {},
    fileExtensions: {},
    fileNames: {},
    languageIds: {},
  },
  hidesExplorerArrows: false,
};

export interface IIconSchema extends IIconMapping {
  iconDefinitions: IIconDefinition;
  light: IIconMapping;
  highContrast?: IIconMapping;
  hidesExplorerArrows?: boolean;
}

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

export interface IIconDefinition {
  _file: IIconPath;
  _folder: IIconPath;
  _folder_open: IIconPath;
  _file_light: IIconPath;
  _folder_light: IIconPath;
  _folder_light_open: IIconPath;
  _root_folder: IIconPath;
  _root_folder_open: IIconPath;
  _root_folder_light: IIconPath;
  _root_folder_light_open: IIconPath;
}

export interface IIconPath {
  iconPath: string;
}
