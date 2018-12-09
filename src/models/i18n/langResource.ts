import { IOSSpecific } from './osSpecific';

export interface ILangResource {
  newVersion: string | IOSSpecific;
  seeReleaseNotes: string | IOSSpecific;
  dontShowThis: string | IOSSpecific;
  seeReadme: string | IOSSpecific;
  welcome: string | IOSSpecific;
  activate: string | IOSSpecific;
  aboutOfficialApi: string | IOSSpecific;
  learnMore: string | IOSSpecific;
  reload: string | IOSSpecific;
  autoReload: string | IOSSpecific;
  disableDetect: string | IOSSpecific;
  iconCustomization: string | IOSSpecific;
  iconRestore: string | IOSSpecific;
  ngPresetEnabled: string | IOSSpecific;
  ngPresetDisabled: string | IOSSpecific;
  jsPresetEnabled: string | IOSSpecific;
  jsPresetDisabled: string | IOSSpecific;
  tsPresetEnabled: string | IOSSpecific;
  tsPresetDisabled: string | IOSSpecific;
  jsonPresetEnabled: string | IOSSpecific;
  jsonPresetDisabled: string | IOSSpecific;
  hideFoldersPresetEnabled: string | IOSSpecific;
  hideFoldersPresetDisabled: string | IOSSpecific;
  foldersAllDefaultIconPresetEnabled: string | IOSSpecific;
  foldersAllDefaultIconPresetDisabled: string | IOSSpecific;
  restart: string | IOSSpecific;
  ngDetected: string | IOSSpecific;
  nonNgDetected: string | IOSSpecific;
  ngDetectedPresetFalse: string | IOSSpecific;
  nonNgDetectedPresetTrue: string | IOSSpecific;
  projectDetectionReset: string | IOSSpecific;
}
