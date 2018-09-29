import * as models from '../models';
import { constants } from '../constants';
import { langResourceCollection } from '../i18n/langResourceCollection';

export class LanguageResourceManager
  implements models.ILanguageResourceManager {
  constructor(private languageResource: models.ILangResource) {
    this.languageResource =
      this.languageResource && Reflect.ownKeys(this.languageResource).length
        ? this.languageResource
        : langResourceCollection.en;
  }

  public getMessage(...keys: Array<models.LangResourceKeys | string>): string {
    let msg = '';
    keys.forEach(key => {
      // If key is of type 'number' it's a LangResourceKeys
      const stringifiedKey: string =
        typeof key === 'number' ? models.LangResourceKeys[key] : key;

      if (typeof key === 'number') {
        if (Reflect.has(this.languageResource, stringifiedKey)) {
          // If no message is found fallback to english message
          let message: string | models.IOSSpecific =
            this.languageResource[stringifiedKey] ||
            langResourceCollection.en[stringifiedKey];

          // If not a string then it's of type IOSSpecific
          if (typeof message !== 'string') {
            if (Reflect.has(message, process.platform)) {
              message = message[process.platform];
            } else {
              throw new Error(`Not Implemented: ${process.platform}`);
            }
          }
          msg += message;
          return;
        }
        throw new Error(`${stringifiedKey} is not valid`);
      }

      stringifiedKey.split('').forEach(char => {
        if (char.match(/[#^*|\\/{}+=]/g)) {
          throw new Error(`${char} is not valid`);
        }

        msg += char;
        return;
      });
    });

    return msg.replace(/%extensionName%/gi, constants.extension.name).trim();
  }

  public getLangResourceKey(
    message?: string
  ): models.LangResourceKeys | undefined {
    if (!message) {
      return undefined;
    }
    const prop = Reflect.ownKeys(this.languageResource).find(
      key => this.languageResource[key] === message
    );
    return models.LangResourceKeys[prop];
  }
}
