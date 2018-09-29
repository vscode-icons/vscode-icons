import { LangResourceKeys } from '../i18n';

export interface INotificationManager {
  notifyInfo<T extends string | LangResourceKeys | undefined>(
    message: string | LangResourceKeys,
    ...items: Array<string | LangResourceKeys>
  ): Thenable<T>;
}
