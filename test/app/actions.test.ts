/* eslint-disable prefer-arrow-callback */
/* eslint-disable no-unused-expressions */
import { expect } from 'chai';
import { cloneDeep } from 'lodash';
import * as sinon from 'sinon';
import { ExtensionManager } from '../../src/app/extensionManager';
import { ConfigManager } from '../../src/configuration/configManager';
import { IconsGenerator, ManifestReader } from '../../src/iconsManifest';
import { IntegrityManager } from '../../src/integrity/integrityManager';
import * as models from '../../src/models';
import { NotificationManager } from '../../src/notification/notificationManager';
import { ProjectAutoDetectionManager } from '../../src/pad/projectAutoDetectionManager';
import { SettingsManager } from '../../src/settings/settingsManager';
import { VSCodeManager } from '../../src/vscode/vscodeManager';
import { vsicons } from '../fixtures/vsicons';

describe('ExtensionManager: actions tests', function () {
  context('ensures that', function () {
    let sandbox: sinon.SinonSandbox;
    let vscodeManagerStub: sinon.SinonStubbedInstance<models.IVSCodeManager>;
    let configManagerStub: sinon.SinonStubbedInstance<models.IConfigManager>;
    let settingsManagerStub: sinon.SinonStubbedInstance<models.ISettingsManager>;
    let notifyManagerStub: sinon.SinonStubbedInstance<models.INotificationManager>;
    let iconsGeneratorStub: sinon.SinonStubbedInstance<models.IIconsGenerator>;
    let padMngStub: sinon.SinonStubbedInstance<models.IProjectAutoDetectionManager>;
    let integrityManagerStub: sinon.SinonStubbedInstance<models.IIntegrityManager>;
    let onDidChangeConfigurationStub: sinon.SinonStub;
    let showCustomizationMessageStub: sinon.SinonStub;
    let extensionManager: models.IExtensionManager;
    let vsiconsClone: models.IVSIcons;

    beforeEach(function () {
      sandbox = sinon.createSandbox();

      vscodeManagerStub =
        sandbox.createStubInstance<models.IVSCodeManager>(VSCodeManager);
      sandbox.stub(vscodeManagerStub, 'context').get(() => ({
        subscriptions: [],
      }));
      onDidChangeConfigurationStub = sandbox.stub();
      sandbox.stub(vscodeManagerStub, 'workspace').get(() => ({
        onDidChangeConfiguration: onDidChangeConfigurationStub,
      }));

      configManagerStub =
        sandbox.createStubInstance<models.IConfigManager>(ConfigManager);
      vsiconsClone = cloneDeep(vsicons);
      sandbox.stub(configManagerStub, 'vsicons').get(() => vsiconsClone);

      settingsManagerStub =
        sandbox.createStubInstance<models.ISettingsManager>(SettingsManager);
      notifyManagerStub =
        sandbox.createStubInstance<models.INotificationManager>(
          NotificationManager,
        );

      iconsGeneratorStub =
        sandbox.createStubInstance<models.IIconsGenerator>(IconsGenerator);

      padMngStub =
        sandbox.createStubInstance<models.IProjectAutoDetectionManager>(
          ProjectAutoDetectionManager,
        );

      integrityManagerStub =
        sandbox.createStubInstance<models.IIntegrityManager>(IntegrityManager);

      extensionManager = new ExtensionManager(
        vscodeManagerStub,
        configManagerStub,
        settingsManagerStub,
        notifyManagerStub,
        iconsGeneratorStub,
        padMngStub,
        integrityManagerStub,
      );

      showCustomizationMessageStub = sandbox.stub(
        extensionManager,
        // @ts-ignore
        'showCustomizationMessage',
      );
    });

    afterEach(function () {
      sandbox.restore();
    });

    context(`applying the project detection`, function () {
      let executeAndReloadStub: sinon.SinonStub;
      let applyProjectDetection: (...arg: unknown[]) => void;

      beforeEach(function () {
        executeAndReloadStub = sandbox.stub(
          extensionManager,
          // @ts-ignore
          'executeAndReload',
        );
        applyProjectDetection =
          // @ts-ignore
          extensionManager.applyProjectDetection as (...arg: unknown[]) => void;
      });

      context(`does nothing`, function () {
        it(`when no project detection results exist`, function () {
          applyProjectDetection.call(extensionManager);

          expect(executeAndReloadStub.called).to.be.false;
          expect(showCustomizationMessageStub.called).to.be.false;
        });

        it(`when project detection results apply is 'false'`, function () {
          applyProjectDetection.call(extensionManager, { apply: false });

          expect(executeAndReloadStub.called).to.be.false;
          expect(showCustomizationMessageStub.called).to.be.false;
        });
      });

      context(`applies the customizations`, function () {
        let projectDetectionResults: models.IProjectDetectionResult[];
        let applyCustomizationStub: sinon.SinonStub;

        beforeEach(function () {
          projectDetectionResults = [{ apply: true }];
          applyCustomizationStub = sandbox.stub(
            extensionManager,
            // @ts-ignore
            'applyCustomization',
          );
        });

        context(`automatically`, function () {
          it(`when the 'autoReload' setting is 'true'`, function () {
            configManagerStub.vsicons.projectDetection.autoReload = true;

            applyProjectDetection.call(
              extensionManager,
              projectDetectionResults,
            );

            expect(
              executeAndReloadStub.calledOnceWithExactly(
                applyCustomizationStub,
                [projectDetectionResults],
              ),
            ).to.be.true;
            expect(showCustomizationMessageStub.called).to.be.false;
          });
        });

        context(`by showing a message first`, function () {
          it(`when the 'autoReload' setting is 'false'`, function () {
            configManagerStub.vsicons.projectDetection.autoReload = false;

            applyProjectDetection.call(
              extensionManager,
              projectDetectionResults,
            );

            expect(executeAndReloadStub.called).to.be.false;
            expect(
              showCustomizationMessageStub.calledOnceWithExactly(
                projectDetectionResults[0].langResourceKey,
                [
                  models.LangResourceKeys.reload,
                  models.LangResourceKeys.autoReload,
                  models.LangResourceKeys.disableDetect,
                ],
                applyCustomizationStub,
                [projectDetectionResults],
              ),
            ).to.be.true;
          });

          context('by showing a choice message', function () {
            it('when conflicting project icons are detected', function () {
              projectDetectionResults[0].conflictingProjects = [
                models.Projects.nestjs,
              ];

              applyProjectDetection.call(
                extensionManager,
                projectDetectionResults,
              );

              expect(executeAndReloadStub.called).to.be.false;
              expect(
                showCustomizationMessageStub.calledOnceWithExactly(
                  projectDetectionResults[0].langResourceKey,
                  [undefined, 'NestJS'],
                  applyCustomizationStub,
                  [projectDetectionResults],
                ),
              ).to.be.true;
            });
          });
        });
      });
    });

    context(`toggling the preset`, function () {
      let getToggledValueStub: sinon.SinonStub;
      let togglePreset: (...arg: unknown[]) => Promise<void>;

      beforeEach(function () {
        getToggledValueStub = sandbox.stub(ManifestReader, 'getToggledValue');
        togglePreset =
          // @ts-ignore
          extensionManager.togglePreset as (...arg: unknown[]) => Promise<void>;
      });

      context(`shows the customization message`, function () {
        it(`with 'updatePreset' as callback`, async function () {
          const toggledValue = true;
          getToggledValueStub.resolves(toggledValue);

          await togglePreset.call(
            extensionManager,
            models.PresetNames.tsOfficial,
            models.CommandNames.tsPreset,
            false,
            models.ConfigurationTarget.Global,
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
              // eslint-disable-next-line @typescript-eslint/unbound-method
              configManagerStub.updatePreset,
              [
                models.PresetNames[models.PresetNames.tsOfficial],
                toggledValue,
                models.ConfigurationTarget.Global,
              ],
            ),
          ).to.be.true;
        });
      });

      context(`with a reverse action`, function () {
        context(`looks up a language resource key for`, function () {
          it(`'Enabled'`, async function () {
            const toggledValue = false;
            getToggledValueStub.resolves(toggledValue);

            await togglePreset.call(
              extensionManager,
              models.PresetNames.hideFolders,
              models.CommandNames.hideFoldersPreset,
              true,
              models.ConfigurationTarget.Global,
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
                // eslint-disable-next-line @typescript-eslint/unbound-method
                configManagerStub.updatePreset,
                [
                  models.PresetNames[models.PresetNames.hideFolders],
                  toggledValue,
                  models.ConfigurationTarget.Global,
                ],
              ),
            ).to.be.true;
          });

          it(`'Disabled'`, async function () {
            const toggledValue = true;
            getToggledValueStub.resolves(toggledValue);

            await togglePreset.call(
              extensionManager,
              models.PresetNames.hideFolders,
              models.CommandNames.hideFoldersPreset,
              true,
              models.ConfigurationTarget.Global,
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
                // eslint-disable-next-line @typescript-eslint/unbound-method
                configManagerStub.updatePreset,
                [
                  models.PresetNames[models.PresetNames.hideFolders],
                  toggledValue,
                  models.ConfigurationTarget.Global,
                ],
              ),
            ).to.be.true;
          });
        });
      });

      context(`with a NON reverse action`, function () {
        context(`looks up a language resource key for`, function () {
          it(`'Disabled'`, async function () {
            const toggledValue = false;
            getToggledValueStub.resolves(toggledValue);

            await togglePreset.call(
              extensionManager,
              models.PresetNames.jsonOfficial,
              models.CommandNames.jsonPreset,
              false,
              models.ConfigurationTarget.Global,
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
                // eslint-disable-next-line @typescript-eslint/unbound-method
                configManagerStub.updatePreset,
                [
                  models.PresetNames[models.PresetNames.jsonOfficial],
                  toggledValue,
                  models.ConfigurationTarget.Global,
                ],
              ),
            ).to.be.true;
          });

          it(`'Enabled'`, async function () {
            const toggledValue = true;
            getToggledValueStub.resolves(toggledValue);

            await togglePreset.call(
              extensionManager,
              models.PresetNames.jsonOfficial,
              models.CommandNames.jsonPreset,
              false,
              models.ConfigurationTarget.Global,
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
                // eslint-disable-next-line @typescript-eslint/unbound-method
                configManagerStub.updatePreset,
                [
                  models.PresetNames[models.PresetNames.jsonOfficial],
                  toggledValue,
                  models.ConfigurationTarget.Global,
                ],
              ),
            ).to.be.true;
          });
        });
      });

      context(`throws an Error`, function () {
        context(`when the action does NOT have`, function () {
          context(`a language resource key for`, function () {
            it(`'Enabled'`, async function () {
              getToggledValueStub.resolves(true);

              try {
                await togglePreset.call(
                  extensionManager,
                  models.PresetNames.jsOfficial,
                  undefined,
                  false,
                  models.ConfigurationTarget.Global,
                );
              } catch (error) {
                expect(error).to.match(/undefinedEnabled is not valid/);
              }
            });

            it(`'Disabled'`, async function () {
              getToggledValueStub.resolves(false);

              try {
                await togglePreset.call(
                  extensionManager,
                  models.PresetNames.jsOfficial,
                  undefined,
                  false,
                  models.ConfigurationTarget.Global,
                );
              } catch (error) {
                expect(error).to.match(/undefinedDisabled is not valid/);
              }
            });
          });
        });
      });
    });

    context(`applying the customization`, function () {
      context(`generates and saves an icons manifest`, function () {
        let files: models.IFileCollection;
        let folders: models.IFolderCollection;
        let applyCustomization: (...arg: unknown[]) => Promise<void>;

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
          iconsGeneratorStub.generateIconsManifest.resolves(models.schema);
          applyCustomization =
            // @ts-ignore
            extensionManager.applyCustomization as (
              ...arg: unknown[]
            ) => Promise<void>;
        });

        it(`without a project detection result`, async function () {
          await applyCustomization.call(extensionManager);

          expect(
            iconsGeneratorStub.generateIconsManifest.calledOnceWithExactly(
              files,
              folders,
              undefined,
            ),
          ).to.be.true;
          expect(iconsGeneratorStub.persist.calledOnceWith(models.schema)).to.be
            .true;
        });

        it(`including the project detection result`, async function () {
          const projectDetectionResults: models.IProjectDetectionResult[] = [
            {
              apply: true,
            },
          ];

          await applyCustomization.call(
            extensionManager,
            projectDetectionResults,
          );

          expect(
            iconsGeneratorStub.generateIconsManifest.calledOnceWithExactly(
              files,
              folders,
              projectDetectionResults,
            ),
          ).to.be.true;
          expect(
            iconsGeneratorStub.persist.calledOnceWithExactly(models.schema),
          ).to.be.true;
        });
      });
    });

    context(`restoring the manifest`, function () {
      it(`generates and saves a default icons manifest`, async function () {
        iconsGeneratorStub.generateIconsManifest.resolves(models.schema);
        const restoreManifest =
          // @ts-ignore
          extensionManager.restoreManifest as (
            ...arg: unknown[]
          ) => Promise<void>;

        await restoreManifest.call(extensionManager);

        expect(iconsGeneratorStub.generateIconsManifest.calledOnceWithExactly())
          .to.be.true;
        expect(iconsGeneratorStub.persist.calledOnceWithExactly(models.schema))
          .to.be.true;
      });
    });

    context(`reseting the project detection defaults`, function () {
      let resetProjectDetectionDefaults: () => void;

      beforeEach(function () {
        resetProjectDetectionDefaults =
          // @ts-ignore
          extensionManager.resetProjectDetectionDefaults as () => void;
      });

      context(`when 'autoReload' setting is`, function () {
        it(`'true', resets it to 'false'`, function () {
          configManagerStub.vsicons.projectDetection.autoReload = true;

          resetProjectDetectionDefaults.call(extensionManager);

          expect(
            configManagerStub.updateAutoReload.calledOnceWithExactly(false),
          ).to.be.true;
          expect(configManagerStub.updateDisableDetection.called).to.be.false;
        });

        it(`'false', does nothing`, function () {
          configManagerStub.vsicons.projectDetection.autoReload = false;

          resetProjectDetectionDefaults.call(extensionManager);

          expect(configManagerStub.updateAutoReload.called).to.be.false;
          expect(configManagerStub.updateDisableDetection.called).to.be.false;
        });
      });

      context(`when 'disableDetect' setting is`, function () {
        it(`'true', resets it to 'false'`, function () {
          configManagerStub.vsicons.projectDetection.disableDetect = true;

          resetProjectDetectionDefaults.call(extensionManager);

          expect(
            configManagerStub.updateDisableDetection.calledOnceWithExactly(
              false,
            ),
          ).to.be.true;
          expect(configManagerStub.updateAutoReload.called).to.be.false;
        });

        it(`'false', does nothing`, function () {
          configManagerStub.vsicons.projectDetection.disableDetect = false;

          resetProjectDetectionDefaults.call(extensionManager);

          expect(configManagerStub.updateAutoReload.called).to.be.false;
          expect(configManagerStub.updateDisableDetection.called).to.be.false;
        });
      });
    });
  });
});
