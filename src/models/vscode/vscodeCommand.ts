/* eslint-disable @typescript-eslint/no-explicit-any */

export interface IVSCodeCommand {
  title: string;
  command: string;
  tooltip?: string;
  arguments?: any[];

  // custom types
  category?: string;
  callbackName?: string;
}
