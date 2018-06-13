import * as models from '../models/i18n';
import { langResourceCollection } from './langResourceCollection';
import { constants } from '../constants';

export class LanguageResourceManager implements models.ILanguageResourceManager {

  private messages: models.ILangResource;

  constructor(
    private language: string,
    private resourceCollection?: models.ILangResourceCollection |
      { [key: string]: { [key: string]: string | models.IOSSpecific; } }) {
    this.resourceCollection = this.resourceCollection || langResourceCollection;
    this.messages = (this.language && this.resourceCollection[this.language.toLowerCase()]) ||
      this.resourceCollection['en'];
  }

  public getMessage(...keys: Array<models.LangResourceKeys | string>): string {
    if (!this.messages) {
      return '';
    }

    let msg = '';
    keys.forEach(key => {
      // If key is of type 'number' it's a LangResourceKeys
      const stringifiedKey = typeof key === 'number' ? models.LangResourceKeys[key] : key;

      if (typeof key === 'number') {
        if (Reflect.has(this.messages, stringifiedKey)) {
          // If no message is found fallback to english message
          let message: string | models.IOSSpecific =
            this.messages[stringifiedKey] || langResourceCollection['en'][stringifiedKey];

          // If not a string then it's of type IOSSpecific
          if (typeof message !== 'string') {
            if (Reflect.has(message as models.IOSSpecific, process.platform)) {
              message = message[process.platform];
            } else {
              throw new Error(`Not Implemented: ${process.platform}`);
            }
          }
          msg += message as string;
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

    return msg.replace(/%extensionName%/gi, constants.extensionName).trim();
  }
}
