import { ILangResource } from '../../models/i18n';
import { constants } from '../../constants';

export const langFr: ILangResource = {
  newVersion: `Bienvenue dans la nouvelle version de ${constants.extensionName}.`,
  seeReleaseNotes: 'Information à propos des derniers changement',
  dontShowThis: 'Ne pas afficher ce message la prochaine fois',
  seeReadme: 'A propos de l\'extension (rédigé en anglais)',
  welcome: `${constants.extensionName} supporte désormais l'API officielle.`,
  activate: 'Activer',
  aboutOfficialApi: 'Plus à propos des icônes de fichier & dossier. (rédigé en anglais)',
  learnMore: 'Envie d\'en apprendre plus?',
  reload: 'Recharger',
  autoReload: 'Rechargement automatique',
  disableDetect: 'Désactiver la détection automatique',
  iconCustomization: 'Les icônes vont êtres actualisées.',
  iconRestore: 'Les icônes vont êtres restaurées.',
  ngPresetEnabled: 'Les icônes Angular vont êtres activées.',
  ngPresetDisabled: 'Les icônes Angular vont êtres désactivées.',
  jsOfficialPresetEnabled: 'L\'icône officielle JS va être activé.',
  jsOfficialPresetDisabled: 'L\'icône officielle JS va être désactivé.',
  tsOfficialPresetEnabled: 'L\'icône officielle TS va être activé.',
  tsOfficialPresetDisabled: 'L\'icône officielle TS va être désactivé.',
  jsonOfficialPresetEnabled: 'L\'icône officielle JSON va être activé.',
  jsonOfficialPresetDisabled: 'L\'icône officielle JSON va être désactivé.',
  hideFoldersPresetEnabled: 'Les icônes de fichier vont êtres activées',
  hideFoldersPresetDisabled: 'Les icônes de fichier vont êtres désactivées.',
  foldersAllDefaultIconPresetEnabled: 'Les icônes pour dossier vont êtres activées',
  foldersAllDefaultIconPresetDisabled: 'Les icônes pour dossier vont êtres désactivées',
  restart: 'Seléctionner \'Recharger\' pour que les changements soit effectifs.',
  ngDetected: `${constants.extensionName} a détécté un projet Angular. ` +
  'Sélectionner \'Recharger\' pour activer les icônes Angular.',
  nonNgDetected: `${constants.extensionName} a détecté un projet non Angular. ` +
  'Sélectionner \'Recharger\' pour désactiver les icônes Angular.',
  projectDetectionReset: 'La détection de projet va être réinitialisé',
};
