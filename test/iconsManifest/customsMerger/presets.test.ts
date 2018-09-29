// tslint:disable only-arrow-functions
// tslint:disable no-unused-expression
import { expect } from 'chai';
import * as sinon from 'sinon';
import { CustomsMerger, ManifestReader } from '../../../src/iconsManifest';
import {
  IconNames,
  IFileExtension,
  Projects,
  IProjectDetectionResult,
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
      it('enabled and disabled', function () {
        const toggle = (enable: boolean): IFileExtension[] => {
          vsicons.presets.angular = enable;
          return CustomsMerger
            .merge(null, extFiles, null, extFolders, vsicons.presets)
            .files.supported.filter(file => regex.test(file.icon));
        };

        // Set Angular icons as enabled
        let defs = toggle(true);

        defs.forEach(def => expect(def.disabled).to.be.false);

        // Set Angular icons as disabled
        defs = toggle(false);

        defs.forEach(def => expect(def.disabled).to.be.true);
      });

      it(`preserved, if enabled by PAD, when toggling any preset`, function () {
        const toggle = (
          enable: boolean,
          padResult: IProjectDetectionResult,
          affectPresets?: any
        ): any => {
          vsicons.presets.jsOfficial = enable;
          const _files = CustomsMerger.merge(
            null,
            extFiles,
            null,
            extFolders,
            vsicons.presets,
            padResult,
            affectPresets
          ).files;

          return {
            ngDefs: _files.supported.filter(file => regex.test(file.icon)),
            jsDefs: _files.supported.filter(file => file.icon === IconNames.js),
            officialJSDefs: _files.supported.filter(
              file => file.icon === IconNames.jsOfficial
            ),
          };
        };

        // Angular icons get enabled by PAD
        let icons = toggle(false, {
          apply: true,
          projectName: Projects.angular,
          value: true,
        });

        icons.jsDefs.forEach(def => expect(def.disabled).to.be.false);
        icons.officialJSDefs.forEach(def => expect(def.disabled).to.be.true);
        icons.ngDefs.forEach(def => expect(def.disabled).to.be.false);

        // Angular icons are enabled
        iconsDisabledStub.returns(false);

        // User toggles to enable JS Official icons
        icons = toggle(true, undefined, { angular: false });

        icons.jsDefs.forEach(def => expect(def.disabled).to.be.true);
        icons.officialJSDefs.forEach(def => expect(def.disabled).to.be.false);
        icons.ngDefs.forEach(def => expect(def.disabled).to.be.false);

        // User toggles to disable JS Official icons
        icons = toggle(false, undefined, { angular: false });

        icons.jsDefs.forEach(def => expect(def.disabled).to.be.false);
        icons.officialJSDefs.forEach(def => expect(def.disabled).to.be.true);
        icons.ngDefs.forEach(def => expect(def.disabled).to.be.false);
      });

      it(`disabled, when no 'Angular' project is detected by PAD`, function () {
        const defs = CustomsMerger
          .merge(null, extFiles, null, extFolders, vsicons.presets, {
            apply: false,
          })
          .files.supported.filter(file => regex.test(file.icon));

        defs.forEach(def => expect(def.disabled).to.be.true);
      });

      it(`enabled, when an 'Angular' project is detected by PAD`, function () {
        const defs = CustomsMerger
          .merge(null, extFiles, null, extFolders, vsicons.presets, {
            apply: true,
            projectName: Projects.angular,
            value: true,
          })
          .files.supported.filter(file => regex.test(file.icon));

        defs.forEach(def => expect(def.disabled).to.be.false);
      });
    });

    context(`'Javascript' official icons can be`, function () {
      it('enabled and disabled', function () {
        const toggle = (enable: boolean): any => {
          vsicons.presets.jsOfficial = enable;
          const _files = CustomsMerger.merge(
            null,
            extFiles,
            null,
            extFolders,
            vsicons.presets
          ).files;

          return {
            defs: _files.supported.filter(file => file.icon === IconNames.js),
            officialDefs: _files.supported.filter(
              file => file.icon === IconNames.jsOfficial
            ),
          };
        };

        // Set JS Official icon as enabled
        let icons = toggle(true);

        icons.defs.forEach(def => expect(def.disabled).to.be.true);
        icons.officialDefs.forEach(
          officialDef => expect(officialDef.disabled).to.be.false
        );

        // Set JS Official icon as disabled
        icons = toggle(false);

        icons.defs.forEach(def => expect(def.disabled).to.be.false);
        icons.officialDefs.forEach(
          officialDef => expect(officialDef.disabled).to.be.true
        );
      });
    });

    context(`'Typescript' and 'Definition' official icons can be`, function () {
      it('enabled and disabled', function () {
        const toggle = (enable: boolean): any => {
          vsicons.presets.tsOfficial = enable;
          const _files = CustomsMerger.merge(
            null,
            extFiles,
            null,
            extFolders,
            vsicons.presets
          ).files;

          return {
            tsDefs: _files.supported.filter(file => file.icon === IconNames.ts),
            officialTsDefs: _files.supported.filter(
              file => file.icon === IconNames.tsOfficial
            ),
            typesDefs: _files.supported.filter(
              file => file.icon === IconNames.tsDef
            ),
            officialTypesDefs: _files.supported.filter(
              file => file.icon === IconNames.tsDefOfficial
            ),
          };
        };

        // Set TS Official icon as enabled
        let icons = toggle(true);

        icons.tsDefs.forEach(def => expect(def.disabled).to.be.true);
        icons.officialTsDefs.forEach(
          officialDef => expect(officialDef.disabled).to.be.false
        );

        icons.typesDefs.forEach(def => expect(def.disabled).to.be.true);
        icons.officialTypesDefs.forEach(
          officialDef => expect(officialDef.disabled).to.be.false
        );

        // Set TS Official icon as disabled
        icons = toggle(false);

        icons.tsDefs.forEach(def => expect(def.disabled).to.be.false);
        icons.officialTsDefs.forEach(
          officialDef => expect(officialDef.disabled).to.be.true
        );

        icons.typesDefs.forEach(def => expect(def.disabled).to.be.false);
        icons.officialTypesDefs.forEach(
          officialDef => expect(officialDef.disabled).to.be.true
        );
      });
    });

    context(`'JSON' official icons can be`, function () {
      it('enabled and disabled', function () {
        const toggle = (enable: boolean): any => {
          vsicons.presets.jsonOfficial = enable;
          const _files = CustomsMerger.merge(
            null,
            extFiles,
            null,
            extFolders,
            vsicons.presets
          ).files;

          return {
            defs: _files.supported.filter(file => file.icon === IconNames.json),
            officialDefs: _files.supported.filter(
              file => file.icon === IconNames.jsonOfficial
            ),
          };
        };

        // Set JSON Official icon as enabled
        let icons = toggle(true);

        icons.defs.forEach(def => expect(def.disabled).to.be.true);
        icons.officialDefs.forEach(
          officialDef => expect(officialDef.disabled).to.be.false
        );

        // Set JSON Official icon as disabled
        icons = toggle(false);

        icons.defs.forEach(def => expect(def.disabled).to.be.false);
        icons.officialDefs.forEach(
          officialDef => expect(officialDef.disabled).to.be.true
        );
      });
    });

    context('all specific folders icons can be', function () {
      it('disabled and enabled', function () {
        const toggle = (enabled: boolean): any => {
          vsicons.presets.foldersAllDefaultIcon = enabled;
          return CustomsMerger.merge(
            null,
            extFiles,
            null,
            extFolders,
            vsicons.presets
          ).folders;
        };

        // Disable icons
        let defs = toggle(true);
        expect(defs.default.folder.disabled).to.be.false;
        expect(defs.default.root_folder.disabled).to.be.false;
        defs.supported.forEach(def => expect(def.disabled).to.be.true);

        // Enable icons
        defs = toggle(false);
        expect(defs.default.folder.disabled).to.be.false;
        expect(defs.default.root_folder.disabled).to.be.false;
        expect(
          defs.supported.find(def => def.icon === 'aws').disabled
        ).to.be.false;
        expect(
          defs.supported.find(def => def.icon === 'aws2').disabled
        ).to.be.true;
      });

      it(`default custom icons 'associations' are respected`, function () {
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
        const defs = CustomsMerger.merge(
          null,
          extFiles,
          customFolders,
          extFolders,
          vsicons.presets
        ).folders;

        expect(defs.default.folder.disabled).to.be.true;
        expect(defs.default.root_folder.disabled).to.be.true;
        defs.supported.forEach(def => expect(def.disabled).to.be.true);
      });
    });

    context('all folder icons can be', function () {
      it('hidden and shown', function () {
        const toggle = (enabled: boolean): any => {
          vsicons.presets.hideFolders = enabled;
          return CustomsMerger.merge(
            null,
            extFiles,
            null,
            extFolders,
            vsicons.presets
          ).folders;
        };

        // Hide icons
        let defs = toggle(true);
        expect(defs.default.folder.disabled).to.be.true;
        expect(defs.default.root_folder.disabled).to.be.true;
        defs.supported.forEach(def => expect(def.disabled).to.be.true);

        // Show icons
        defs = toggle(false);
        expect(defs.default.folder.disabled).to.be.false;
        expect(defs.default.root_folder.disabled).to.be.false;
        expect(
          defs.supported.find(def => def.icon === 'aws').disabled
        ).to.be.false;
        expect(
          defs.supported.find(def => def.icon === 'aws2').disabled
        ).to.be.true;
      });

      it(`custom icons 'associations' are ignored`, function () {
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
        const defs = CustomsMerger.merge(
          null,
          extFiles,
          customFolders,
          extFolders,
          vsicons.presets
        ).folders;

        expect(defs.default.folder.disabled).to.be.true;
        expect(defs.default.root_folder.disabled).to.be.true;
        expect(
          defs.supported.find(def => def.icon === 'aws3').disabled
        ).to.be.true;
        defs.supported
          .filter(def => def.icon !== 'aws3')
          .forEach(def => expect(def.disabled).to.be.true);
      });
    });
  });
});
