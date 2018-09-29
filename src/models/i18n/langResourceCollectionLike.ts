import { IOSSpecific } from './osSpecific';

export interface ILangResourceCollectionLike {
  [key: number]: { [key: string]: string | IOSSpecific };
}
