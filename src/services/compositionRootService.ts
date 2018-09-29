import * as vscode from 'vscode';
import {
  IVSCodeExtensionContext,
  IVSCodeManager,
  ISettingsManager,
  IIconsGenerator,
  ILanguageResourceManager,
  IExtensionManager,
  IProjectAutoDetectionManager,
  INotificationManager,
  IConfigManager,
  SYMBOLS,
  ServiceIdentifier,
} from '../models';
import { VSCodeManager } from '../vscode/vscodeManager';
import { ConfigManager } from '../configuration/configManager';
import { SettingsManager } from '../settings/settingsManager';
import { NotificationManager } from '../notification/notificationManager';
import { IconsGenerator } from '../iconsManifest';
import { LanguageResourceManager } from '../i18n/languageResourceManager';
import { langResourceCollection } from '../i18n/langResourceCollection';
import { ProjectAutoDetectionManager } from '../pad/projectAutoDetectionManager';
import { ExtensionManager } from '../app/extensionManager';

export class CompositionRootService {
  private readonly container: any[];

  constructor(context: IVSCodeExtensionContext) {
    this.container = [];
    if (context) {
      this.register(context);
    }
  }

  public get<T>(identifier: ServiceIdentifier): T {
    const result = this.container.find(element => {
      return element.identifier === identifier;
    });
    if (!result) {
      throw new Error(
        `Object not found for: ${identifier.toString()}`
      );
    }
    return result.obj as T;
  }

  private register(context: IVSCodeExtensionContext): void {
    const vscodeManager: IVSCodeManager = this.bind<IVSCodeManager>(
      SYMBOLS.IVSCodeManager,
      VSCodeManager,
      vscode,
      context
    );
    const configManager: IConfigManager = this.bind<IConfigManager>(
      SYMBOLS.IConfigManager,
      ConfigManager,
      vscodeManager
    );
    const settingsManager: ISettingsManager = this.bind<ISettingsManager>(
      SYMBOLS.ISettingsManager,
      SettingsManager,
      vscodeManager
    );
    const iconsGenerator: IIconsGenerator = this.bind<IIconsGenerator>(
      SYMBOLS.IIconsGenerator,
      IconsGenerator,
      vscodeManager,
      configManager
    );
    const languageResourceManager: ILanguageResourceManager = this.bind<
      ILanguageResourceManager
    >(
      SYMBOLS.ILanguageResourceManager,
      LanguageResourceManager,
      langResourceCollection[vscode.env.language]
    );
    const notificationManager: INotificationManager = this.bind<
      INotificationManager
    >(
      SYMBOLS.INotificationManager,
      NotificationManager,
      vscodeManager,
      languageResourceManager
    );
    const projectAutoDetectionManager: IProjectAutoDetectionManager = this.bind<
      IProjectAutoDetectionManager
    >(
      SYMBOLS.IProjectAutoDetectionManager,
      ProjectAutoDetectionManager,
      vscodeManager,
      configManager
    );

    this.bind<IExtensionManager>(
      SYMBOLS.IExtensionManager,
      ExtensionManager,
      vscodeManager,
      configManager,
      settingsManager,
      notificationManager,
      iconsGenerator,
      projectAutoDetectionManager
    );
  }

  private bind<T>(identifier: ServiceIdentifier, obj: any, ...args: any[]): T {
    if (!identifier) {
      throw new ReferenceError('Identifier cannot be undefined');
    }

    const bindedObj = Reflect.construct(obj, args) as T;
    this.container.push({ identifier, obj: bindedObj });
    return bindedObj;
  }
}
