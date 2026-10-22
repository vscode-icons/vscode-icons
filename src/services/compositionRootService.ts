import type { BindToFluentSyntax, ServiceIdentifier } from 'inversify';

import type { ICompositionRootService } from '../types/services';

import { Container, decorate, inject, injectable } from 'inversify';
import 'reflect-metadata';
import * as vscode from 'vscode';

import { ExtensionManager } from '../app/extensionManager';
import { ConfigManager } from '../configuration/configManager';
import { LanguageResourceManager } from '../i18n/languageResourceManager';
import { IconsGenerator } from '../iconsManifest';
import { NotificationManager } from '../notification/notificationManager';
import { ProjectAutoDetectionManager } from '../pad/projectAutoDetectionManager';
import { SettingsManager } from '../settings/settingsManager';
import * as types from '../types';
import { VSCodeManager } from '../vscode/vscodeManager';

type Class = new (...args: unknown[]) => unknown;

export class CompositionRootService implements ICompositionRootService {
  private readonly container: Container;
  private injectableClasses: ReadonlyArray<
    [Class, Array<ServiceIdentifier<symbol>>]
  >;

  constructor(private context: types.IVSCodeExtensionContext) {
    this.container = new Container({ defaultScope: 'Singleton' });
    this.init();
    this.initDecorations();
    this.initBindings();
  }

  public get<T>(serviceIdentifier: ServiceIdentifier<T>): T {
    return this.container.get<T>(serviceIdentifier);
  }

  public dispose(): void {
    this.container.unbindAll();
  }

  private init(): void {
    // Each tuple has the form of (class, array of parameters)
    // The array of parameters MUST be declared in the precise order
    // they are declared in the constructor of each class
    this.injectableClasses = [
      [
        ExtensionManager,
        [
          types.SYMBOLS.IVSCodeManager,
          types.SYMBOLS.IConfigManager,
          types.SYMBOLS.ISettingsManager,
          types.SYMBOLS.INotificationManager,
          types.SYMBOLS.IIconsGenerator,
          types.SYMBOLS.IProjectAutoDetectionManager,
        ],
      ],
      [ConfigManager, [types.SYMBOLS.IVSCodeManager]],
      [LanguageResourceManager, [types.SYMBOLS.ILocale]],
      [
        IconsGenerator,
        [types.SYMBOLS.IVSCodeManager, types.SYMBOLS.IConfigManager],
      ],
      [
        NotificationManager,
        [types.SYMBOLS.IVSCodeManager, types.SYMBOLS.ILanguageResourceManager],
      ],
      [
        ProjectAutoDetectionManager,
        [types.SYMBOLS.IVSCodeManager, types.SYMBOLS.IConfigManager],
      ],
      [SettingsManager, [types.SYMBOLS.IVSCodeManager]],
      [
        VSCodeManager,
        [types.SYMBOLS.IVSCode, types.SYMBOLS.IVSCodeExtensionContext],
      ],
    ];

    this.injectableClasses
      .map(
        (injectableClass: [Class, Array<ServiceIdentifier<symbol>>]): Class =>
          injectableClass[0],
      )
      .forEach((klass: Class): void => {
        Reflect.deleteMetadata(
          '@inversifyjs/core/classIsInjectableFlagReflectKey',
          klass,
        );
        Reflect.deleteMetadata(
          '@inversifyjs/core/classMetadataReflectKey',
          klass,
        );
      });
  }

  private initDecorations(): void {
    this.injectableClasses.forEach(
      (injectableClass: [Class, Array<ServiceIdentifier<symbol>>]): void => {
        // declare classes as injectables
        const klass: Class = injectableClass[0];
        decorate(injectable(), klass);
        // declare injectable parameters
        const params: Array<ServiceIdentifier<symbol>> = injectableClass[1];
        params.forEach(
          (identifier: ServiceIdentifier<symbol>, index: number): void =>
            decorate(inject(identifier), klass, index),
        );
      },
    );
  }

  private initBindings(): void {
    const bind = <T>(identifier: ServiceIdentifier<T>): BindToFluentSyntax<T> =>
      this.container.bind<T>(identifier);

    bind<string>(types.SYMBOLS.ILocale).toConstantValue(vscode.env.language);
    bind<types.IVSCode>(types.SYMBOLS.IVSCode).toConstantValue(vscode);
    bind<types.IVSCodeExtensionContext>(
      types.SYMBOLS.IVSCodeExtensionContext,
    ).toConstantValue(this.context);

    bind<types.IExtensionManager>(types.SYMBOLS.IExtensionManager).to(
      ExtensionManager,
    );
    bind<types.IConfigManager>(types.SYMBOLS.IConfigManager).to(ConfigManager);
    bind<types.ISettingsManager>(types.SYMBOLS.ISettingsManager).to(
      SettingsManager,
    );
    bind<types.ILanguageResourceManager>(
      types.SYMBOLS.ILanguageResourceManager,
    ).to(LanguageResourceManager);
    bind<types.INotificationManager>(types.SYMBOLS.INotificationManager).to(
      NotificationManager,
    );
    bind<types.IIconsGenerator>(types.SYMBOLS.IIconsGenerator).to(
      IconsGenerator,
    );
    bind<types.IProjectAutoDetectionManager>(
      types.SYMBOLS.IProjectAutoDetectionManager,
    ).to(ProjectAutoDetectionManager);
    bind<types.IVSCodeManager>(types.SYMBOLS.IVSCodeManager).to(VSCodeManager);
  }
}
