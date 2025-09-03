import * as langResources from '../../../lang.nls.bundle.json';
import { constants } from '../constants';
import * as models from '../models';

export class LanguageResourceManager
  implements models.ILanguageResourceManager
{
  private defaultLangResource: string[];
  private currentLangResource: string[];

  constructor(private locale: string) {
    const languages = langResources as Record<string, string[]>;
    this.defaultLangResource = languages.en;
    this.currentLangResource =
      (this.locale && languages[this.locale]) || this.defaultLangResource;
  }

  public localize(...keys: models.LangResourceLike[]): string {
    let msg = '';
    keys
      .filter(
        (key: models.LangResourceLike) => key !== null && key !== undefined,
      )
      .forEach((resourceKey: models.LangResourceLike) => {
        if (typeof resourceKey === 'number') {
          if (this.currentLangResource.length > resourceKey) {
            // If no message is found fallback to english message
            let message: string | models.IOSSpecific =
              this.currentLangResource[resourceKey] ||
              this.defaultLangResource[resourceKey];

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
          throw new Error(
            `Language resource key '${resourceKey}' is not valid`,
          );
        }

        resourceKey.split('').forEach((char: string) => {
          if (char.match(/[#^*|\\/{}+=]/g)) {
            throw new Error(`${char} is not valid`);
          }
          msg += char;
        });
      });

    return msg.replace(/%extensionName%/gi, constants.extension.name).trim();
  }

  public getLangResourceKey(
    message?: string,
  ): models.LangResourceKeys | undefined {
    if (!message) {
      return undefined;
    }
    const key = this.currentLangResource.findIndex(
      (res: never) => res === message,
    );
    return key > -1 ? key : undefined;
  }
}
