import type { BindToFluentSyntax, ServiceIdentifier } from 'inversify';

import type { CompositionRootServiceContract } from '../types/services';

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

export class CompositionRootService implements CompositionRootServiceContract {
  private readonly container: Container;
  private injectableClasses: ReadonlyArray<
    [Class, Array<ServiceIdentifier<symbol>>]
  >;

  constructor(private context: types.VSCodeExtensionContext) {
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
          types.SYMBOLS.VSCodeManager,
          types.SYMBOLS.ConfigManager,
          types.SYMBOLS.SettingsManager,
          types.SYMBOLS.NotificationManager,
          types.SYMBOLS.IconsGenerator,
          types.SYMBOLS.ProjectAutoDetectionManager,
        ],
      ],
      [ConfigManager, [types.SYMBOLS.VSCodeManager]],
      [LanguageResourceManager, [types.SYMBOLS.Locale]],
      [
        IconsGenerator,
        [types.SYMBOLS.VSCodeManager, types.SYMBOLS.ConfigManager],
      ],
      [
        NotificationManager,
        [types.SYMBOLS.VSCodeManager, types.SYMBOLS.LanguageResourceManager],
      ],
      [
        ProjectAutoDetectionManager,
        [types.SYMBOLS.VSCodeManager, types.SYMBOLS.ConfigManager],
      ],
      [SettingsManager, [types.SYMBOLS.VSCodeManager]],
      [
        VSCodeManager,
        [types.SYMBOLS.VSCode, types.SYMBOLS.VSCodeExtensionContext],
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

    bind<string>(types.SYMBOLS.Locale).toConstantValue(vscode.env.language);
    bind<types.VSCode>(types.SYMBOLS.VSCode).toConstantValue(vscode);
    bind<types.VSCodeExtensionContext>(
      types.SYMBOLS.VSCodeExtensionContext,
    ).toConstantValue(this.context);

    bind<types.ExtensionManagerContract>(types.SYMBOLS.ExtensionManager).to(
      ExtensionManager,
    );
    bind<types.ConfigManagerContract>(types.SYMBOLS.ConfigManager).to(
      ConfigManager,
    );
    bind<types.SettingsManagerContract>(types.SYMBOLS.SettingsManager).to(
      SettingsManager,
    );
    bind<types.LanguageResourceManagerContract>(
      types.SYMBOLS.LanguageResourceManager,
    ).to(LanguageResourceManager);
    bind<types.NotificationManagerContract>(
      types.SYMBOLS.NotificationManager,
    ).to(NotificationManager);
    bind<types.IconsGeneratorContract>(types.SYMBOLS.IconsGenerator).to(
      IconsGenerator,
    );
    bind<types.ProjectAutoDetectionManagerContract>(
      types.SYMBOLS.ProjectAutoDetectionManager,
    ).to(ProjectAutoDetectionManager);
    bind<types.VSCodeManagerContract>(types.SYMBOLS.VSCodeManager).to(
      VSCodeManager,
    );
  }
}
