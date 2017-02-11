import { langDe, langEn, langEs } from './langResources';

import { ILangResource, ILangResourceCollection, IOSSpecific, LangResourceKeys } from '../models/i18n';

const langResourceCollection: ILangResourceCollection = {
  de: langDe,
  en: langEn,
  es: langEs,
};

export class LanguageResourceManager {

  constructor(private resourceCollection?: ILangResourceCollection | {}) {
    if (!this.resourceCollection) {
      this.resourceCollection = langResourceCollection;
    }
  }

  public getMessage(language: string, ...keys: Array<LangResourceKeys | string>): string {
    const messages: ILangResource = this.resourceCollection[language] || this.resourceCollection['en'];
    if (!messages) {
      return '';
    }

    let msg = '';
    keys.forEach((key) => {
      // If key is of type 'number' it's a LangResourceKeys
      const stringifiedKey = typeof key === "number" ? LangResourceKeys[key] : key;

      if (typeof key === "number") {
        if (Reflect.has(messages, stringifiedKey)) {
          let message: string | IOSSpecific = messages[stringifiedKey];
          // If no message is found fallback to english message
          if (!message) {
            message = this.resourceCollection['en'][stringifiedKey];
          }
          // If not a string then it's of type IOSSpecific
          if (typeof message !== 'string') {
            if (Reflect.has(message as IOSSpecific, process.platform)) {
              message = message[process.platform];
            }
          }
          msg += message;
          return;
        }
        throw new Error(`${stringifiedKey} is not valid`);
      }

      stringifiedKey.split('').forEach((char) => {
        if (char.match(/[a-zA-Z0-9!@%&\(\)-;:"'\[\]\.,<>\?\s]/g)) {
          msg += char;
          return;
        }

        throw new Error(`${char} is not valid`);
      });
    });

    return msg;
  }
}
