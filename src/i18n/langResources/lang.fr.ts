import { ILangResource } from '../../models/i18n';

export const langFr: ILangResource = {
  newVersionMessage: 'Bienvenue dans la nouvelle version de vscode-icons.',
  seeReleaseNotes: 'Informations sur les dernières modifications (en anglais)',
  dontShowThis: 'Ne pas me montrer ce message la prochaine fois',
  seeReadme: 'En savoir plus sur cette extension (en anglais)',
  welcomeMessageBegin: 'vscode-icons utilise maintenant l\'API officielle. Aller à ',
  welcomeMessageEnd: 'et sélectionnez VSCode Icons pour activer.',
  activationPath: {
    darwin: 'Code > Préférences > Thème d\'icône de fichier ',
    linux: 'Fichier > Préférences > Thème d\'icône de fichier ',
    win32: 'Fichier > Préférences > Thème d\'icône de fichier ',
  },
  aboutOfficialApi: 'En savoir plus sur les icônes de Fichier et Dossier (en anglais)',
  learnMore: 'Vous voulez en savoir plus?',
  urlReleaseNote: 'https://github.com/robertohuertasm/vscode-icons/blob/master/CHANGELOG.md',
  urlReadme: 'https://github.com/robertohuertasm/vscode-icons/blob/master/README.md',
  urlOfficialApi: 'http://code.visualstudio.com/docs/customization/themes#_select-an-icon-theme',
  reload: 'Redémarrer',
  autoReload: 'Redémarrage automatique',
  disableDetect: 'Désactiver la détection',
  iconCustomizationMessage: 'Le manifeste des icônes sera régénéré. ',
  iconRestoreMessage: 'Le manifeste des icônes sera restauré. ',
  ngPresetMessage: 'Les icônes Angular seront',
  jsOfficialPresetMessage: 'L\'icône officielle JS sera',
  tsOfficialPresetMessage: 'L\'icône officielle TS sera',
  jsonOfficialPresetMessage: 'L\'icône officielle JSON sera',
  hideFoldersPresetMessage: 'La visibilité des icônes des dossiers sera',
  enabled: 'activée(s)',
  disabled: 'désactivée(s)',
  restart: 'Sélectionnez \'Redémarrer\' pour que les modifications prennent effet.',
  ngDetected: 'vscode-icons a détecté un projet Angular. ' +
  'Sélectionnez \'Redémarrer\' pour activer les icônes Angular.',
  nonNgDetected: 'vscode-icons a détecté un projet non Angular. ' +
  'Sélectionnez \'Redémarrer\' pour désactiver les icônes Angular.',
  projectDetecticonResetMessage: 'Défaut de détection de projet seront réinitialisés.',
};
