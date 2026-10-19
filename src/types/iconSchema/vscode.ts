import type { IIconAssociation } from './common';

export const schema: IVSCodeIconSchema = {
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

export interface IVSCodeIconSchema extends IVSCodeIconMapping {
  iconDefinitions: IVSCodeIconDefinition;
  light: IVSCodeIconMapping;
  highContrast?: IVSCodeIconMapping;
  hidesExplorerArrows?: boolean;
}

export interface IVSCodeIconMapping extends Record<string, unknown> {
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

export interface IVSCodeIconDefinition {
  _file: IVSCodeIconPath;
  _folder: IVSCodeIconPath;
  _folder_open: IVSCodeIconPath;
  _file_light: IVSCodeIconPath;
  _folder_light: IVSCodeIconPath;
  _folder_light_open: IVSCodeIconPath;
  _root_folder: IVSCodeIconPath;
  _root_folder_open: IVSCodeIconPath;
  _root_folder_light: IVSCodeIconPath;
  _root_folder_light_open: IVSCodeIconPath;
}

export interface IVSCodeIconPath {
  iconPath: string;
}
