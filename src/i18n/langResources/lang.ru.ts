import { ILangResource } from '../../models/i18n';
import { constants } from '../../constants';

export const langRu: ILangResource = {
  newVersion: `Добро пожаловать в новую версию ${constants.extensionName}.`,
  seeReleaseNotes: 'Информация о последних изменениях',
  dontShowThis: 'Не показывать это сообщение в следующий раз',
  seeReadme: 'Узнать больше об этом расширении',
  welcome: `Спасибо, что установили ${constants.extensionName}`,
  activate: 'Активировать',
  aboutOfficialApi: 'Узнать больше о значках файлов и папок',
  learnMore: 'Хотите узнать больше?',
  reload: 'Перезапустить',
  autoReload: 'Перезапускать автоматически',
  disableDetect: 'Отключить определение проекта',
  iconCustomization: 'Манифест значков будет переопределен.',
  iconRestore: 'Манифест значков будет восстановлен по-умолчанию.',
  ngPresetEnabled: 'Значки файлов Angular будут включены.',
  ngPresetDisabled: 'Значки файлов Angular будут отключены.',
  jsOfficialPresetEnabled: 'Официальный значок JS файлов будет включен.',
  jsOfficialPresetDisabled: 'Официальный значок JS файлов будет отключен.',
  tsOfficialPresetEnabled: 'Официальный значок TS файлов будет включен.',
  tsOfficialPresetDisabled: 'Официальный значок TS файлов будет отключен.',
  jsonOfficialPresetEnabled: 'Официальный значок JSON файлов будет включен.',
  jsonOfficialPresetDisabled: 'Официальный значок JSON файлов будет отключен.',
  hideFoldersPresetEnabled: 'Отображение значка папки будет включено.',
  hideFoldersPresetDisabled: 'Отображение значка папки будет отключено.',
  foldersAllDefaultIconPresetEnabled: 'Нестандартные значки папок будут включены.',
  foldersAllDefaultIconPresetDisabled: 'Нестандартные значки папок будут отключены.',
  restart: 'Нажмите \'Перезапустить\' чтобы изменения вступили в силу.',
  ngDetected: `${constants.extensionName} обнаружил проект Angular. ` +
  'Нажмите \'Перезапустить\' чтобы включить значки Angular.',
  nonNgDetected: `${constants.extensionName} обнаружил проект отличный от Angular. ` +
  'Нажмите \'Перезапустить\' чтобы отключить значки Angular.',
  projectDetectionReset: 'Определение проекта будет установлено по-умолчанию.',
};
