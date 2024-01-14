import {
  Container,
  decorate,
  inject,
  injectable,
  METADATA_KEY,
  interfaces,
} from 'inversify';
import { ServiceIdentifierOrFunc } from 'inversify/lib/annotation/lazy_service_identifier';
import 'reflect-metadata';
import * as vscode from 'vscode';
import { ExtensionManager } from '../app/extensionManager';
import { ConfigManager } from '../configuration/configManager';
import { LanguageResourceManager } from '../i18n/languageResourceManager';
import { IconsGenerator } from '../iconsManifest';
import { IntegrityManager } from '../integrity/integrityManager';
import * as models from '../models';
import { ICompositionRootService } from '../models/services/compositionRootService';
import { NotificationManager } from '../notification/notificationManager';
import { ProjectAutoDetectionManager } from '../pad/projectAutoDetectionManager';
import { SettingsManager } from '../settings/settingsManager';
import { VSCodeManager } from '../vscode/vscodeManager';

type Class = new (...args: unknown[]) => unknown;

export class CompositionRootService implements ICompositionRootService {
  private readonly container: Container;
  private injectableClasses: ReadonlyArray<
    [Class, Array<ServiceIdentifierOrFunc<symbol>>]
  >;

  constructor(private context: models.IVSCodeExtensionContext) {
    this.container = new Container({ defaultScope: 'Singleton' });
    this.init();
    this.initDecorations();
    this.initBindings();
  }

  public get<T>(serviceIdentifier: interfaces.ServiceIdentifier<T>): T {
    return this.container.get<T>(serviceIdentifier);
  }

  public dispose(): void {
    this.injectableClasses
      .map(
        (injectableClass: [Class, Array<ServiceIdentifierOrFunc<symbol>>]) =>
          injectableClass[0],
      )
      .forEach((klass: Class) => {
        Reflect.deleteMetadata(METADATA_KEY.PARAM_TYPES, klass);
        Reflect.deleteMetadata(METADATA_KEY.TAGGED, klass);
      });
  }

  private init(): void {
    // Each tuple has the form of (class, array of parameters)
    // The array of parameters MUST be declared in the precise order
    // they are declared in the constructor of each class
    this.injectableClasses = [
      [
        ExtensionManager,
        [
          models.SYMBOLS.IVSCodeManager,
          models.SYMBOLS.IConfigManager,
          models.SYMBOLS.ISettingsManager,
          models.SYMBOLS.INotificationManager,
          models.SYMBOLS.IIconsGenerator,
          models.SYMBOLS.IProjectAutoDetectionManager,
          models.SYMBOLS.IIntegrityManager,
        ],
      ],
      [ConfigManager, [models.SYMBOLS.IVSCodeManager]],
      [LanguageResourceManager, [models.SYMBOLS.ILocale]],
      [
        IconsGenerator,
        [models.SYMBOLS.IVSCodeManager, models.SYMBOLS.IConfigManager],
      ],
      [
        NotificationManager,
        [
          models.SYMBOLS.IVSCodeManager,
          models.SYMBOLS.ILanguageResourceManager,
        ],
      ],
      [
        ProjectAutoDetectionManager,
        [models.SYMBOLS.IVSCodeManager, models.SYMBOLS.IConfigManager],
      ],
      [SettingsManager, [models.SYMBOLS.IVSCodeManager]],
      [
        VSCodeManager,
        [models.SYMBOLS.IVSCode, models.SYMBOLS.IVSCodeExtensionContext],
      ],
      [IntegrityManager, []],
    ];
    this.dispose();
  }

  private initDecorations(): void {
    this.injectableClasses.forEach(
      (injectableClass: [Class, Array<ServiceIdentifierOrFunc<symbol>>]) => {
        // declare classes as injectables
        const klass: Class = injectableClass[0];
        decorate(injectable(), klass);
        // declare injectable parameters
        const params: Array<ServiceIdentifierOrFunc<symbol>> =
          injectableClass[1];
        params.forEach(
          (identifier: ServiceIdentifierOrFunc<symbol>, index: number) =>
            decorate(inject(identifier), klass, index),
        );
      },
    );
  }

  private initBindings(): void {
    const bind = <T>(
      identifier: interfaces.ServiceIdentifier<T>,
    ): interfaces.BindingToSyntax<T> => this.container.bind<T>(identifier);

    bind<string>(models.SYMBOLS.ILocale).toConstantValue(vscode.env.language);
    bind<models.IVSCode>(models.SYMBOLS.IVSCode).toConstantValue(vscode);
    bind<models.IVSCodeExtensionContext>(
      models.SYMBOLS.IVSCodeExtensionContext,
    ).toConstantValue(this.context);

    bind<models.IExtensionManager>(models.SYMBOLS.IExtensionManager).to(
      ExtensionManager,
    );
    bind<models.IConfigManager>(models.SYMBOLS.IConfigManager).to(
      ConfigManager,
    );
    bind<models.ISettingsManager>(models.SYMBOLS.ISettingsManager).to(
      SettingsManager,
    );
    bind<models.ILanguageResourceManager>(
      models.SYMBOLS.ILanguageResourceManager,
    ).to(LanguageResourceManager);
    bind<models.INotificationManager>(models.SYMBOLS.INotificationManager).to(
      NotificationManager,
    );
    bind<models.IIconsGenerator>(models.SYMBOLS.IIconsGenerator).to(
      IconsGenerator,
    );
    bind<models.IProjectAutoDetectionManager>(
      models.SYMBOLS.IProjectAutoDetectionManager,
    ).to(ProjectAutoDetectionManager);
    bind<models.IIntegrityManager>(models.SYMBOLS.IIntegrityManager).to(
      IntegrityManager,
    );
    bind<models.IVSCodeManager>(models.SYMBOLS.IVSCodeManager).to(
      VSCodeManager,
    );
  }
}
