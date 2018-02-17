// tslint:disable object-literal-key-quotes
import { ILangResourceCollection } from '../models/i18n';
import de from '../../../locale/lang.de.json';
import en from '../../../locale/lang.en.json';
import es from '../../../locale/lang.es.json';
import fr from '../../../locale/lang.fr.json';
import it from '../../../locale/lang.it.json';
import ru from '../../../locale/lang.ru.json';
import zhCn from '../../../locale/lang.zh-cn.json';

export const langResourceCollection: ILangResourceCollection = {
  de,
  en,
  es,
  fr,
  it,
  ru,
  'zh-cn': zhCn,
};
