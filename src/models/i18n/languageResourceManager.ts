import { LangResourceLike } from '../notification/notificationManager';
import { LangResourceKeys } from './langResourceKeys';

export interface ILanguageResourceManager {
  localize(...keys: LangResourceLike[]): string;
  getLangResourceKey(message?: string): LangResourceKeys | undefined;
}
