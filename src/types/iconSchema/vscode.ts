import type { IconAssociation } from './common';

export const vscodeSchema: VSCodeIconSchema = {
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

export interface VSCodeIconSchema extends VSCodeIconMapping {
  $schema?: string;
  iconDefinitions: VSCodeIconDefinition;
  light: VSCodeIconMapping;
  highContrast?: VSCodeIconMapping;
  hidesExplorerArrows?: boolean;
}

export interface VSCodeIconMapping {
  rootFolder: string;
  rootFolderExpanded: string;
  file: string;
  folder: string;
  folderExpanded: string;
  folderNames: IconAssociation;
  folderNamesExpanded: IconAssociation;
  fileExtensions: IconAssociation;
  fileNames: IconAssociation;
  languageIds: IconAssociation;
}

export interface VSCodeIconDefinition {
  _file: VSCodeIconPath;
  _folder: VSCodeIconPath;
  _folder_open: VSCodeIconPath;
  _file_light: VSCodeIconPath;
  _folder_light: VSCodeIconPath;
  _folder_light_open: VSCodeIconPath;
  _root_folder: VSCodeIconPath;
  _root_folder_open: VSCodeIconPath;
  _root_folder_light: VSCodeIconPath;
  _root_folder_light_open: VSCodeIconPath;
}

export interface VSCodeIconPath {
  iconPath: string;
}
