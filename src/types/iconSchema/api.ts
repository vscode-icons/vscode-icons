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
  files: IApiIconDefinitions['files'];
  folders: IApiIconDefinitions['folders'];
  light: IApiIconDefinitions;
}

export interface IApiIconDefinitions {
  files: {
    default: string;
    extensions: Record<string, string>;
    filenames: Record<string, string>;
  };
  folders: Record<string, Partial<Record<State, string>>>;
}

export interface IApiIconFileOptions {
  includePath?: boolean;
  theme?: Theme;
}

export interface IApiIconFolderOptions extends IApiIconFileOptions {
  state?: State;
}
