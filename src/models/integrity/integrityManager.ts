export interface IIntegrityManager {
  check(): Promise<boolean>;
}
