export interface CompositionRootServiceContract {
  dispose: () => void;
  get: <T>(arg: unknown) => T;
}

export const SYMBOLS = {
  VSCodeManager: Symbol.for('VSCodeManager'),
  ConfigManager: Symbol.for('ConfigManager'),
  SettingsManager: Symbol.for('SettingsManager'),
  IconsGenerator: Symbol.for('IconsGenerator'),
  LanguageResourceManager: Symbol.for('LanguageResourceManager'),
  NotificationManager: Symbol.for('NotificationManager'),
  ProjectAutoDetectionManager: Symbol.for('ProjectAutoDetectionManager'),
  ExtensionManager: Symbol.for('ExtensionManager'),
  Locale: Symbol.for('Locale'),
  VSCode: Symbol.for('VSCode'),
  VSCodeExtensionContext: Symbol.for('VSCodeExtensionContext'),
};
