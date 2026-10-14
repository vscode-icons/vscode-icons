import type { IFileCollection, IFileExtension } from '../../../src/models';

import { expect } from 'chai';
import { isEqual } from 'lodash';
import * as sinon from 'sinon';

import { CustomsMerger } from '../../../src/iconsManifest/customsMerger';
import { FileFormat } from '../../../src/models';
import { extensions as extFiles } from '../../fixtures/supportedExtensions';
import { extensions as extFolders } from '../../fixtures/supportedFolders';
import { vsicons } from '../../fixtures/vsicons';

describe('CustomsMerger: file extensions tests', function () {
  context('ensures that', function () {
    let sandbox: sinon.SinonSandbox;

    beforeEach(function () {
      sandbox = sinon.createSandbox();
    });

    afterEach(function () {
      sandbox.restore();
    });

    it('uses the existing icon format when it is defined', async function () {
      const customFiles: IFileCollection = {
        default: {},
        supported: [{ icon: 'existing_icon', extensions: ['custom'] }],
      };
      const supportedFiles: IFileCollection = {
        default: {},
        supported: [
          {
            icon: 'existing_icon',
            extensions: ['existing'],
            format: FileFormat.png,
          },
        ],
      };

      const { files } = await CustomsMerger.merge(
        customFiles,
        supportedFiles,
        null,
        extFolders,
        vsicons.presets,
      );

      const customDef = files.supported.find(
        (file: IFileExtension) => file.icon === 'existing_icon',
      );

      expect(customDef).to.exist;
      expect(customDef.format).to.equal(FileFormat.png);
    });

    it('defaults supported icons without a format to SVG', async function () {
      const supportedFiles: IFileCollection = {
        default: {},
        supported: [{ icon: 'existing_icon', extensions: ['existing'] }],
      };

      const { files } = await CustomsMerger.merge(
        { default: {}, supported: [] },
        supportedFiles,
        null,
        extFolders,
        vsicons.presets,
      );

      expect(files.supported[0].format).to.equal(FileFormat.svg);
    });

    it('inherits the existing icon format when the custom definition has no format', async function () {
      const customFiles: IFileCollection = {
        default: {},
        supported: [{ icon: 'actionscript', extensions: ['as2'] }],
      };

      const { files } = await CustomsMerger.merge(
        customFiles,
        extFiles,
        null,
        extFolders,
        vsicons.presets,
      );

      const customDef = files.supported.find(
        (file: IFileExtension) => file.icon === 'actionscript',
      );

      expect(customDef).to.exist;
      expect(customDef.format).to.equal(FileFormat.svg);
    });

    it('defaults a custom icon with no format to SVG', async function () {
      const customFiles: IFileCollection = {
        default: {},
        supported: [{ icon: 'custom_icon', extensions: ['custom'] }],
      };

      const { files } = await CustomsMerger.merge(
        customFiles,
        extFiles,
        null,
        extFolders,
        vsicons.presets,
      );

      const customDef = files.supported.find(
        (file: IFileExtension) => file.icon === 'custom_icon',
      );

      expect(customDef).to.exist;
      expect(customDef.format).to.equal(FileFormat.svg);
    });

    it('new extensions are added to existing file icon and respect the format type', async function () {
      const customFiles: IFileCollection = {
        default: {},
        supported: [
          { icon: 'actionscript', extensions: ['as2'], format: 'svg' },
        ],
      };

      const newDefs = (
        await CustomsMerger.merge(
          customFiles,
          extFiles,
          null,
          extFolders,
          vsicons.presets,
        )
      ).files.supported.filter(
        (file: IFileExtension) => file.icon === customFiles.supported[0].icon,
      );

      expect(newDefs).to.be.an('array').with.lengthOf(2);

      newDefs.forEach((def: IFileExtension) => {
        expect(def.icon).to.eql(customFiles.supported[0].icon);
        expect(def.format).to.eql(FileFormat.svg);
      });
      expect(newDefs[0].extensions).to.eql(['as']);
      expect(newDefs[1].extensions).to.eql(['as2']);
    });

    it(`'overrides' removes the specified icon`, async function () {
      const customFiles: IFileCollection = {
        default: {},
        supported: [
          {
            icon: 'actionscript2',
            extensions: ['as2'],
            overrides: 'actionscript',
            format: 'svg',
          },
        ],
      };

      const { files } = await CustomsMerger.merge(
        customFiles,
        extFiles,
        null,
        extFolders,
        vsicons.presets,
      );
      const overridenDef = files.supported.filter(
        (file: IFileExtension) =>
          file.icon === customFiles.supported[0].overrides,
      );
      const newDefs = files.supported.filter(
        (file: IFileExtension) => file.icon === customFiles.supported[0].icon,
      );

      expect(overridenDef).to.be.empty;
      expect(newDefs).to.be.an('array').with.lengthOf(1);
      expect(newDefs[0].icon).to.equal(customFiles.supported[0].icon);
      expect(newDefs[0].extensions).to.eql(customFiles.supported[0].extensions);
      expect(newDefs[0].format).to.equals(customFiles.supported[0].format);
    });

    it(`'extends' replaces the specified icon`, async function () {
      const customFiles: IFileCollection = {
        default: {},
        supported: [
          {
            icon: 'newIcon',
            extensions: ['newExt'],
            extends: 'actionscript',
            format: 'png',
          },
        ],
      };

      const { files } = await CustomsMerger.merge(
        customFiles,
        extFiles,
        null,
        extFolders,
        vsicons.presets,
      );
      const extendedDef = files.supported.filter(
        (file: IFileExtension) =>
          file.icon === customFiles.supported[0].extends,
      );
      const newDefs = files.supported.filter(
        (file: IFileExtension) => file.icon === customFiles.supported[0].icon,
      );

      expect(extendedDef).to.be.empty;
      expect(newDefs).to.be.an('array').with.lengthOf(2);
      newDefs.forEach((def: IFileExtension) => {
        expect(def.icon).to.equal(customFiles.supported[0].icon);
      });
      expect(newDefs[0].extensions).to.eql(['as']);
      expect(newDefs[0].format).to.equals(FileFormat.svg);

      expect(newDefs[1].extensions).to.eql(customFiles.supported[0].extensions);
      expect(newDefs[1].format).to.equals(customFiles.supported[0].format);
    });

    it('disabled extensions are NOT included into the manifest', async function () {
      const customFiles: IFileCollection = {
        default: {},
        supported: [
          {
            icon: 'actionscript',
            extensions: [],
            disabled: true,
            format: 'svg',
          },
        ],
      };

      const newDefs = (
        await CustomsMerger.merge(
          customFiles,
          extFiles,
          null,
          extFolders,
          vsicons.presets,
        )
      ).files.supported.filter(
        (file: IFileExtension) => file.icon === customFiles.supported[0].icon,
      );

      expect(newDefs).to.be.an('array').with.lengthOf(1);
      expect(newDefs[0].disabled).to.be.true;
    });

    it('NOT disabled icons are included into the manifest', async function () {
      const customFiles: IFileCollection = {
        default: {},
        supported: [
          {
            icon: 'actionscript',
            extensions: ['myExt'],
            disabled: false,
            format: 'svg',
          },
        ],
      };

      const newDefs = (
        await CustomsMerger.merge(
          customFiles,
          extFiles,
          null,
          extFolders,
          vsicons.presets,
        )
      ).files.supported.filter(
        (file: IFileExtension) => file.icon === customFiles.supported[0].icon,
      );

      expect(newDefs).to.be.an('array').with.lengthOf(2);
      newDefs.forEach((def: IFileExtension) => {
        expect(def.icon).to.equal(customFiles.supported[0].icon);
        expect(def.format).to.equal(FileFormat.svg);
        expect(def.disabled).to.be.false;
      });
      expect(newDefs[0].extensions).to.eql(['as']);
      expect(newDefs[1].extensions).to.eql(customFiles.supported[0].extensions);
    });

    it(`if 'extensions' attribute is NOT defined, it gets added internally`, async function () {
      const customFiles: IFileCollection = {
        default: {},
        supported: [
          {
            icon: 'actionscript',
            disabled: false,
            format: 'svg',
          },
        ],
      };

      const newDefs = (
        await CustomsMerger.merge(
          customFiles,
          extFiles,
          null,
          extFolders,
          vsicons.presets,
        )
      ).files.supported.filter(
        (file: IFileExtension) => file.icon === customFiles.supported[0].icon,
      );

      expect(newDefs).to.be.an('array').with.lengthOf(2);
      newDefs.forEach((def: IFileExtension) => {
        expect(def.icon).to.equal(customFiles.supported[0].icon);
        expect(def.disabled).to.be.false;
        expect(def.format).to.equal(FileFormat.svg);
      });
      expect(newDefs[0].extensions).to.eql(['as']);
      expect(newDefs[1].extensions).to.eql([]);
    });

    context('existing icons', function () {
      it('of second set are getting enabled', async function () {
        const customFiles: IFileCollection = {
          default: {},
          supported: [
            {
              icon: 'ng_component_ts2',
              extensions: ['component.ts'],
              format: 'svg',
            },
            {
              icon: 'ng_component_js2',
              extensions: ['component.js'],
              format: 'svg',
            },
            {
              icon: 'ng_smart_component_ts2',
              extensions: ['page.ts', 'container.ts'],
              format: 'svg',
            },
            {
              icon: 'ng_smart_component_js2',
              extensions: ['page.js', 'container.js'],
              format: 'svg',
            },
            {
              icon: 'ng_directive_ts2',
              extensions: ['directive.ts'],
              format: 'svg',
            },
            {
              icon: 'ng_directive_js2',
              extensions: ['directive.js'],
              format: 'svg',
            },
            { icon: 'ng_pipe_ts2', extensions: ['pipe.ts'], format: 'svg' },
            { icon: 'ng_pipe_js2', extensions: ['pipe.js'], format: 'svg' },
            {
              icon: 'ng_service_ts2',
              extensions: ['service.ts'],
              format: 'svg',
            },
            {
              icon: 'ng_service_js2',
              extensions: ['service.js'],
              format: 'svg',
            },
            {
              icon: 'ng_module_ts2',
              extensions: ['module.ts'],
              format: 'svg',
            },
            {
              icon: 'ng_module_js2',
              extensions: ['module.js'],
              format: 'svg',
            },
            {
              icon: 'ng_routing_ts2',
              extensions: ['routing.ts', 'routes.ts'],
              format: 'svg',
            },
            {
              icon: 'ng_routing_js2',
              extensions: ['routing.js', 'routes.js'],
              format: 'svg',
            },
          ],
        };

        const { files } = await CustomsMerger.merge(
          customFiles,
          extFiles,
          null,
          extFolders,
          vsicons.presets,
        );
        const ngGroup = files.supported.filter(
          (file: IFileExtension) =>
            /^ng_.*2$/.test(file.icon) && !file.disabled,
        );

        expect(ngGroup).to.have.lengthOf(14);
        ngGroup.forEach((file: IFileExtension) => {
          const ng = customFiles.supported.find(
            (cf: IFileExtension) =>
              cf.icon === file.icon &&
              isEqual(cf.extensions, file.extensions) &&
              cf.format === file.format,
          );
          expect(ng).to.exist;
        });
      });

      it(`have its 'extensions' reassigned to new custom icon`, async function () {
        const customFiles: IFileCollection = {
          default: {},
          supported: [
            {
              icon: 'newIcon',
              extensions: ['aspx', 'ascx'],
              format: 'svg',
            },
          ],
        };

        const { files } = await CustomsMerger.merge(
          customFiles,
          extFiles,
          null,
          extFolders,
          vsicons.presets,
        );
        const oldDefs = files.supported.filter(
          (file: IFileExtension) =>
            file.icon ===
            extFiles.supported.find((ef: IFileExtension) =>
              isEqual(ef.extensions, customFiles.supported[0].extensions),
            ).icon,
        );
        const newDefs = files.supported.filter(
          (file: IFileExtension) => file.icon === customFiles.supported[0].icon,
        );

        expect(oldDefs[0].extensions).to.be.empty;
        expect(newDefs).to.be.an('array').with.lengthOf(1);
        expect(newDefs[0].icon).to.eql(customFiles.supported[0].icon);
        expect(newDefs[0].extensions).to.eql(
          customFiles.supported[0].extensions,
        );
      });

      it(`accept 'languageId'`, async function () {
        const customFiles: IFileCollection = {
          default: {},
          supported: [
            {
              icon: 'actionscript',
              extensions: [],
              format: 'svg',
              languages: [{ ids: 'newlang', knownExtensions: ['newlang'] }],
            },
          ],
        };

        const newDefs = (
          await CustomsMerger.merge(
            customFiles,
            extFiles,
            null,
            extFolders,
            vsicons.presets,
          )
        ).files.supported.filter(
          (file: IFileExtension) => file.icon === customFiles.supported[0].icon,
        );

        expect(newDefs).to.be.an('array').with.lengthOf(2);
        expect(newDefs[0].languages).to.not.exist;
        expect(newDefs[1].languages).to.eql(customFiles.supported[0].languages);
      });
    });

    context('custom icon', function () {
      it(`keeps the correct 'format'`, async function () {
        const customFiles: IFileCollection = {
          default: {},
          supported: [
            {
              icon: 'custom_icon',
              extensions: ['custom'],
              format: 'svg',
            },
          ],
        };

        const newDefs = (
          await CustomsMerger.merge(
            customFiles,
            extFiles,
            null,
            extFolders,
            vsicons.presets,
          )
        ).files.supported.filter(
          (file: IFileExtension) => file.icon === customFiles.supported[0].icon,
        );

        expect(newDefs).to.be.an('array').with.lengthOf(1);

        expect(newDefs[0].format).to.equal(customFiles.supported[0].format);
      });
    });
  });
});
