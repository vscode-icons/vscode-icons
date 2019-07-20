import { LangResourceKeys } from './langResourceKeys';

export interface ILanguageResourceManager {
  localize(...keys: Array<LangResourceKeys | string>): string;
  getLangResourceKey(message?: string): LangResourceKeys | undefined;
}
