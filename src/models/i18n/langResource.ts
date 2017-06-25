import { IOSSpecific } from './';

export interface ILangResource {
  newVersion: string | IOSSpecific;
  seeReleaseNotes: string | IOSSpecific;
  dontShowThis: string | IOSSpecific;
  seeReadme: string | IOSSpecific;
  welcomeBegin: string | IOSSpecific;
  welcomeEnd: string | IOSSpecific;
  activationPath: string | IOSSpecific;
  aboutOfficialApi: string | IOSSpecific;
  learnMore: string | IOSSpecific;
  reload: string | IOSSpecific;
  autoReload: string | IOSSpecific;
  disableDetect: string | IOSSpecific;
  iconCustomization: string | IOSSpecific;
  iconRestore: string | IOSSpecific;
  ngPresetEnabled: string | IOSSpecific;
  ngPresetDisabled: string | IOSSpecific;
  jsOfficialPresetEnabled: string | IOSSpecific;
  jsOfficialPresetDisabled: string | IOSSpecific;
  tsOfficialPresetEnabled: string | IOSSpecific;
  tsOfficialPresetDisabled: string | IOSSpecific;
  jsonOfficialPresetEnabled: string | IOSSpecific;
  jsonOfficialPresetDisabled: string | IOSSpecific;
  hideFoldersPresetEnabled: string | IOSSpecific;
  hideFoldersPresetDisabled: string | IOSSpecific;
  foldersAllDefaultIconPresetEnabled: string | IOSSpecific;
  foldersAllDefaultIconPresetDisabled: string | IOSSpecific;
  restart: string | IOSSpecific;
  ngDetected: string | IOSSpecific;
  nonNgDetected: string | IOSSpecific;
  projectDetectionReset: string | IOSSpecific;
}
