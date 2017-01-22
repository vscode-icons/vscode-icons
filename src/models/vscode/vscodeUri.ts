export interface IVSCodeUri {
  scheme: string;
  authority: string;
  path: string;
  query: string;
  fragment: string;
  fsPath: string;
  toString(): string;
  toJSON(): any;
}
