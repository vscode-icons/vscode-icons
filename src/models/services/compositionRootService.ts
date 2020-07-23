export interface ICompositionRootService {
  dispose: () => void;
  get: <T>(arg: unknown) => T;
}
