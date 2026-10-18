import type { LangResourceKeys } from './langResourceKeys';
import type { LangResourceLike } from '../notification/notificationManager';

export interface ILanguageResourceManager {
  localize(...keys: LangResourceLike[]): string;
  getLangResourceKey(message?: string): LangResourceKeys | undefined;
}
