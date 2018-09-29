// tslint:disable only-arrow-functions
// tslint:disable no-unused-expression
import { expect } from 'chai';
import * as sinon from 'sinon';
import * as proxyq from 'proxyquire';
import * as models from '../../src/models';
import { VSCodeManager } from '../../src/vscode/vscodeManager';
import { ConfigManager } from '../../src/configuration/configManager';
import { SettingsManager } from '../../src/settings/settingsManager';
import { LanguageResourceManager } from '../../src/i18n/languageResourceManager';
import { langResourceCollection } from '../../src/i18n/langResourceCollection';
import { NotificationManager } from '../../src/notification/notificationManager';
import { IconsGenerator } from '../../src/iconsManifest';
import { ProjectAutoDetectionManager } from '../../src/pad/projectAutoDetectionManager';
import { ExtensionManager } from '../../src/app/extensionManager';
import { context as extensionContext } from '../fixtures/extensionContext';
import { vscode } from '../fixtures/vscode';

describe('CompositionRootService: tests', function () {
  context('ensures that', function () {
    let sandbox: sinon.SinonSandbox;
    let vscodeManagerStub: sinon.SinonStubbedInstance<models.IVSCodeManager>;
    let configManagerStub: sinon.SinonStubbedInstance<models.IConfigManager>;
    let settingsManagerStub: sinon.SinonStubbedInstance<
      models.ISettingsManager
    >;
    let languageResourceManagerStub: sinon.SinonStubbedInstance<
      models.ILanguageResourceManager
    >;
    let notifyManagerStub: sinon.SinonStubbedInstance<
      models.INotificationManager
    >;
    let iconsGeneratorStub: sinon.SinonStubbedInstance<models.IIconsGenerator>;
    let padMngStub: sinon.SinonStubbedInstance<
      models.IProjectAutoDetectionManager
    >;
    let extensionManagerStub: sinon.SinonStubbedInstance<
      models.IExtensionManager
    >;
    let bindStub: sinon.SinonStub;
    let CompositionRootService: any;

    before(function () {
      proxyq.noCallThru();
      CompositionRootService = proxyq(
        '../../src/services/compositionRootService',
        { vscode }
      ).CompositionRootService;
    });

    after(function () {
      proxyq.callThru();
    });

    beforeEach(function () {
      sandbox = sinon.createSandbox();

      vscodeManagerStub = sandbox.createStubInstance<models.IVSCodeManager>(
        VSCodeManager
      );

      configManagerStub = sandbox.createStubInstance<models.IConfigManager>(
        ConfigManager
      );

      settingsManagerStub = sandbox.createStubInstance<models.ISettingsManager>(
        SettingsManager
      );

      languageResourceManagerStub = sandbox.createStubInstance<
        models.ILanguageResourceManager
      >(LanguageResourceManager);

      notifyManagerStub = sandbox.createStubInstance<
        models.INotificationManager
      >(NotificationManager);

      iconsGeneratorStub = sandbox.createStubInstance<models.IIconsGenerator>(
        IconsGenerator
      );

      padMngStub = sandbox.createStubInstance<
        models.IProjectAutoDetectionManager
      >(ProjectAutoDetectionManager);

      extensionManagerStub = sandbox.createStubInstance<
        models.IExtensionManager
      >(ExtensionManager);
    });

    afterEach(function () {
      sandbox.restore();
    });

    context(`getting an object`, function () {
      context(`throws an Error`, function () {
        it(`when it can NOT be found`, function () {
          sandbox.stub(Reflect, 'construct').returns(vscodeManagerStub);
          const crs = new CompositionRootService(extensionContext);

          expect(() => crs.get('Interface')).to.throw(
            Error,
            /Object not found for: Interface/
          );
        });
      });

      it(`returns that object`, function () {
        sandbox.stub(Reflect, 'construct').returns(vscodeManagerStub);
        const crs = new CompositionRootService(extensionContext);

        expect(crs.get(models.SYMBOLS.IVSCodeManager)).to.be.an.instanceOf(
          VSCodeManager
        );
      });
    });

    context(`binding an object`, function () {
      context(`throws an Error`, function () {
        it(`when an identifier is NOT provided`, function () {
          expect(() => new CompositionRootService().bind()).to.throw(
            ReferenceError
          );
        });
      });

      context(`returns a new object`, function () {
        it(`and adds it to the container`, function () {
          sandbox.stub(Reflect, 'construct').returns(vscodeManagerStub);

          const crs = new CompositionRootService();

          expect(
            crs.bind(
              models.SYMBOLS.IVSCodeManager,
              VSCodeManager,
              vscode,
              extensionContext
            )
          ).to.be.an.instanceOf(VSCodeManager);
          expect(crs.container).to.have.lengthOf(1);
        });
      });
    });

    context(`registering`, function () {
      context(`correctly binds`, function () {
        let crs: any;

        beforeEach(function () {
          crs = new CompositionRootService();
          bindStub = sandbox.stub(crs, 'bind');
        });

        it(`'vscodeManager'`, function () {
          bindStub.onCall(0).returns(vscodeManagerStub);

          crs.register(extensionContext);

          expect(
            bindStub
              .getCall(0)
              .calledWithExactly(
                models.SYMBOLS.IVSCodeManager,
                VSCodeManager,
                vscode,
                extensionContext
              )
          ).to.be.true;
        });

        it(`'configManager'`, function () {
          bindStub
            .onCall(0)
            .returns(vscodeManagerStub)
            .onCall(1)
            .returns(configManagerStub);

          crs.register(extensionContext);

          expect(
            bindStub
              .getCall(1)
              .calledWithExactly(
                models.SYMBOLS.IConfigManager,
                ConfigManager,
                vscodeManagerStub
              )
          ).to.be.true;
        });

        it(`settingsManager'`, function () {
          bindStub
            .onCall(0)
            .returns(vscodeManagerStub)
            .onCall(2)
            .returns(settingsManagerStub);

          crs.register(extensionContext);

          expect(
            bindStub
              .getCall(2)
              .calledWithExactly(
                models.SYMBOLS.ISettingsManager,
                SettingsManager,
                vscodeManagerStub
              )
          ).to.be.true;
        });

        it(`'iconGenerator'`, function () {
          bindStub
            .onCall(0)
            .returns(vscodeManagerStub)
            .onCall(1)
            .returns(configManagerStub)
            .onCall(3)
            .returns(iconsGeneratorStub);

          crs.register(extensionContext);

          expect(
            bindStub
              .getCall(3)
              .calledWithExactly(
                models.SYMBOLS.IIconsGenerator,
                IconsGenerator,
                vscodeManagerStub,
                configManagerStub
              )
          ).to.be.true;
        });

        it(`'languageResourceManager'`, function () {
          bindStub.onCall(4).returns(languageResourceManagerStub);

          crs.register(extensionContext);

          expect(
            bindStub
              .getCall(4)
              .calledWithExactly(
                models.SYMBOLS.ILanguageResourceManager,
                LanguageResourceManager,
                langResourceCollection[vscode.env.language]
              )
          ).to.be.true;
        });

        it(`'notificationManager'`, function () {
          bindStub
            .onCall(0)
            .returns(vscodeManagerStub)
            .onCall(4)
            .returns(languageResourceManagerStub)
            .onCall(5)
            .returns(notifyManagerStub);

          crs.register(extensionContext);

          expect(
            bindStub
              .getCall(5)
              .calledWithExactly(
                models.SYMBOLS.INotificationManager,
                NotificationManager,
                vscodeManagerStub,
                languageResourceManagerStub
              )
          ).to.be.true;
        });

        it(`'projectAutoDetectionManager'`, function () {
          bindStub
            .onCall(0)
            .returns(vscodeManagerStub)
            .onCall(1)
            .returns(configManagerStub)
            .onCall(6)
            .returns(padMngStub);

          crs.register(extensionContext);

          expect(
            bindStub
              .getCall(6)
              .calledWithExactly(
                models.SYMBOLS.IProjectAutoDetectionManager,
                ProjectAutoDetectionManager,
                vscodeManagerStub,
                configManagerStub
              )
          ).to.be.true;
        });

        it(`'extensionManager'`, function () {
          bindStub
            .onCall(0)
            .returns(vscodeManagerStub)
            .onCall(1)
            .returns(configManagerStub)
            .onCall(2)
            .returns(settingsManagerStub)
            .onCall(3)
            .returns(iconsGeneratorStub)
            .onCall(5)
            .returns(notifyManagerStub)
            .onCall(6)
            .returns(padMngStub)
            .onCall(7)
            .returns(extensionManagerStub);

          crs.register(extensionContext);

          expect(
            bindStub
              .getCall(7)
              .calledWithExactly(
                models.SYMBOLS.IExtensionManager,
                ExtensionManager,
                vscodeManagerStub,
                configManagerStub,
                settingsManagerStub,
                notifyManagerStub,
                iconsGeneratorStub,
                padMngStub
              )
          ).to.be.true;
        });
      });
    });
  });
});
