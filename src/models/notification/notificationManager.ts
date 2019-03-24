import { LangResourceKeys } from '../i18n';

export type LangResourceKeyLike = string | LangResourceKeys;

export interface INotificationManager {
  notifyInfo(
    message: LangResourceKeyLike,
    ...items: LangResourceKeyLike[]
  ): Thenable<LangResourceKeyLike>;
}
