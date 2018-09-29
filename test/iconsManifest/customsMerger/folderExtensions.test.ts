// tslint:disable only-arrow-functions
// tslint:disable no-unused-expression
import { expect } from 'chai';
import * as sinon from 'sinon';
import { isEqual } from 'lodash';
import { FileFormat } from '../../../src/models';
import { CustomsMerger } from '../../../src/iconsManifest/customsMerger';
import { extensions as extFiles } from '../../fixtures/supportedExtensions';
import { extensions as extFolders } from '../../fixtures/supportedFolders';
import { vsicons } from '../../fixtures/vsicons';

describe('CustomsMerger: folder extensions tests', function () {
  context('ensures that', function () {
    let sandbox: sinon.SinonSandbox;

    beforeEach(function () {
      sandbox = sinon.createSandbox();
    });

    afterEach(function () {
      sandbox.restore();
    });

    it('new extensions are added to existing folder icon and respect the format type', function () {
      const customFolders: any = {
        default: {},
        supported: [{ icon: 'aws', extensions: ['aws3'], format: 'svg' }],
      };

      const newDefs = CustomsMerger
        .merge(null, extFiles, customFolders, extFolders, vsicons.presets)
        .folders.supported.filter(
          folder => folder.icon === customFolders.supported[0].icon
        );

      expect(newDefs)
        .to.be.an('array')
        .with.lengthOf(2);

      newDefs.forEach(def => {
        expect(def.icon).to.equal(customFolders.supported[0].icon);
        expect(def.format).to.equals(FileFormat.svg);
      });
      expect(newDefs[0].extensions).to.eql(['aws', '.aws']);
      expect(newDefs[1].extensions).to.eql(['aws3']);
    });

    it(`'overrides' removes the specified icon`, function () {
      const customFolders: any = {
        default: {},
        supported: [
          {
            icon: 'aws3',
            extensions: ['aws'],
            overrides: 'aws',
            format: 'svg',
          },
        ],
      };

      const { folders } = CustomsMerger.merge(
        null,
        extFiles,
        customFolders,
        extFolders,
        vsicons.presets
      );
      const overridenDef = folders.supported.filter(
        folder => folder.icon === customFolders.supported[0].overrides
      );
      const newDefs = folders.supported.filter(
        folder => folder.icon === customFolders.supported[0].icon
      );

      expect(overridenDef).to.be.empty;
      expect(newDefs)
        .to.be.an('array')
        .with.lengthOf(1);
      expect(newDefs[0].icon).to.equal(customFolders.supported[0].icon);
      expect(newDefs[0].extensions).to.eql(
        customFolders.supported[0].extensions
      );
      expect(newDefs[0].format).to.equals(customFolders.supported[0].format);
    });

    it(`'extends' replaces the specified icon`, function () {
      const customFolders: any = {
        default: {},
        supported: [
          {
            icon: 'newIcon',
            extensions: ['newExt'],
            extends: 'aws',
            format: 'png',
          },
        ],
      };

      const { folders } = CustomsMerger.merge(
        null,
        extFiles,
        customFolders,
        extFolders,
        vsicons.presets
      );
      const extendedDef = folders.supported.filter(
        folder => folder.icon === customFolders.supported[0].extends
      );
      const newDefs = folders.supported.filter(
        folder => folder.icon === customFolders.supported[0].icon
      );

      expect(extendedDef)
        .to.be.an('array')
        .with.lengthOf(1);
      expect(newDefs)
        .to.be.an('array')
        .with.lengthOf(2);
      newDefs.forEach(def => {
        expect(def.icon).to.equal(customFolders.supported[0].icon);
      });
      expect(newDefs[0].extensions).to.eql(['aws', '.aws']);
      expect(newDefs[0].format).to.equals(FileFormat.svg);

      expect(newDefs[1].extensions).to.eql(
        customFolders.supported[0].extensions
      );
      expect(newDefs[1].format).to.equals(customFolders.supported[0].format);
    });

    it('disabled icons are NOT included into the manifest', function () {
      const customFolders: any = {
        default: {},
        supported: [
          { icon: 'aws', extensions: [], disabled: true, format: 'svg' },
        ],
      };

      const newDefs = CustomsMerger
        .merge(null, extFiles, customFolders, extFolders, vsicons.presets)
        .folders.supported.filter(
          folder => folder.icon === customFolders.supported[0].icon
        );

      expect(newDefs)
        .to.be.an('array')
        .with.lengthOf(1);
      expect(newDefs[0].disabled).to.be.true;
    });

    it('NOT disabled icons are included into the manifest', function () {
      const customFolders: any = {
        default: {},
        supported: [
          { icon: 'aws', extensions: [], disabled: false, format: 'svg' },
        ],
      };

      const newDefs = CustomsMerger
        .merge(null, extFiles, customFolders, extFolders, vsicons.presets)
        .folders.supported.filter(
          folder => folder.icon === customFolders.supported[0].icon
        );

      expect(newDefs)
        .to.be.an('array')
        .with.lengthOf(2);
      newDefs.forEach(def => {
        expect(def.icon).to.equal(customFolders.supported[0].icon);
        expect(def.format).to.equal(FileFormat.svg);
        expect(def.disabled).to.be.false;
      });
      expect(newDefs[0].extensions).to.eql(['aws', '.aws']);
      expect(newDefs[1].extensions).to.eql(
        customFolders.supported[0].extensions
      );
    });

    it(`if 'extensions' is NOT defined, it gets added internally`, function () {
      const customFolders: any = {
        default: {},
        supported: [{ icon: 'aws', disabled: false, format: 'svg' }],
      };

      const newDefs = CustomsMerger
        .merge(null, extFiles, customFolders, extFolders, vsicons.presets)
        .folders.supported.filter(
          folder => folder.icon === customFolders.supported[0].icon
        );

      expect(newDefs)
        .to.be.an('array')
        .with.lengthOf(2);
      newDefs.forEach(def => {
        expect(def.icon).to.equal(customFolders.supported[0].icon);
        expect(def.disabled).to.be.false;
        expect(def.format).to.equal(FileFormat.svg);
      });
      expect(newDefs[0].extensions).to.eql(['aws', '.aws']);
      expect(newDefs[1].extensions).to.eql([]);
    });

    it(`existing icon have its 'extensions' reassigned to new custom icon`, function () {
      const customFolders: any = {
        default: {},
        supported: [
          { icon: 'newIcon', extensions: ['aws', '.aws'], format: 'svg' },
        ],
      };

      const { folders } = CustomsMerger.merge(
        null,
        extFiles,
        customFolders,
        extFolders,
        vsicons.presets
      );

      const oldDefs = folders.supported.filter(
        folder =>
          folder.icon ===
          extFolders.supported.find(ef =>
            isEqual(ef.extensions, customFolders.supported[0].extensions)
          ).icon
      );
      const newDefs = folders.supported.filter(
        folder => folder.icon === customFolders.supported[0].icon
      );

      expect(oldDefs[0].extensions).to.be.empty;
      expect(newDefs)
        .to.be.an('array')
        .with.lengthOf(1);
      expect(newDefs[0].icon).to.eql(customFolders.supported[0].icon);
      expect(newDefs[0].extensions).to.eql(
        customFolders.supported[0].extensions
      );
    });

    context('custom icon', function () {
      it(`keeps the correct 'format'`, function () {
        const customFolders: any = {
          default: {},
          supported: [
            {
              icon: 'custom_icon',
              extensions: ['custom'],
              format: 'svg',
            },
          ],
        };

        const newDefs = CustomsMerger
          .merge(
            null,
            extFiles,
            customFolders,
            extFolders,
            vsicons.presets
          )
          .folders.supported.filter(
            folder => folder.icon === customFolders.supported[0].icon
          );

        expect(newDefs)
          .to.be.an('array')
          .with.lengthOf(1);

        expect(newDefs[0].format).to.equal(customFolders.supported[0].format);
      });
    });
  });
});
