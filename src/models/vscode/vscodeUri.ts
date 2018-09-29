export interface IVSCodeUri {
  readonly scheme: string;
  readonly authority: string;
  readonly path: string;
  readonly query: string;
  readonly fragment: string;
  readonly fsPath: string;
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
