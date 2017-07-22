import { ILangResource } from '../../models/i18n';
import { constants } from '../../constants';

export const langIt: ILangResource = {
  newVersion: `Benvenuto alla nuova versione di ${constants.extensionName}.`,
  seeReleaseNotes: 'Informazioni sugli ultimi cambiamenti (in inglese)',
  dontShowThis: 'Non mostrare più questo messaggio',
  seeReadme: 'Sapere di più sull\'estensione',
  welcome: `${constants.extensionName} ora usa la API ufficiale.`,
  activate: '',
  aboutOfficialApi: 'Sapere di più su icone per File & Cartelle (in inglese)',
  learnMore: 'Vuoi saperne di più?',
  reload: 'Riavvia',
  autoReload: 'Riavvio Automatico',
  disableDetect: 'Disabilita Rilevazione',
  iconCustomization: 'Il manifesto delle icone sarà rigenerato.',
  iconRestore: 'Il manifesto delle icone sarà ripristinato.',
  ngPresetEnabled: 'Le icone Angular saranno abilitate.',
  ngPresetDisabled: 'Le icone Angular saranno disabilitate.',
  jsOfficialPresetEnabled: 'Icone ufficiali JS saranno abilitate.',
  jsOfficialPresetDisabled: 'Icone ufficiali JS saranno disabilitate.',
  tsOfficialPresetEnabled: 'Icone ufficiali TS saranno abilitate.',
  tsOfficialPresetDisabled: 'Icone ufficiali TS saranno disabilitate.',
  jsonOfficialPresetEnabled: 'Icone ufficiali JSON saranno abilitate.',
  jsonOfficialPresetDisabled: 'Icone ufficiali JSON saranno disabilitate.',
  hideFoldersPresetEnabled: 'Visibilità icone cartelle sarà abilitata.',
  hideFoldersPresetDisabled: 'Visibilità icone cartelle sarà disabilitata.',
  foldersAllDefaultIconPresetEnabled: 'Icone specifiche per cartelle saranno abilitate.',
  foldersAllDefaultIconPresetDisabled: 'Icone specifiche per cartelle saranno disabilitate.',
  restart: 'Seleziona \'Riavvia\' affinché le modifiche abbiano effetto.',
  ngDetected: `${constants.extensionName} ha rilevato un progetto Angular. ` +
  'Seleziona \'Riavvia\' per abilitare le icone Angular.',
  nonNgDetected: `${constants.extensionName} ha rilevato un progetto non Angular. ` +
  'Seleziona \'Riavvia\' per disabilitare le icone Angular.',
  projectDetectionReset: 'Impostazioni Rilevazione Progetto Predefinite saranno ripristinate.',
};
