import { format } from 'util';
import {
  ILanguageResourceManager,
  INotificationManager,
  IVSCodeManager,
  LangResourceLike,
} from '../models';

export class NotificationManager implements INotificationManager {
  constructor(
    private vscodeManager: IVSCodeManager,
    private i18nManager: ILanguageResourceManager,
  ) {}

  public async notifyInfo(
    message: LangResourceLike,
    ...items: LangResourceLike[]
  ): Promise<LangResourceLike> {
    const { msg, msgItems } = this.getLocalizedMessage(message, ...items);
    const result = await this.vscodeManager.window.showInformationMessage(
      msg,
      ...msgItems,
    );
    return this.i18nManager.getLangResourceKey(result) || result;
  }

  public async notifyWarning(
    message: LangResourceLike,
    ...items: LangResourceLike[]
  ): Promise<LangResourceLike> {
    const { msg, msgItems } = this.getLocalizedMessage(message, ...items);
    const result = await this.vscodeManager.window.showWarningMessage(
      msg,
      ...msgItems,
    );
    return this.i18nManager.getLangResourceKey(result) || result;
  }

  public async notifyError(
    message: LangResourceLike,
    ...items: LangResourceLike[]
  ): Promise<LangResourceLike> {
    const { msg, msgItems } = this.getLocalizedMessage(message, ...items);
    const result = await this.vscodeManager.window.showErrorMessage(
      msg,
      ...msgItems,
    );
    return this.i18nManager.getLangResourceKey(result) || result;
  }

  private getLocalizedMessage(
    message: LangResourceLike,
    ...items: LangResourceLike[]
  ): { msg: string; msgItems: string[] } {
    let msg: string;
    if (typeof message === 'string' && message.includes(' ')) {
      const matchesLength: number = message.match(/%s/g).length;
      const sItems: LangResourceLike[] = items.splice(0, matchesLength);
      const msgs: string[] = sItems.map((sItem: LangResourceLike) =>
        this.i18nManager.localize(sItem),
      );
      msg = format(message, ...msgs);
    } else {
      msg = this.i18nManager.localize(message);
    }
    const msgItems: string[] = items.map((item: LangResourceLike) =>
      this.i18nManager.localize(item),
    );
    return { msg, msgItems };
  }
}
