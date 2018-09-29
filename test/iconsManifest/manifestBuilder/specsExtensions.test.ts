// tslint:disable only-arrow-functions
// tslint:disable no-unused-expression
import { expect } from 'chai';
import { existsSync } from 'fs';
import { join } from 'path';
import { constants } from '../../../src/constants';
import { FileFormat } from '../../../src/models';
import { extensions as files } from '../../../src/iconsManifest/supportedExtensions';

describe('Specifications of supported extensions: tests', function () {
  context('ensures that', function () {
    it(`an 'extension' declaration should NOT have a leading dot`, function () {
      files.supported
        .filter(file => file.extensions.length && !file.filename)
        .forEach(file =>
          file.extensions.forEach(
            extension => expect(extension.startsWith('.')).to.be.false
          )
        );
    });

    context('each supported', function () {
      const iconsDirPath = join(__dirname, '../../../../icons');

      context('extension', function () {
        it('has an associated icon file', function () {
          files.supported.forEach(file => {
            const filename =
              `${constants.iconsManifest.fileTypePrefix}${file.icon}` +
              `${constants.iconsManifest.iconSuffix}.${
                FileFormat[file.format]
              }`;
            const iconFilePath = join(iconsDirPath, filename);

            expect(existsSync(iconFilePath)).to.be.true;
          });
        });

        context('that has a light theme version', function () {
          it('has an associated icon file', function () {
            files.supported.filter(file => file.light).forEach(file => {
              const filename = `${constants.iconsManifest.fileTypeLightPrefix}${
                file.icon
              }${constants.iconsManifest.iconSuffix}.${
                FileFormat[file.format]
              }`;
              const iconFilePath = join(iconsDirPath, filename);

              expect(existsSync(iconFilePath)).to.be.true;
            });
          });
        });
      });
    });
  });
});
