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
  ru?: ILangResource;
  'zh-cn'?: ILangResource;
  'zh-tw'?: ILangResource;
}
