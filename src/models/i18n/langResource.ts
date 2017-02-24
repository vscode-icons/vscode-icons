import { IOSSpecific } from './';

export interface ILangResource {
  newVersionMessage: string | IOSSpecific;
  seeReleaseNotes: string | IOSSpecific;
  dontShowThis: string | IOSSpecific;
  seeReadme: string | IOSSpecific;
  welcomeMessageBegin: string | IOSSpecific;
  welcomeMessageEnd: string | IOSSpecific;
  activationPath: string | IOSSpecific;
  aboutOfficialApi: string | IOSSpecific;
  learnMore: string | IOSSpecific;
  urlReleaseNote: string | IOSSpecific;
  urlReadme: string | IOSSpecific;
  urlOfficialApi: string | IOSSpecific;
  reload: string | IOSSpecific;
  autoReload: string | IOSSpecific;
  disableDetect: string | IOSSpecific;
  iconCustomizationMessage: string | IOSSpecific;
  iconRestoreMessage: string | IOSSpecific;
  ngPresetMessage: string | IOSSpecific;
  jsOfficialPresetMessage: string | IOSSpecific;
  tsOfficialPresetMessage: string | IOSSpecific;
  jsonOfficialPresetMessage: string | IOSSpecific;
  hideFoldersPresetMessage: string | IOSSpecific;
  enabled: string | IOSSpecific;
  disabled: string | IOSSpecific;
  restart: string | IOSSpecific;
  ngDetected: string | IOSSpecific;
  nonNgDetected: string | IOSSpecific;
  projectDetecticonResetMessage: string | IOSSpecific;
}
