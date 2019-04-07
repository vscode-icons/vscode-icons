import { ILangResource } from './langResource';
import { ILangResourceCollectionLike } from './langResourceCollectionLike';

export interface ILangResourceCollection extends ILangResourceCollectionLike {
  de?: ILangResource;
  en: ILangResource;
  es?: ILangResource;
  fr?: ILangResource;
  it?: ILangResource;
  ja?: ILangResource;
  ko?: ILangResource;
  'pt-br'?: ILangResource;
  ru?: ILangResource;
  tr?: ILangResource;
  'zh-cn'?: ILangResource;
  'zh-tw'?: ILangResource;
}
