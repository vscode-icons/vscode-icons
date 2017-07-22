import { ILangResource } from '../../models/i18n';
import { constants } from '../../constants';

export const langEn: ILangResource = {
  newVersion: `Welcome to the new version of ${constants.extensionName}.`,
  seeReleaseNotes: 'Information about the latest changes',
  dontShowThis: 'Don\'t show me this message next time',
  seeReadme: 'Learn about this extension',
  welcome: `${constants.extensionName} now ships with official API support.`,
  activate: 'Activate',
  aboutOfficialApi: 'Learn more about File & Folder icons',
  learnMore: 'Want to learn more?',
  reload: 'Restart',
  autoReload: 'Auto-Restart',
  disableDetect: 'Disable Detection',
  iconCustomization: 'The icons manifest will be regenerated.',
  iconRestore: 'The icons manifest will be restored.',
  ngPresetEnabled: 'Angular icons will be enabled.',
  ngPresetDisabled: 'Angular icons will be disabled.',
  jsOfficialPresetEnabled: 'Official JS icon will be enabled.',
  jsOfficialPresetDisabled: 'Official JS icon will be disabled.',
  tsOfficialPresetEnabled: 'Official TS icon will be enabled.',
  tsOfficialPresetDisabled: 'Official TS icon will be disabled.',
  jsonOfficialPresetEnabled: 'Official JSON icon will be enabled.',
  jsonOfficialPresetDisabled: 'Official JSON icon will be disabled.',
  hideFoldersPresetEnabled: 'Folder icons visibility will be enabled.',
  hideFoldersPresetDisabled: 'Folder icons visibility will be disabled.',
  foldersAllDefaultIconPresetEnabled: 'Specific folder icons will be enabled.',
  foldersAllDefaultIconPresetDisabled: 'Specific folder icons will be disabled.',
  restart: 'Select \'Restart\' for changes to take effect.',
  ngDetected: `${constants.extensionName} has detected an Angular project. ` +
  'Select \'Restart\' to enable the Angular icons.',
  nonNgDetected: `${constants.extensionName} has detected a non Angular project. ` +
  'Select \'Restart\' to disable the Angular icons.',
  projectDetectionReset: 'Project Detection defaults will be reset.',
};
