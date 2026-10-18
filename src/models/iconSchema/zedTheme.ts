import type { IIconAssociation } from './iconAssociation';
import type { IZedFileIcons } from './zedFileIcons';
import type { IZedFolderIcons } from './zedFolderIcons';

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
