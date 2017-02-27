import { ILangResource } from '../../models/i18n';

export const langEn: ILangResource = {
  newVersionMessage: 'Welcome to the new version of vscode-icons.',
  seeReleaseNotes: 'Information about the latest changes',
  dontShowThis: 'Don\'t show me this message next time',
  seeReadme: 'Learn about this extension',
  welcomeMessageBegin: 'vscode-icons now ships with official API support. Go to ',
  welcomeMessageEnd: 'and select VSCode Icons in order to activate.',
  activationPath: {
    darwin: 'Code > Preferences > File Icon Theme ',
    linux: 'File > Preferences > File Icon Theme ',
    win32: 'File > Preferences > File Icon Theme ',
  },
  aboutOfficialApi: 'Learn more about File & Folder icons',
  learnMore: 'Want to learn more?',
  urlReleaseNote: 'https://github.com/robertohuertasm/vscode-icons/blob/master/CHANGELOG.md',
  urlReadme: 'https://github.com/robertohuertasm/vscode-icons/blob/master/README.md',
  urlOfficialApi: 'http://code.visualstudio.com/docs/customization/themes#_select-an-icon-theme',
  reload: 'Restart',
  autoReload: 'Auto-Restart',
  disableDetect: 'Disable Detection',
  iconCustomizationMessage: 'The icons manifest will be regenerated. ',
  iconRestoreMessage: 'The icons manifest will be restored. ',
  ngPresetMessage: 'Angular icons will be',
  jsOfficialPresetMessage: 'Official JS icon will be',
  tsOfficialPresetMessage: 'Official TS icon will be',
  jsonOfficialPresetMessage: 'Official JSON icon will be',
  hideFoldersPresetMessage: 'Folder icons visibility will be',
  enabled: 'enabled',
  disabled: 'disabled',
  restart: 'Select \'Restart\' for changes to take effect.',
  ngDetected: 'vscode-icons has detected an Angular project. ' +
  'Select \'Restart\' to enable the Angular icons.',
  nonNgDetected: 'vscode-icons has detected a non Angular project. ' +
  'Select \'Restart\' to disable the Angular icons.',
  projectDetecticonResetMessage: 'Project Detection defaults will be reset.',
};
