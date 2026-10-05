import type { IFileCollection, IFileExtension } from '../../../src/models';

import { expect } from 'chai';
import { isEqual } from 'lodash';
import * as sinon from 'sinon';

import { CustomsMerger } from '../../../src/iconsManifest/customsMerger';
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

    it('new extensions are added to existing file icon and respect the format type', async function () {
      const customFiles: IFileCollection = {
        default: {},
        supported: [{ icon: 'actionscript', extensions: ['as2'] }],
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
    });

    it(`'extends' replaces the specified icon`, async function () {
      const customFiles: IFileCollection = {
        default: {},
        supported: [
          {
            icon: 'newIcon',
            extensions: ['newExt'],
            extends: 'actionscript',
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

      expect(newDefs[1].extensions).to.eql(customFiles.supported[0].extensions);
    });

    it('disabled extensions are NOT included into the manifest', async function () {
      const customFiles: IFileCollection = {
        default: {},
        supported: [
          {
            icon: 'actionscript',
            extensions: [],
            disabled: true,
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
            },
            {
              icon: 'ng_component_js2',
              extensions: ['component.js'],
            },
            {
              icon: 'ng_smart_component_ts2',
              extensions: ['page.ts', 'container.ts'],
            },
            {
              icon: 'ng_smart_component_js2',
              extensions: ['page.js', 'container.js'],
            },
            {
              icon: 'ng_directive_ts2',
              extensions: ['directive.ts'],
            },
            {
              icon: 'ng_directive_js2',
              extensions: ['directive.js'],
            },
            { icon: 'ng_pipe_ts2', extensions: ['pipe.ts'] },
            { icon: 'ng_pipe_js2', extensions: ['pipe.js'] },
            {
              icon: 'ng_service_ts2',
              extensions: ['service.ts'],
            },
            {
              icon: 'ng_service_js2',
              extensions: ['service.js'],
            },
            {
              icon: 'ng_module_ts2',
              extensions: ['module.ts'],
            },
            {
              icon: 'ng_module_js2',
              extensions: ['module.js'],
            },
            {
              icon: 'ng_routing_ts2',
              extensions: ['routing.ts', 'routes.ts'],
            },
            {
              icon: 'ng_routing_js2',
              extensions: ['routing.js', 'routes.js'],
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
              cf.icon === file.icon && isEqual(cf.extensions, file.extensions),
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
      });
    });
  });
});
