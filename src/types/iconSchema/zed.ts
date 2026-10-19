import type { IIconAssociation } from './common';

export const zedSchema: IZedIconSchema = {
  $schema: 'https://zed.dev/schema/icon_themes/v0.3.0.json',
  name: 'VSCode Icons Original',
  author: 'Roberto Huertas <roberto.huertas@outlook.com>',
  themes: [
    {
      name: 'VSCode Icons for Zed (Dark)',
      appearance: 'dark',
      directory_icons: {
        collapsed: '',
        expanded: '',
      },
      named_directory_icons: {},
      file_stems: {},
      file_suffixes: {},
      file_icons: {},
    },
    {
      name: 'VSCode Icons for Zed (Dark Official Icons)',
      appearance: 'dark',
      directory_icons: {
        collapsed: '',
        expanded: '',
      },
      named_directory_icons: {},
      file_stems: {},
      file_suffixes: {},
      file_icons: {},
    },
    {
      name: 'VSCode Icons for Zed (Dark Angular)',
      appearance: 'dark',
      directory_icons: {
        collapsed: '',
        expanded: '',
      },
      named_directory_icons: {},
      file_stems: {},
      file_suffixes: {},
      file_icons: {},
    },
    {
      name: 'VSCode Icons for Zed (Dark NestJS)',
      appearance: 'dark',
      directory_icons: {
        collapsed: '',
        expanded: '',
      },
      named_directory_icons: {},
      file_stems: {},
      file_suffixes: {},
      file_icons: {},
    },
    {
      name: 'VSCode Icons for Zed (Light)',
      appearance: 'light',
      directory_icons: {
        collapsed: '',
        expanded: '',
      },
      named_directory_icons: {},
      file_stems: {},
      file_suffixes: {},
      file_icons: {},
    },
    {
      name: 'VSCode Icons for Zed (Light Official Icons)',
      appearance: 'light',
      directory_icons: {
        collapsed: '',
        expanded: '',
      },
      named_directory_icons: {},
      file_stems: {},
      file_suffixes: {},
      file_icons: {},
    },
    {
      name: 'VSCode Icons for Zed (Light Angular)',
      appearance: 'light',
      directory_icons: {
        collapsed: '',
        expanded: '',
      },
      named_directory_icons: {},
      file_stems: {},
      file_suffixes: {},
      file_icons: {},
    },
    {
      name: 'VSCode Icons for Zed (Light NestJS)',
      appearance: 'light',
      directory_icons: {
        collapsed: '',
        expanded: '',
      },
      named_directory_icons: {},
      file_stems: {},
      file_suffixes: {},
      file_icons: {},
    },
  ],
};

export interface IZedIconSchema extends Record<string, unknown> {
  themes: IZedTheme[];
}

export interface IZedTheme {
  name: string;
  appearance: 'light' | 'dark';
  directory_icons: {
    collapsed: string;
    expanded: string;
  };
  named_directory_icons: IZedFolderIcons;
  file_stems: IIconAssociation;
  file_suffixes: IIconAssociation;
  file_icons: IZedFileIcons;
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
