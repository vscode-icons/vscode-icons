import { ILangResource, ILangResourceCollection, IOSSpecific, LangResourceKeys } from '../models/i18n';
import { langResourceCollection } from './langResourceCollection';
import { constants } from '../constants';

export class LanguageResourceManager {

  private messages: ILangResource;

  constructor(
    private language: string,
    private resourceCollection?: ILangResourceCollection |
      { [key: string]: { [key: string]: string | IOSSpecific; } }) {
    this.resourceCollection = this.resourceCollection || langResourceCollection;
    this.messages = (this.language && this.resourceCollection[this.language.toLowerCase()]) ||
      this.resourceCollection['en'];
  }

  public getMessage(...keys: Array<LangResourceKeys | string>): string {
    if (!this.messages) {
      return '';
    }

    let msg = '';
    keys.forEach(key => {
      // If key is of type 'number' it's a LangResourceKeys
      const stringifiedKey = typeof key === 'number' ? LangResourceKeys[key] : key;

      if (typeof key === 'number') {
        if (Reflect.has(this.messages, stringifiedKey)) {
          // If no message is found fallback to english message
          let message: string | IOSSpecific =
            this.messages[stringifiedKey] || langResourceCollection['en'][stringifiedKey];

          // If not a string then it's of type IOSSpecific
          if (typeof message !== 'string') {
            if (Reflect.has(message as IOSSpecific, process.platform)) {
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
