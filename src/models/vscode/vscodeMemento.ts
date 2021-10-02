/* eslint-disable @typescript-eslint/no-explicit-any */

export interface IVSCodeMemento {
  get<T>(key: string): T | undefined;
  get<T>(key: string, defaultValue: T): T;
  update(key: string, value: any): Thenable<void>;
}
