export interface IVSCodeMemento {
  get<T>(key: string): T | undefined;
  get<T>(key: string, defaultValue: T): T;
  update(key: string, value: unknown): Thenable<void>;
  setKeysForSync(keys: readonly string[]): void;
}
