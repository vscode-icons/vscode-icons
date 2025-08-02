/* eslint-disable prefer-arrow-callback */
/* eslint-disable no-unused-expressions */
import { expect } from 'chai';
import * as proxyq from 'proxyquire';
import 'reflect-metadata';
import * as sinon from 'sinon';
import { ExtensionManager } from '../../src/app/extensionManager';
import { ConfigManager } from '../../src/configuration/configManager';
import { LanguageResourceManager } from '../../src/i18n/languageResourceManager';
import { IconsGenerator } from '../../src/iconsManifest';
import * as models from '../../src/models';
import { ICompositionRootService } from '../../src/models/services/compositionRootService';
import { NotificationManager } from '../../src/notification/notificationManager';
import { ProjectAutoDetectionManager } from '../../src/pad/projectAutoDetectionManager';
import { SettingsManager } from '../../src/settings/settingsManager';
import { VSCodeManager } from '../../src/vscode/vscodeManager';
import { context as extensionContext } from '../fixtures/extensionContext';
import { vscode } from '../fixtures/vscode';

describe('CompositionRootService: tests', function () {
  type CompositionRootService = new (
    ...args: unknown[]
  ) => ICompositionRootService;

  context('ensures that', function () {
    let sandbox: sinon.SinonSandbox;
    let CRService: CompositionRootService;
    let crs: ICompositionRootService;

    before(function () {
      proxyq.noCallThru();
      CRService = (
        proxyq('../../src/services/compositionRootService', {
          vscode,
        }) as Record<string, CompositionRootService>
      ).CompositionRootService;
    });

    after(function () {
      proxyq.callThru();
    });

    beforeEach(function () {
      sandbox = sinon.createSandbox();
      sandbox.stub(VSCodeManager.prototype, 'workspace').get(() => ({
        getConfiguration: sandbox.stub(),
        onDidChangeConfiguration: sandbox.stub(),
      }));
      sandbox.stub(ConfigManager.prototype, 'vsicons').get(() => ({
        vsicons: sandbox.stub(),
      }));
      crs = new CRService(extensionContext);
    });

    afterEach(function () {
      crs.dispose();
      sandbox.restore();
    });

    context(`getting an object`, function () {
      context(`throws an Error`, function () {
        it(`when it can NOT be found`, function () {
          expect(() => crs.get('Interface')).to.throw(
            /No matching bindings found for serviceIdentifier: Interface/,
          );
        });
      });

      it(`returns that object`, function () {
        expect(crs.get(models.SYMBOLS.IVSCodeManager)).to.be.an.instanceOf(
          VSCodeManager,
        );

        expect(crs.get(models.SYMBOLS.IConfigManager)).to.be.an.instanceOf(
          ConfigManager,
        );

        expect(crs.get(models.SYMBOLS.ISettingsManager)).to.be.an.instanceOf(
          SettingsManager,
        );

        expect(
          crs.get(models.SYMBOLS.INotificationManager),
        ).to.be.an.instanceOf(NotificationManager);

        expect(crs.get(models.SYMBOLS.IIconsGenerator)).to.be.an.instanceOf(
          IconsGenerator,
        );

        expect(
          crs.get(models.SYMBOLS.IProjectAutoDetectionManager),
        ).to.be.an.instanceOf(ProjectAutoDetectionManager);

        expect(
          crs.get(models.SYMBOLS.ILanguageResourceManager),
        ).to.be.an.instanceOf(LanguageResourceManager);

        expect(crs.get(models.SYMBOLS.IExtensionManager)).to.be.an.instanceOf(
          ExtensionManager,
        );
      });
    });
  });
});
