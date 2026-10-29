import { expect } from 'chai';
import { cloneDeep } from 'lodash';
import * as sinon from 'sinon';

import { ExtensionManager } from '../../src/app/extensionManager';
import { ConfigManager } from '../../src/configuration/configManager';
import { IconsGenerator, ManifestReader } from '../../src/iconsManifest';
import { NotificationManager } from '../../src/notification/notificationManager';
import { ProjectAutoDetectionManager } from '../../src/pad/projectAutoDetectionManager';
import { SettingsManager } from '../../src/settings/settingsManager';
import * as types from '../../src/types';
import * as enums from '../../src/types/enums';
import { VSCodeManager } from '../../src/vscode/vscodeManager';
import { vsicons } from '../fixtures/vsicons';

describe('ExtensionManagerContract: actions tests', function () {
  context('ensures that', function () {
    let sandbox: sinon.SinonSandbox;
    let vscodeManagerStub: sinon.SinonStubbedInstance<types.VSCodeManagerContract>;
    let configManagerStub: sinon.SinonStubbedInstance<types.ConfigManagerContract>;
    let settingsManagerStub: sinon.SinonStubbedInstance<types.SettingsManagerContract>;
    let notifyManagerStub: sinon.SinonStubbedInstance<types.NotificationManagerContract>;
    let iconsGeneratorStub: sinon.SinonStubbedInstance<types.IconsGeneratorContract>;
    let padMngStub: sinon.SinonStubbedInstance<types.ProjectAutoDetectionManagerContract>;
    let onDidChangeConfigurationStub: sinon.SinonStub;
    let showCustomizationMessageStub: sinon.SinonStub;
    let extensionManager: types.ExtensionManagerContract;
    let vsiconsClone: types.VSIcons;

    const defaultManifest: types.IconManifest = {
      api: types.apiSchema,
      vscode: types.vscodeSchema,
      zed: types.zedSchema,
    };

    beforeEach(function () {
      sandbox = sinon.createSandbox();

      vscodeManagerStub =
        sandbox.createStubInstance<types.VSCodeManagerContract>(VSCodeManager);
      sandbox.stub(vscodeManagerStub, 'context').get(() => ({
        subscriptions: [],
      }));
      onDidChangeConfigurationStub = sandbox.stub();
      sandbox.stub(vscodeManagerStub, 'workspace').get(() => ({
        onDidChangeConfiguration: onDidChangeConfigurationStub,
      }));

      configManagerStub =
        sandbox.createStubInstance<types.ConfigManagerContract>(ConfigManager);
      vsiconsClone = cloneDeep(vsicons);
      sandbox.stub(configManagerStub, 'vsicons').get(() => vsiconsClone);

      settingsManagerStub =
        sandbox.createStubInstance<types.SettingsManagerContract>(
          SettingsManager,
        );
      notifyManagerStub =
        sandbox.createStubInstance<types.NotificationManagerContract>(
          NotificationManager,
        );

      iconsGeneratorStub =
        sandbox.createStubInstance<types.IconsGeneratorContract>(
          IconsGenerator,
        );

      padMngStub =
        sandbox.createStubInstance<types.ProjectAutoDetectionManagerContract>(
          ProjectAutoDetectionManager,
        );

      extensionManager = new ExtensionManager(
        vscodeManagerStub,
        configManagerStub,
        settingsManagerStub,
        notifyManagerStub,
        iconsGeneratorStub,
        padMngStub,
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

      context(`applies the customizations`, function () {
        let projectDetectionResults: types.ProjectDetectionResult[];
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
          it(`when no project detection results exist`, function () {
            applyProjectDetection.call(extensionManager);

            expect(applyCustomizationStub.called).to.be.true;
            expect(showCustomizationMessageStub.called).to.be.false;
          });

          it(`when project detection results apply is 'false'`, function () {
            applyProjectDetection.call(extensionManager, { apply: false });

            expect(applyCustomizationStub.called).to.be.true;
            expect(showCustomizationMessageStub.called).to.be.false;
          });

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
                  enums.LangResourceKeys.reload,
                  enums.LangResourceKeys.autoReload,
                  enums.LangResourceKeys.disableDetect,
                ],
                applyCustomizationStub,
                [projectDetectionResults],
              ),
            ).to.be.true;
          });

          context('by showing a choice message', function () {
            it('when conflicting project icons are detected', function () {
              projectDetectionResults[0].conflictingProjects = [
                enums.Projects.nestjs,
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
            enums.PresetNames.tsOfficial,
            enums.CommandNames.tsPreset,
            false,
            enums.ConfigurationTarget.Global,
          );

          expect(
            showCustomizationMessageStub.calledOnceWithExactly(
              '%s %s',
              [
                enums.LangResourceKeys[
                  `${enums.CommandNames[enums.CommandNames.tsPreset]}Enabled`
                ],
                enums.LangResourceKeys.restart,
                enums.LangResourceKeys.reload,
              ],
              // eslint-disable-next-line @typescript-eslint/unbound-method
              configManagerStub.updatePreset,
              [
                enums.PresetNames[enums.PresetNames.tsOfficial],
                toggledValue,
                enums.ConfigurationTarget.Global,
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
              enums.PresetNames.hideFolders,
              enums.CommandNames.hideFoldersPreset,
              true,
              enums.ConfigurationTarget.Global,
            );

            expect(
              showCustomizationMessageStub.calledOnceWithExactly(
                '%s %s',
                [
                  enums.LangResourceKeys[
                    `${enums.CommandNames[enums.CommandNames.hideFoldersPreset]}Enabled`
                  ],
                  enums.LangResourceKeys.restart,
                  enums.LangResourceKeys.reload,
                ],
                // eslint-disable-next-line @typescript-eslint/unbound-method
                configManagerStub.updatePreset,
                [
                  enums.PresetNames[enums.PresetNames.hideFolders],
                  toggledValue,
                  enums.ConfigurationTarget.Global,
                ],
              ),
            ).to.be.true;
          });

          it(`'Disabled'`, async function () {
            const toggledValue = true;
            getToggledValueStub.resolves(toggledValue);

            await togglePreset.call(
              extensionManager,
              enums.PresetNames.hideFolders,
              enums.CommandNames.hideFoldersPreset,
              true,
              enums.ConfigurationTarget.Global,
            );

            expect(
              showCustomizationMessageStub.calledOnceWithExactly(
                '%s %s',
                [
                  enums.LangResourceKeys[
                    `${enums.CommandNames[enums.CommandNames.hideFoldersPreset]}Disabled`
                  ],
                  enums.LangResourceKeys.restart,
                  enums.LangResourceKeys.reload,
                ],
                // eslint-disable-next-line @typescript-eslint/unbound-method
                configManagerStub.updatePreset,
                [
                  enums.PresetNames[enums.PresetNames.hideFolders],
                  toggledValue,
                  enums.ConfigurationTarget.Global,
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
              enums.PresetNames.jsonOfficial,
              enums.CommandNames.jsonPreset,
              false,
              enums.ConfigurationTarget.Global,
            );

            expect(
              showCustomizationMessageStub.calledOnceWithExactly(
                '%s %s',
                [
                  enums.LangResourceKeys[
                    `${enums.CommandNames[enums.CommandNames.jsonPreset]}Disabled`
                  ],
                  enums.LangResourceKeys.restart,
                  enums.LangResourceKeys.reload,
                ],
                // eslint-disable-next-line @typescript-eslint/unbound-method
                configManagerStub.updatePreset,
                [
                  enums.PresetNames[enums.PresetNames.jsonOfficial],
                  toggledValue,
                  enums.ConfigurationTarget.Global,
                ],
              ),
            ).to.be.true;
          });

          it(`'Enabled'`, async function () {
            const toggledValue = true;
            getToggledValueStub.resolves(toggledValue);

            await togglePreset.call(
              extensionManager,
              enums.PresetNames.jsonOfficial,
              enums.CommandNames.jsonPreset,
              false,
              enums.ConfigurationTarget.Global,
            );

            expect(
              showCustomizationMessageStub.calledOnceWithExactly(
                '%s %s',
                [
                  enums.LangResourceKeys[
                    `${enums.CommandNames[enums.CommandNames.jsonPreset]}Enabled`
                  ],
                  enums.LangResourceKeys.restart,
                  enums.LangResourceKeys.reload,
                ],
                // eslint-disable-next-line @typescript-eslint/unbound-method
                configManagerStub.updatePreset,
                [
                  enums.PresetNames[enums.PresetNames.jsonOfficial],
                  toggledValue,
                  enums.ConfigurationTarget.Global,
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
                  enums.PresetNames.jsOfficial,
                  undefined,
                  false,
                  enums.ConfigurationTarget.Global,
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
                  enums.PresetNames.jsOfficial,
                  undefined,
                  false,
                  enums.ConfigurationTarget.Global,
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
        let files: types.FileCollection;
        let folders: types.FolderCollection;
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
          iconsGeneratorStub.generateIconsManifest.resolves(defaultManifest);
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
          expect(iconsGeneratorStub.persist.calledOnceWith(defaultManifest)).to
            .be.true;
        });

        it(`including the project detection result`, async function () {
          const projectDetectionResults: types.ProjectDetectionResult[] = [
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
            iconsGeneratorStub.persist.calledOnceWithExactly(defaultManifest),
          ).to.be.true;
        });
      });
    });

    context(`restoring the manifest`, function () {
      it(`generates and saves a default icons manifest`, async function () {
        iconsGeneratorStub.generateIconsManifest.resolves(defaultManifest);
        const restoreManifest =
          // @ts-ignore
          extensionManager.restoreManifest as (
            ...arg: unknown[]
          ) => Promise<void>;

        await restoreManifest.call(extensionManager);

        expect(iconsGeneratorStub.generateIconsManifest.calledOnceWithExactly())
          .to.be.true;
        expect(
          iconsGeneratorStub.persist.calledOnceWithExactly(defaultManifest),
        ).to.be.true;
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
