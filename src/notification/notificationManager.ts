import { format } from 'util';
import {
  INotificationManager,
  IVSCodeManager,
  ILanguageResourceManager,
  LangResourceKeys,
} from '../models';

export class NotificationManager implements INotificationManager {
  constructor(
    private vscodeManager: IVSCodeManager,
    private i18nManager: ILanguageResourceManager,
  ) {}

  public notifyInfo<T extends string | LangResourceKeys | undefined>(
    message: string | LangResourceKeys,
    ...items: Array<string | LangResourceKeys>
  ): Thenable<T> {
    let msg: string;
    if (typeof message === 'string' && /%s/.test(message)) {
      const matchesLength = message.match(/%s/g).length;
      const sItems = items.splice(0, matchesLength);
      const msgs = sItems.map(sItem => this.i18nManager.getMessage(sItem));
      msg = format(message, ...msgs);
    } else {
      msg = this.i18nManager.getMessage(message);
    }
    const msgItems = items.map(item => this.i18nManager.getMessage(item));
    return this.vscodeManager.window
      .showInformationMessage(msg, ...msgItems)
      .then(
        result => (this.i18nManager.getLangResourceKey(result) || result) as T,
      );
  }
}
