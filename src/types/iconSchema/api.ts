export const apiSchema: IApiIconSchema = {
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

export type State = 'closed' | 'opened';

export interface IApiIconSchema {
  $schema?: string;
  files: IApiIconFileDefinitions;
  folders: IApiIconFolderDefinitions;
  light: IApiIconDefinitions;
}

export interface IApiIconFileDefinitions {
  _default: string;
  extensions: Record<string, string>;
  filenames: Record<string, string>;
}

export interface IApiIconFolderDefinitions {
  [name: string]: Record<State, string>;
  _default: Record<State, string>;
}

export interface IApiIconDefinitions {
  files: IApiIconFileDefinitions;
  folders: IApiIconFolderDefinitions;
}
