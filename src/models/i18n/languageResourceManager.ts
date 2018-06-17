import { LangResourceKeys } from './langResourceKeys';

export interface ILanguageResourceManager {
  getMessage(...keys: Array<LangResourceKeys | string>): string;
}
