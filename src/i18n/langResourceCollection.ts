// tslint:disable object-literal-key-quotes
import { ILangResourceCollection } from '../models/i18n';
import * as resources from './langResources';

export const langResourceCollection: ILangResourceCollection = {
  de: resources.langDe,
  en: resources.langEn,
  es: resources.langEs,
  fr: resources.langFr,
  it: resources.langIt,
  ru: resources.langRu,
  "zh-cn": resources.langZhCn,
};
