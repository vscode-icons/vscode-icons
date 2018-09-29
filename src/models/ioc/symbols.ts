export const SYMBOLS = {
  IVSCodeManager: Symbol.for('IVSCodeManager'),
  IConfigManager: Symbol.for('IConfigManager'),
  ISettingsManager: Symbol.for('ISettingsManager'),
  IIconsGenerator: Symbol.for('IIconsGenerator'),
  ILanguageResourceManager: Symbol.for('ILanguageResourceManager'),
  INotificationManager: Symbol.for('INotificationManager'),
  IProjectAutoDetectionManager: Symbol.for('IProjectAutoDetectionManager'),
  IExtensionManager: Symbol.for('IExtensionManager'),
};

export type ServiceIdentifier = string | symbol;
