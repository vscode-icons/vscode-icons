export const apiSchema: ApiIconSchema = {
  files: {
    _default: '',
    extensions: {},
    filenames: {},
  },
  folders: {
    _default: {
      closed: '',
      opened: '',
    },
  },
  light: {
    files: {
      _default: '',
      extensions: {},
      filenames: {},
    },
    folders: {
      _default: {
        closed: '',
        opened: '',
      },
    },
  },
};

export type FolderState = 'closed' | 'opened';

export interface ApiIconSchema {
  $schema?: string;
  files: ApiIconFileDefinitions;
  folders: ApiIconFolderDefinitions;
  light: ApiIconDefinitions;
}

export interface ApiIconFileDefinitions {
  _default: string;
  extensions: Record<string, string>;
  filenames: Record<string, string>;
}

export interface ApiIconFolderDefinitions {
  [name: string]: Record<FolderState, string>;
  _default: Record<FolderState, string>;
}

export interface ApiIconDefinitions {
  files: ApiIconFileDefinitions;
  folders: ApiIconFolderDefinitions;
}
