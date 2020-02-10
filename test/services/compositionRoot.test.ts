/* eslint-disable prefer-arrow-callback */
/* eslint-disable no-unused-expressions */
import 'reflect-metadata';
import { expect } from 'chai';
import * as sinon from 'sinon';
import * as proxyq from 'proxyquire';
import * as models from '../../src/models';
import { VSCodeManager } from '../../src/vscode/vscodeManager';
import { ConfigManager } from '../../src/configuration/configManager';
import { SettingsManager } from '../../src/settings/settingsManager';
import { LanguageResourceManager } from '../../src/i18n/languageResourceManager';
import { NotificationManager } from '../../src/notification/notificationManager';
import { IconsGenerator } from '../../src/iconsManifest';
import { ProjectAutoDetectionManager } from '../../src/pad/projectAutoDetectionManager';
import { ExtensionManager } from '../../src/app/extensionManager';
import { context as extensionContext } from '../fixtures/extensionContext';
import { vscode } from '../fixtures/vscode';

describe('CompositionRootService: tests', function () {
  context('ensures that', function () {
    let sandbox: sinon.SinonSandbox;
    let CompositionRootService: any;
    let crs: any;

    before(function () {
      proxyq.noCallThru();
      CompositionRootService = proxyq(
        '../../src/services/compositionRootService',
        { vscode },
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
      crs = new CompositionRootService(extensionContext);
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
