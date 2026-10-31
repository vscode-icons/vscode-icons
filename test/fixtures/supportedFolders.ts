import type { FolderCollection } from '../../src/types';

export const extensions: FolderCollection = {
  default: {
    folder: { icon: 'folder' },
    root_folder: { icon: 'root_folder' },
  },
  supported: [
    { icon: 'api', extensions: ['api', '.api'] },
    { icon: 'aws', extensions: ['aws', '.aws'] },
    {
      icon: 'aws2',
      extensions: ['aws', '.aws'],
      disabled: true,
    },
    {
      icon: 'fonts',
      extensions: ['fonts', 'font', 'fnt'],
      light: true,
    },
    { icon: 'json', extensions: ['json'] },
    {
      icon: 'json_official',
      extensions: ['json'],
      disabled: true,
    },
  ],
};
