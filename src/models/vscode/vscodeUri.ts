export interface IVSCodeUri {
  scheme: string;
  authority: string;
  path: string;
  query: string;
  fragment: string;
  fsPath: string;
  with(change: {
    scheme?: string;
    authority?: string;
    path?: string;
    query?: string;
    fragment?: string;
  }): IVSCodeUri;
  toString(skipEncoding?: boolean): string;
  toJSON(): any;
}
