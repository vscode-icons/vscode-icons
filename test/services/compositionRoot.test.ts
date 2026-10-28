import type { CompositionRootServiceContract } from '../../src/types/services';

import { expect } from 'chai';
import proxyq from 'proxyquire';
import 'reflect-metadata';
import * as sinon from 'sinon';

import { ExtensionManager } from '../../src/app/extensionManager';
import { ConfigManager } from '../../src/configuration/configManager';
import { LanguageResourceManager } from '../../src/i18n/languageResourceManager';
import { IconsGenerator } from '../../src/iconsManifest';
import { NotificationManager } from '../../src/notification/notificationManager';
import { ProjectAutoDetectionManager } from '../../src/pad/projectAutoDetectionManager';
import { SettingsManager } from '../../src/settings/settingsManager';
import * as types from '../../src/types';
import { VSCodeManager } from '../../src/vscode/vscodeManager';
import { context as extensionContext } from '../fixtures/extensionContext';
import { vscode } from '../fixtures/vscode';

describe('CompositionRootServiceContract: tests', function () {
  type CompositionRootServiceFactory = new (
    ...args: unknown[]
  ) => CompositionRootServiceContract;

  context('ensures that', function () {
    let sandbox: sinon.SinonSandbox;
    let CRService: CompositionRootServiceFactory;
    let crs: CompositionRootServiceContract;

    before(function () {
      proxyq.noCallThru();
      CRService = (
        proxyq('../../src/services/compositionRootService', {
          vscode,
        }) as Record<string, CompositionRootServiceFactory>
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
            /No bindings found for service: "Interface"/,
          );
        });
      });

      it(`returns that object`, function () {
        expect(crs.get(types.SYMBOLS.VSCodeManager)).to.be.an.instanceOf(
          VSCodeManager,
        );

        expect(crs.get(types.SYMBOLS.ConfigManager)).to.be.an.instanceOf(
          ConfigManager,
        );

        expect(crs.get(types.SYMBOLS.SettingsManager)).to.be.an.instanceOf(
          SettingsManager,
        );

        expect(crs.get(types.SYMBOLS.NotificationManager)).to.be.an.instanceOf(
          NotificationManager,
        );

        expect(crs.get(types.SYMBOLS.IconsGenerator)).to.be.an.instanceOf(
          IconsGenerator,
        );

        expect(
          crs.get(types.SYMBOLS.ProjectAutoDetectionManager),
        ).to.be.an.instanceOf(ProjectAutoDetectionManager);

        expect(
          crs.get(types.SYMBOLS.LanguageResourceManager),
        ).to.be.an.instanceOf(LanguageResourceManager);

        expect(crs.get(types.SYMBOLS.ExtensionManager)).to.be.an.instanceOf(
          ExtensionManager,
        );
      });
    });
  });
});
