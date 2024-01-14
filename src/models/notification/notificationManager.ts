import { LangResourceKeys } from '../i18n';

export type LangResourceLike = string | number | LangResourceKeys;

export interface INotificationManager {
  notifyInfo(
    message: LangResourceLike,
    ...items: LangResourceLike[]
  ): Promise<LangResourceLike>;

  notifyWarning(
    message: LangResourceLike,
    ...items: LangResourceLike[]
  ): Promise<LangResourceLike>;

  notifyError(
    message: LangResourceLike,
    ...items: LangResourceLike[]
  ): Promise<LangResourceLike>;
}
