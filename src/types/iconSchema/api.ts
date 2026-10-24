export const apiSchema: IApiIconSchema = {
  files: {
    default: '',
    extensions: {},
    filenames: {},
  },
  folders: {
    default: {
      closed: '',
      opened: '',
    },
  },
  light: {
    files: {
      default: '',
      extensions: {},
      filenames: {},
    },
    folders: {
      default: {
        closed: '',
        opened: '',
      },
    },
  },
};

export type Theme = 'dark' | 'light';
export type State = 'closed' | 'opened';

export interface IApiIconSchema {
  $schema?: string;
  files: IApiIconFileDefinitions;
  folders: IApiIconFolderDefinitions;
  light: IApiIconDefinitions;
}

export interface IApiIconFileDefinitions {
  default: string;
  extensions: Record<string, string>;
  filenames: Record<string, string>;
}

export interface IApiIconFolderDefinitions {
  [name: string]: Record<State, string>;
  default: Record<State, string>;
}

export interface IApiIconDefinitions {
  files: IApiIconFileDefinitions;
  folders: IApiIconFolderDefinitions;
}

export interface IApiIconFileOptions {
  includePath?: boolean;
  theme?: Theme;
}

export interface IApiIconFolderOptions extends IApiIconFileOptions {
  state?: State;
}
