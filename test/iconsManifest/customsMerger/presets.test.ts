/* eslint-disable prefer-arrow-callback */
/* eslint-disable no-unused-expressions */
import { expect } from 'chai';
import * as sinon from 'sinon';
import { CustomsMerger, ManifestReader } from '../../../src/iconsManifest';
import {
  IconNames,
  IFileExtension,
  IFolderCollection,
  IPresets,
  IProjectDetectionResult,
  Projects,
} from '../../../src/models';
import { extensions as extFiles } from '../../fixtures/supportedExtensions';
import { extensions as extFolders } from '../../fixtures/supportedFolders';
import { vsicons } from '../../fixtures/vsicons';

describe('CustomsMerger: toggle presets tests', function () {
  context('ensures that', function () {
    let sandbox: sinon.SinonSandbox;
    let iconsDisabledStub: sinon.SinonStub;

    beforeEach(function () {
      sandbox = sinon.createSandbox();

      iconsDisabledStub = sandbox.stub(ManifestReader, 'iconsDisabled');
      vsicons.presets.foldersAllDefaultIcon = false;
      vsicons.presets.hideFolders = false;
    });

    afterEach(function () {
      sandbox.restore();
    });

    context(`'Angular' icons can be`, function () {
      const regex = /^ng_.*\D$/;
      it('enabled and disabled', async function () {
        const toggle = async (enable: boolean): Promise<IFileExtension[]> => {
          vsicons.presets.angular = enable;
          const mergedCollection = await CustomsMerger.merge(
            null,
            extFiles,
            null,
            extFolders,
            vsicons.presets,
          );
          return mergedCollection.files.supported.filter(
            (file: IFileExtension) => regex.test(file.icon),
          );
        };

        // Set Angular icons as enabled
        let defs = await toggle(true);

        defs.forEach((def: IFileExtension) => expect(def.disabled).to.be.false);

        // Set Angular icons as disabled
        defs = await toggle(false);

        defs.forEach((def: IFileExtension) => expect(def.disabled).to.be.true);
      });

      it(`preserved, if enabled by PAD, when toggling any preset`, async function () {
        const toggle = async (
          enable: boolean,
          padResults: IProjectDetectionResult[],
          affectPresets?: IPresets,
        ): Promise<Record<string, IFileExtension[]>> => {
          vsicons.presets.jsOfficial = enable;
          const { files } = await CustomsMerger.merge(
            null,
            extFiles,
            null,
            extFolders,
            vsicons.presets,
            padResults,
            affectPresets,
          );

          return {
            ngDefs: files.supported.filter((file: IFileExtension) =>
              regex.test(file.icon),
            ),
            jsDefs: files.supported.filter(
              (file: IFileExtension) => file.icon === IconNames.js.toString(),
            ),
            officialJSDefs: files.supported.filter(
              (file: IFileExtension) =>
                file.icon === IconNames.jsOfficial.toString(),
            ),
          };
        };

        // Angular icons get enabled by PAD
        let icons = await toggle(false, [
          {
            apply: true,
            project: Projects.angular,
            value: true,
          },
        ]);

        icons.jsDefs.forEach(
          (def: IFileExtension) => expect(def.disabled).to.be.false,
        );
        icons.officialJSDefs.forEach(
          (def: IFileExtension) => expect(def.disabled).to.be.true,
        );
        icons.ngDefs.forEach(
          (def: IFileExtension) => expect(def.disabled).to.be.false,
        );

        // Angular icons are enabled
        iconsDisabledStub.resolves(false);

        // User toggles to enable JS Official icons
        icons = await toggle(true, undefined, { angular: false } as IPresets);

        icons.jsDefs.forEach(
          (def: IFileExtension) => expect(def.disabled).to.be.true,
        );
        icons.officialJSDefs.forEach(
          (def: IFileExtension) => expect(def.disabled).to.be.false,
        );
        icons.ngDefs.forEach(
          (def: IFileExtension) => expect(def.disabled).to.be.false,
        );

        // User toggles to disable JS Official icons
        icons = await toggle(false, undefined, { angular: false } as IPresets);

        icons.jsDefs.forEach(
          (def: IFileExtension) => expect(def.disabled).to.be.false,
        );
        icons.officialJSDefs.forEach(
          (def: IFileExtension) => expect(def.disabled).to.be.true,
        );
        icons.ngDefs.forEach(
          (def: IFileExtension) => expect(def.disabled).to.be.false,
        );
      });

      it(`disabled, when no 'Angular' project is detected by PAD`, async function () {
        const defs = (
          await CustomsMerger.merge(
            null,
            extFiles,
            null,
            extFolders,
            vsicons.presets,
            [
              {
                apply: false,
              },
            ],
          )
        ).files.supported.filter((file: IFileExtension) =>
          regex.test(file.icon),
        );

        defs.forEach((def: IFileExtension) => expect(def.disabled).to.be.true);
      });

      it(`enabled, when an 'Angular' project is detected by PAD`, async function () {
        const defs = (
          await CustomsMerger.merge(
            null,
            extFiles,
            null,
            extFolders,
            vsicons.presets,
            [
              {
                apply: true,
                project: Projects.angular,
                value: true,
              },
            ],
          )
        ).files.supported.filter((file: IFileExtension) =>
          regex.test(file.icon),
        );

        defs.forEach((def: IFileExtension) => expect(def.disabled).to.be.false);
      });
    });

    context(`'NestJS' icons can be`, function () {
      const regex = /^nest_.*\D$/;
      it('enabled and disabled', async function () {
        const toggle = async (enable: boolean): Promise<IFileExtension[]> => {
          vsicons.presets.nestjs = enable;
          const mergedCollection = await CustomsMerger.merge(
            null,
            extFiles,
            null,
            extFolders,
            vsicons.presets,
          );
          return mergedCollection.files.supported.filter(
            (file: IFileExtension) => regex.test(file.icon),
          );
        };

        // Set Angular icons as enabled
        let defs = await toggle(true);

        defs.forEach((def: IFileExtension) => expect(def.disabled).to.be.false);

        // Set Angular icons as disabled
        defs = await toggle(false);

        defs.forEach((def: IFileExtension) => expect(def.disabled).to.be.true);
      });

      it(`preserved, if enabled by PAD, when toggling any preset`, async function () {
        const toggle = async (
          enable: boolean,
          padResult: IProjectDetectionResult[],
          affectPresets?: IPresets,
        ): Promise<Record<string, IFileExtension[]>> => {
          vsicons.presets.jsOfficial = enable;
          const { files } = await CustomsMerger.merge(
            null,
            extFiles,
            null,
            extFolders,
            vsicons.presets,
            padResult,
            affectPresets,
          );

          return {
            ngDefs: files.supported.filter((file: IFileExtension) =>
              regex.test(file.icon),
            ),
            jsDefs: files.supported.filter(
              (file: IFileExtension) => file.icon === IconNames.js.toString(),
            ),
            officialJSDefs: files.supported.filter(
              (file: IFileExtension) =>
                file.icon === IconNames.jsOfficial.toString(),
            ),
          };
        };

        // NestJS icons get enabled by PAD
        let icons = await toggle(false, [
          {
            apply: true,
            project: Projects.nestjs,
            value: true,
          },
        ]);

        icons.jsDefs.forEach(
          (def: IFileExtension) => expect(def.disabled).to.be.false,
        );
        icons.officialJSDefs.forEach(
          (def: IFileExtension) => expect(def.disabled).to.be.true,
        );
        icons.ngDefs.forEach(
          (def: IFileExtension) => expect(def.disabled).to.be.false,
        );

        // Angular icons are enabled
        iconsDisabledStub.resolves(false);

        // User toggles to enable JS Official icons
        icons = await toggle(true, undefined, { nestjs: false } as IPresets);

        icons.jsDefs.forEach(
          (def: IFileExtension) => expect(def.disabled).to.be.true,
        );
        icons.officialJSDefs.forEach(
          (def: IFileExtension) => expect(def.disabled).to.be.false,
        );
        icons.ngDefs.forEach(
          (def: IFileExtension) => expect(def.disabled).to.be.false,
        );

        // User toggles to disable JS Official icons
        icons = await toggle(false, undefined, { nestjs: false } as IPresets);

        icons.jsDefs.forEach(
          (def: IFileExtension) => expect(def.disabled).to.be.false,
        );
        icons.officialJSDefs.forEach(
          (def: IFileExtension) => expect(def.disabled).to.be.true,
        );
        icons.ngDefs.forEach(
          (def: IFileExtension) => expect(def.disabled).to.be.false,
        );
      });

      it(`disabled, when no 'NestJS' project is detected by PAD`, async function () {
        const defs = (
          await CustomsMerger.merge(
            null,
            extFiles,
            null,
            extFolders,
            vsicons.presets,
            [
              {
                apply: false,
              },
            ],
          )
        ).files.supported.filter((file: IFileExtension) =>
          regex.test(file.icon),
        );

        defs.forEach((def: IFileExtension) => expect(def.disabled).to.be.true);
      });

      it(`enabled, when an 'NestJS' project is detected by PAD`, async function () {
        const defs = (
          await CustomsMerger.merge(
            null,
            extFiles,
            null,
            extFolders,
            vsicons.presets,
            [
              {
                apply: true,
                project: Projects.nestjs,
                value: true,
              },
            ],
          )
        ).files.supported.filter((file: IFileExtension) =>
          regex.test(file.icon),
        );

        defs.forEach((def: IFileExtension) => expect(def.disabled).to.be.false);
      });
    });

    context(`'Javascript' official icons can be`, function () {
      it('enabled and disabled', async function () {
        const toggle = async (
          enable: boolean,
        ): Promise<Record<string, IFileExtension[]>> => {
          vsicons.presets.jsOfficial = enable;
          const { files } = await CustomsMerger.merge(
            null,
            extFiles,
            null,
            extFolders,
            vsicons.presets,
          );

          return {
            defs: files.supported.filter(
              (file: IFileExtension) => file.icon === IconNames.js.toString(),
            ),
            officialDefs: files.supported.filter(
              (file: IFileExtension) =>
                file.icon === IconNames.jsOfficial.toString(),
            ),
          };
        };

        // Set JS Official icon as enabled
        let icons = await toggle(true);

        icons.defs.forEach(
          (def: IFileExtension) => expect(def.disabled).to.be.true,
        );
        icons.officialDefs.forEach(
          (officialDef: IFileExtension) =>
            expect(officialDef.disabled).to.be.false,
        );

        // Set JS Official icon as disabled
        icons = await toggle(false);

        icons.defs.forEach(
          (def: IFileExtension) => expect(def.disabled).to.be.false,
        );
        icons.officialDefs.forEach(
          (officialDef: IFileExtension) =>
            expect(officialDef.disabled).to.be.true,
        );
      });
    });

    context(
      `'Typescript', 'Config' and 'Definition' official icons can be`,
      function () {
        it('enabled and disabled', async function () {
          const toggle = async (
            enable: boolean,
          ): Promise<Record<string, IFileExtension[]>> => {
            vsicons.presets.tsOfficial = enable;
            const { files } = await CustomsMerger.merge(
              null,
              extFiles,
              null,
              extFolders,
              vsicons.presets,
            );

            return {
              tsDefs: files.supported.filter(
                (file: IFileExtension) => file.icon === IconNames.ts.toString(),
              ),
              officialTsDefs: files.supported.filter(
                (file: IFileExtension) =>
                  file.icon === IconNames.tsOfficial.toString(),
              ),
              tsConfig: files.supported.filter(
                (file: IFileExtension) =>
                  file.icon === IconNames.tsConfig.toString(),
              ),
              tsConfigOfficial: files.supported.filter(
                (file: IFileExtension) =>
                  file.icon === IconNames.tsConfigOfficial.toString(),
              ),
              typesDefs: files.supported.filter(
                (file: IFileExtension) =>
                  file.icon === IconNames.tsDef.toString(),
              ),
              officialTypesDefs: files.supported.filter(
                (file: IFileExtension) =>
                  file.icon === IconNames.tsDefOfficial.toString(),
              ),
            };
          };

          // Set TS Official icon as enabled
          let icons = await toggle(true);

          icons.tsDefs.forEach(
            (def: IFileExtension) => expect(def.disabled).to.be.true,
          );
          icons.officialTsDefs.forEach(
            (officialDef: IFileExtension) =>
              expect(officialDef.disabled).to.be.false,
          );

          icons.typesDefs.forEach(
            (def: IFileExtension) => expect(def.disabled).to.be.true,
          );
          icons.officialTypesDefs.forEach(
            (officialDef: IFileExtension) =>
              expect(officialDef.disabled).to.be.false,
          );

          // Set TS Official icon as disabled
          icons = await toggle(false);

          icons.tsDefs.forEach(
            (def: IFileExtension) => expect(def.disabled).to.be.false,
          );
          icons.officialTsDefs.forEach(
            (officialDef: IFileExtension) =>
              expect(officialDef.disabled).to.be.true,
          );

          icons.typesDefs.forEach(
            (def: IFileExtension) => expect(def.disabled).to.be.false,
          );
          icons.officialTypesDefs.forEach(
            (officialDef: IFileExtension) =>
              expect(officialDef.disabled).to.be.true,
          );
        });
      },
    );

    context(`'JSON' official icons can be`, function () {
      it('enabled and disabled', async function () {
        const toggle = async (
          enable: boolean,
        ): Promise<Record<string, IFileExtension[]>> => {
          vsicons.presets.jsonOfficial = enable;
          const { files } = await CustomsMerger.merge(
            null,
            extFiles,
            null,
            extFolders,
            vsicons.presets,
          );

          return {
            defs: files.supported.filter(
              (file: IFileExtension) => file.icon === IconNames.json.toString(),
            ),
            officialDefs: files.supported.filter(
              (file: IFileExtension) =>
                file.icon === IconNames.jsonOfficial.toString(),
            ),
          };
        };

        // Set JSON Official icon as enabled
        let icons = await toggle(true);

        icons.defs.forEach(
          (def: IFileExtension) => expect(def.disabled).to.be.true,
        );
        icons.officialDefs.forEach(
          (officialDef: IFileExtension) =>
            expect(officialDef.disabled).to.be.false,
        );

        // Set JSON Official icon as disabled
        icons = await toggle(false);

        icons.defs.forEach(
          (def: IFileExtension) => expect(def.disabled).to.be.false,
        );
        icons.officialDefs.forEach(
          (officialDef: IFileExtension) =>
            expect(officialDef.disabled).to.be.true,
        );
      });
    });

    context('all specific folders icons can be', function () {
      it('disabled and enabled', async function () {
        const toggle = async (enabled: boolean): Promise<IFolderCollection> => {
          vsicons.presets.foldersAllDefaultIcon = enabled;
          const { folders } = await CustomsMerger.merge(
            null,
            extFiles,
            null,
            extFolders,
            vsicons.presets,
          );
          return folders;
        };

        // Disable icons
        let defs = await toggle(true);
        expect(defs.default.folder.disabled).to.be.false;
        expect(defs.default.root_folder.disabled).to.be.false;
        defs.supported.forEach(
          (def: IFileExtension) => expect(def.disabled).to.be.true,
        );

        // Enable icons
        defs = await toggle(false);
        expect(defs.default.folder.disabled).to.be.false;
        expect(defs.default.root_folder.disabled).to.be.false;
        expect(
          defs.supported.find((def: { icon: string }) => def.icon === 'aws')
            .disabled,
        ).to.be.false;
        expect(
          defs.supported.find((def: { icon: string }) => def.icon === 'aws2')
            .disabled,
        ).to.be.true;
      });

      it(`default custom icons 'associations' are respected`, async function () {
        vsicons.presets.foldersAllDefaultIcon = true;
        const customFolders = {
          default: {
            folder: { icon: 'folder', format: 'svg', disabled: true },
            root_folder: { icon: 'root_folder', format: 'svg', disabled: true },
          },
          supported: [
            {
              icon: 'aws3',
              extensions: ['aws', '.aws'],
              format: 'svg',
              overrides: 'aws',
            },
          ],
        };
        const { folders } = await CustomsMerger.merge(
          null,
          extFiles,
          customFolders,
          extFolders,
          vsicons.presets,
        );

        expect(folders.default.folder.disabled).to.be.true;
        expect(folders.default.root_folder.disabled).to.be.true;
        folders.supported.forEach(
          (def: IFileExtension) => expect(def.disabled).to.be.true,
        );
      });
    });

    context('all folder icons can be', function () {
      it('hidden and shown', async function () {
        const toggle = async (enabled: boolean): Promise<IFolderCollection> => {
          vsicons.presets.hideFolders = enabled;
          const { folders } = await CustomsMerger.merge(
            null,
            extFiles,
            null,
            extFolders,
            vsicons.presets,
          );
          return folders;
        };

        // Hide icons
        let defs = await toggle(true);
        expect(defs.default.folder.disabled).to.be.true;
        expect(defs.default.root_folder.disabled).to.be.true;
        defs.supported.forEach(
          (def: IFileExtension) => expect(def.disabled).to.be.true,
        );

        // Show icons
        defs = await toggle(false);
        expect(defs.default.folder.disabled).to.be.false;
        expect(defs.default.root_folder.disabled).to.be.false;
        expect(
          defs.supported.find((def: { icon: string }) => def.icon === 'aws')
            .disabled,
        ).to.be.false;
        expect(
          defs.supported.find((def: { icon: string }) => def.icon === 'aws2')
            .disabled,
        ).to.be.true;
      });

      it(`custom icons 'associations' are ignored`, async function () {
        vsicons.presets.hideFolders = true;
        const customFolders = {
          default: {
            folder: { icon: 'folder', format: 'svg' },
            root_folder: { icon: 'root_folder', format: 'svg' },
          },
          supported: [
            {
              icon: 'aws3',
              extensions: ['aws', '.aws'],
              format: 'svg',
              overrides: 'aws',
            },
          ],
        };
        const { folders } = await CustomsMerger.merge(
          null,
          extFiles,
          customFolders,
          extFolders,
          vsicons.presets,
        );

        expect(folders.default.folder.disabled).to.be.true;
        expect(folders.default.root_folder.disabled).to.be.true;
        expect(
          folders.supported.find((def: IFileExtension) => def.icon === 'aws3')
            .disabled,
        ).to.be.true;
        folders.supported
          .filter((def: IFileExtension) => def.icon !== 'aws3')
          .forEach((def: IFileExtension) => expect(def.disabled).to.be.true);
      });
    });
  });
});
