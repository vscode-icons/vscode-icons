// tslint:disable only-arrow-functions
// tslint:disable no-unused-expression
import { expect } from 'chai';
import * as sinon from 'sinon';
import { cloneDeep } from 'lodash';
import * as models from '../../src/models';
import { VSCodeManager } from '../../src/vscode/vscodeManager';
import { ConfigManager } from '../../src/configuration/configManager';
import { SettingsManager } from '../../src/settings/settingsManager';
import { NotificationManager } from '../../src/notification/notificationManager';
import { IconsGenerator, ManifestReader } from '../../src/iconsManifest';
import { ProjectAutoDetectionManager } from '../../src/pad/projectAutoDetectionManager';
import { ExtensionManager } from '../../src/app/extensionManager';
import { vsicons } from '../fixtures/vsicons';

describe('ExtensionManager: actions tests', function () {
  context('ensures that', function () {
    let sandbox: sinon.SinonSandbox;
    let vscodeManagerStub: sinon.SinonStubbedInstance<models.IVSCodeManager>;
    let configManagerStub: sinon.SinonStubbedInstance<models.IConfigManager>;
    let settingsManagerStub: sinon.SinonStubbedInstance<
      models.ISettingsManager
    >;
    let notifyManagerStub: sinon.SinonStubbedInstance<
      models.INotificationManager
    >;
    let iconsGeneratorStub: sinon.SinonStubbedInstance<models.IIconsGenerator>;
    let padMngStub: sinon.SinonStubbedInstance<
      models.IProjectAutoDetectionManager
    >;
    let onDidChangeConfigurationStub: sinon.SinonStub;
    let showCustomizationMessageStub: sinon.SinonStub;
    let extensionManager: models.IExtensionManager;
    let vsiconsClone: models.IVSIcons;

    beforeEach(function () {
      sandbox = sinon.createSandbox();

      vscodeManagerStub = sandbox.createStubInstance<models.IVSCodeManager>(
        VSCodeManager
      );
      sandbox.stub(vscodeManagerStub, 'context').get(() => ({
        subscriptions: [],
      }));
      onDidChangeConfigurationStub = sandbox.stub();
      sandbox.stub(vscodeManagerStub, 'workspace').get(() => ({
        onDidChangeConfiguration: onDidChangeConfigurationStub,
      }));

      configManagerStub = sandbox.createStubInstance<models.IConfigManager>(
        ConfigManager
      );
      vsiconsClone = cloneDeep(vsicons);
      sandbox.stub(configManagerStub, 'vsicons').get(() => vsiconsClone);

      settingsManagerStub = sandbox.createStubInstance<models.ISettingsManager>(
        SettingsManager
      );
      notifyManagerStub = sandbox.createStubInstance<
        models.INotificationManager
      >(NotificationManager);

      iconsGeneratorStub = sandbox.createStubInstance<models.IIconsGenerator>(
        IconsGenerator
      );

      padMngStub = sandbox.createStubInstance<
        models.IProjectAutoDetectionManager
      >(ProjectAutoDetectionManager);

      extensionManager = new ExtensionManager(
        vscodeManagerStub,
        configManagerStub,
        settingsManagerStub,
        notifyManagerStub,
        iconsGeneratorStub,
        padMngStub
      );

      showCustomizationMessageStub = sandbox.stub(
        extensionManager,
        // @ts-ignore
        'showCustomizationMessage'
      );
    });

    afterEach(function () {
      sandbox.restore();
    });

    context(`applying the project detection`, function () {
      let executeAndReloadStub: sinon.SinonStub;

      beforeEach(function () {
        executeAndReloadStub = sandbox.stub(
          extensionManager,
          // @ts-ignore
          'executeAndReload'
        );
      });

      context(`does nothing`, function () {
        it(`when no project detection results exist`, function () {
          // @ts-ignore
          extensionManager.applyProjectDetection();

          expect(executeAndReloadStub.called).to.be.false;
          expect(showCustomizationMessageStub.called).to.be.false;
        });

        it(`when project detection results apply is 'false'`, function () {
          // @ts-ignore
          extensionManager.applyProjectDetection({ apply: false });

          expect(executeAndReloadStub.called).to.be.false;
          expect(showCustomizationMessageStub.called).to.be.false;
        });
      });

      context(`applies the customizations`, function () {
        let projectDetectionResult: models.IProjectDetectionResult;
        let applyCustomizationStub: sinon.SinonStub;

        beforeEach(function () {
          projectDetectionResult = { apply: true };
          applyCustomizationStub = sandbox.stub(
            extensionManager,
            // @ts-ignore
            'applyCustomization'
          );
        });

        context(`automatically`, function () {
          it(`when the 'autoReload' setting is 'true'`, function () {
            configManagerStub.vsicons.projectDetection.autoReload = true;

            // @ts-ignore
            extensionManager.applyProjectDetection(projectDetectionResult);

            expect(
              executeAndReloadStub.calledOnceWithExactly(
                applyCustomizationStub,
                [projectDetectionResult]
              )
            ).to.be.true;
            expect(showCustomizationMessageStub.called).to.be.false;
          });
        });

        context(`by showing a message first`, function () {
          it(`when the 'autoReload' setting is 'false'`, function () {
            configManagerStub.vsicons.projectDetection.autoReload = false;

            // @ts-ignore
            extensionManager.applyProjectDetection(projectDetectionResult);

            expect(executeAndReloadStub.called).to.be.false;
            expect(
              showCustomizationMessageStub.calledOnceWithExactly(
                projectDetectionResult.langResourceKey,
                [
                  models.LangResourceKeys.reload,
                  models.LangResourceKeys.autoReload,
                  models.LangResourceKeys.disableDetect,
                ],
                applyCustomizationStub,
                [projectDetectionResult]
              )
            ).to.be.true;
          });
        });
      });
    });

    context(`toggling the preset`, function () {
      let getToggledValueStub: sinon.SinonStub;

      beforeEach(function () {
        getToggledValueStub = sandbox.stub(ManifestReader, 'getToggledValue');
      });

      context(`shows the customization message`, function () {
        it(`with 'updatePreset' as callback`, function () {
          const toggledValue = true;
          getToggledValueStub.returns(toggledValue);

          // @ts-ignore
          extensionManager.togglePreset(
            models.PresetNames.tsOfficial,
            models.CommandNames.tsPreset,
            false,
            models.ConfigurationTarget.Global
          );

          expect(
            showCustomizationMessageStub.calledOnceWithExactly(
              '%s %s',
              [
                models.LangResourceKeys[
                  `${models.CommandNames[models.CommandNames.tsPreset]}Enabled`
                ],
                models.LangResourceKeys.restart,
                models.LangResourceKeys.reload,
              ],
              configManagerStub.updatePreset,
              [
                models.PresetNames[models.PresetNames.tsOfficial],
                toggledValue,
                models.ConfigurationTarget.Global,
              ]
            )
          ).to.be.true;
        });
      });

      context(`with a reverse action`, function () {
        context(`looks up a language resource key for`, function () {
          it(`'Enabled'`, function () {
            const toggledValue = false;
            getToggledValueStub.returns(toggledValue);

            // @ts-ignore
            extensionManager.togglePreset(
              models.PresetNames.hideFolders,
              models.CommandNames.hideFoldersPreset,
              true,
              models.ConfigurationTarget.Global
            );

            expect(
              showCustomizationMessageStub.calledOnceWithExactly(
                '%s %s',
                [
                  models.LangResourceKeys[
                    `${
                      models.CommandNames[models.CommandNames.hideFoldersPreset]
                    }Enabled`
                  ],
                  models.LangResourceKeys.restart,
                  models.LangResourceKeys.reload,
                ],
                configManagerStub.updatePreset,
                [
                  models.PresetNames[models.PresetNames.hideFolders],
                  toggledValue,
                  models.ConfigurationTarget.Global,
                ]
              )
            ).to.be.true;
          });

          it(`'Disabled'`, function () {
            const toggledValue = true;
            getToggledValueStub.returns(toggledValue);

            // @ts-ignore
            extensionManager.togglePreset(
              models.PresetNames.hideFolders,
              models.CommandNames.hideFoldersPreset,
              true,
              models.ConfigurationTarget.Global
            );

            expect(
              showCustomizationMessageStub.calledOnceWithExactly(
                '%s %s',
                [
                  models.LangResourceKeys[
                    `${
                      models.CommandNames[models.CommandNames.hideFoldersPreset]
                    }Disabled`
                  ],
                  models.LangResourceKeys.restart,
                  models.LangResourceKeys.reload,
                ],
                configManagerStub.updatePreset,
                [
                  models.PresetNames[models.PresetNames.hideFolders],
                  toggledValue,
                  models.ConfigurationTarget.Global,
                ]
              )
            ).to.be.true;
          });
        });
      });

      context(`with a NON reverse action`, function () {
        context(`looks up a language resource key for`, function () {
          it(`'Disabled'`, function () {
            const toggledValue = false;
            getToggledValueStub.returns(toggledValue);

            // @ts-ignore
            extensionManager.togglePreset(
              models.PresetNames.jsonOfficial,
              models.CommandNames.jsonPreset,
              false,
              models.ConfigurationTarget.Global
            );

            expect(
              showCustomizationMessageStub.calledOnceWithExactly(
                '%s %s',
                [
                  models.LangResourceKeys[
                    `${
                      models.CommandNames[models.CommandNames.jsonPreset]
                    }Disabled`
                  ],
                  models.LangResourceKeys.restart,
                  models.LangResourceKeys.reload,
                ],
                configManagerStub.updatePreset,
                [
                  models.PresetNames[models.PresetNames.jsonOfficial],
                  toggledValue,
                  models.ConfigurationTarget.Global,
                ]
              )
            ).to.be.true;
          });

          it(`'Enabled'`, function () {
            const toggledValue = true;
            getToggledValueStub.returns(toggledValue);

            // @ts-ignore
            extensionManager.togglePreset(
              models.PresetNames.jsonOfficial,
              models.CommandNames.jsonPreset,
              false,
              models.ConfigurationTarget.Global
            );

            expect(
              showCustomizationMessageStub.calledOnceWithExactly(
                '%s %s',
                [
                  models.LangResourceKeys[
                    `${
                      models.CommandNames[models.CommandNames.jsonPreset]
                    }Enabled`
                  ],
                  models.LangResourceKeys.restart,
                  models.LangResourceKeys.reload,
                ],
                configManagerStub.updatePreset,
                [
                  models.PresetNames[models.PresetNames.jsonOfficial],
                  toggledValue,
                  models.ConfigurationTarget.Global,
                ]
              )
            ).to.be.true;
          });
        });
      });

      context(`throws an Error`, function () {
        context(`when the action does NOT have`, function () {
          context(`a language resource key for`, function () {
            it(`'Enabled'`, function () {
              getToggledValueStub.returns(true);

              expect(() =>
                // @ts-ignore
                extensionManager.togglePreset(
                  models.PresetNames.jsOfficial,
                  undefined,
                  false,
                  models.ConfigurationTarget.Global
                )
              ).to.throw(Error, /undefinedEnabled is not valid/);
            });

            it(`'Disabled'`, function () {
              getToggledValueStub.returns(false);

              expect(() =>
                // @ts-ignore
                extensionManager.togglePreset(
                  models.PresetNames.jsOfficial,
                  undefined,
                  false,
                  models.ConfigurationTarget.Global
                )
              ).to.throw(Error, /undefinedDisabled is not valid/);
            });
          });
        });
      });
    });

    context(`applying the customization`, function () {
      context(`generates and saves an icons manifest`, function () {
        let files: models.IFileCollection;
        let folders: models.IFolderCollection;

        beforeEach(function () {
          const associations = configManagerStub.vsicons.associations;
          files = {
            default: associations.fileDefault,
            supported: associations.files,
          };
          folders = {
            default: associations.folderDefault,
            supported: associations.folders,
          };
          iconsGeneratorStub.generateIconsManifest.returns(models.schema);
        });

        it(`without a project detection result`, function () {
          // @ts-ignore
          extensionManager.applyCustomization();

          expect(
            iconsGeneratorStub.generateIconsManifest.calledOnceWithExactly(
              files,
              folders,
              undefined
            )
          ).to.be.true;
          expect(
            iconsGeneratorStub.persist.calledOnceWith(models.schema)
          ).to.be.true;
        });

        it(`including the project detection result`, function () {
          const projectDetectionResult: models.IProjectDetectionResult = {
            apply: true,
          };

          // @ts-ignore
          extensionManager.applyCustomization(projectDetectionResult);

          expect(
            iconsGeneratorStub.generateIconsManifest.calledOnceWithExactly(
              files,
              folders,
              projectDetectionResult
            )
          ).to.be.true;
          expect(
            iconsGeneratorStub.persist.calledOnceWithExactly(models.schema)
          ).to.be.true;
        });
      });
    });

    context(`restoring the manifest`, function () {
      it(`generates and saves a default icons manifest`, function () {
        iconsGeneratorStub.generateIconsManifest.returns(models.schema);

        // @ts-ignore
        extensionManager.restoreManifest();

        expect(
          iconsGeneratorStub.generateIconsManifest.calledOnceWithExactly()
        ).to.be.true;
        expect(
          iconsGeneratorStub.persist.calledOnceWithExactly(models.schema)
        ).to.be.true;
      });
    });

    context(`reseting the project detection defaults`, function () {
      context(`when 'autoReload' setting is`, function () {
        it(`'true', resets it to 'false'`, function () {
          configManagerStub.vsicons.projectDetection.autoReload = true;

          // @ts-ignore
          extensionManager.resetProjectDetectionDefaults();

          expect(
            configManagerStub.updateAutoReload.calledOnceWithExactly(false)
          ).to.be.true;
          expect(configManagerStub.updateDisableDetection.called).to.be.false;
        });

        it(`'false', does nothing`, function () {
          configManagerStub.vsicons.projectDetection.autoReload = false;

          // @ts-ignore
          extensionManager.resetProjectDetectionDefaults();

          expect(configManagerStub.updateAutoReload.called).to.be.false;
          expect(configManagerStub.updateDisableDetection.called).to.be.false;
        });
      });

      context(`when 'disableDetect' setting is`, function () {
        it(`'true', resets it to 'false'`, function () {
          configManagerStub.vsicons.projectDetection.disableDetect = true;

          // @ts-ignore
          extensionManager.resetProjectDetectionDefaults();

          expect(
            configManagerStub.updateDisableDetection.calledOnceWithExactly(
              false
            )
          ).to.be.true;
          expect(configManagerStub.updateAutoReload.called).to.be.false;
        });

        it(`'false', does nothing`, function () {
          configManagerStub.vsicons.projectDetection.disableDetect = false;

          // @ts-ignore
          extensionManager.resetProjectDetectionDefaults();

          expect(configManagerStub.updateAutoReload.called).to.be.false;
          expect(configManagerStub.updateDisableDetection.called).to.be.false;
        });
      });
    });
  });
});
