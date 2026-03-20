import { IIconAssociation } from './iconAssociation';

export interface IZedIconSchema extends Record<string, unknown> {
  themes: IZedTheme[];
}

export interface IZedFileIcons {
  [iconName: string]: { path: string };
}

export interface IZedFolderIcons {
  [iconName: string]: {
    collapsed: string;
    expanded: string;
  };
}

export interface IZedTheme {
  name: string;
  appearance: 'light' | 'dark';

  directory_icons: {
    collapsed: string;
    expanded: string;
  };

  chevron_icons: {
    collapsed: string;
    expanded: string;
  };

  named_directory_icons: IZedFolderIcons;

  file_stems: IIconAssociation;

  file_suffixes: IIconAssociation;

  file_icons: IZedFileIcons;
}
