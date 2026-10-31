import type { IconAssociation } from './common';
import type { BuildFiles, BuildFolders } from '../vsicons';

export const zedSchema: ZedIconSchema = {
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

export interface ZedIconSchema {
  $schema?: string;
  author: string;
  name: string;
  themes: ZedTheme[];
}

export interface ZedTheme {
  name: string;
  appearance: 'light' | 'dark';
  directory_icons: {
    collapsed: string;
    expanded: string;
  };
  named_directory_icons: ZedFolderIcons;
  file_stems: IconAssociation;
  file_suffixes: IconAssociation;
  file_icons: ZedFileIcons;
}

export interface ZedFileIcons {
  [iconName: string]: { path: string };
}

export interface ZedFolderIcons {
  [iconName: string]: {
    collapsed: string;
    expanded: string;
  };
}

export interface ZedJsonStructureOptions {
  files: BuildFiles;
  folders: BuildFolders;
  filesOfficial: BuildFiles;
  foldersOfficial: BuildFolders;
  filesAngular: BuildFiles;
  filesNest: BuildFiles;
  schema: ZedIconSchema;
}
