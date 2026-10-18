export interface IVSCodeCommand {
  title: string;
  command: string;
  tooltip?: string;
  arguments?: unknown[];

  // custom types
  category?: string;
  callbackName?: string;
}
