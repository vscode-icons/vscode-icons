// tslint:disable only-arrow-functions
// tslint:disable no-unused-expression
import { expect } from 'chai';
import { isEmpty, isEqual, uniqBy } from 'lodash';
import { join } from 'path';
import { existsAsync } from '../../src/common/fsAsync';
import { ConfigManager } from '../../src/configuration/configManager';
import { constants } from '../../src/constants';
import { extensions as files } from '../../src/iconsManifest/supportedExtensions';
import { FileFormat, IFileExtension } from '../../src/models';

describe('Specifications of supported extensions: tests', function () {
  context('ensures that', function () {
    it(`an 'extension' declaration should NOT have a leading dot`, function () {
      files.supported
        .filter(file => file.extensions.length && !file.filename)
        .forEach(file =>
          file.extensions.forEach(
            extension => expect(extension.startsWith('.')).to.be.false,
          ),
        );
    });

    context('each supported', function () {
      const iconsDirPath = ConfigManager.iconsDir;

      context('extension', function () {
        it('has an associated icon file', function () {
          files.supported.forEach(async (file: IFileExtension) => {
            const filename =
              `${constants.iconsManifest.fileTypePrefix}${file.icon}` +
              `${constants.iconsManifest.iconSuffix}.${
                FileFormat[file.format]
              }`;
            const iconFilePath = join(iconsDirPath, filename);

            const pathExists = await existsAsync(iconFilePath);

            expect(pathExists).to.be.true;
          });
        });

        context('does NOT have', function () {
          it(`duplicate declaration`, function () {
            const unique = uniqBy(files.supported, JSON.stringify);

            expect(unique).to.have.lengthOf(files.supported.length);
          });

          it(`same declaration with different 'extensions'`, function () {
            const checker = (_file: IFileExtension, file: IFileExtension) =>
              (!Reflect.has(_file, 'disabled') ||
                _file.disabled !== file.disabled) &&
              !Reflect.has(_file, 'filename') &&
              !isEqual(_file.extensions, file.extensions) &&
              !_file['checked'] &&
              _file.icon === file.icon;

            files.supported.forEach((file: IFileExtension) => {
              file['checked'] = true;
              const otherDeclarations: IFileExtension[] = files.supported.filter(
                _file => checker(_file, file),
              );

              expect(otherDeclarations).to.be.empty;
            });
          });

          context(`empty 'extensions' declaration`, function () {
            it(`with 'filename' declaration`, function () {
              const testCase = (_file: IFileExtension) =>
                (!!_file.filename || !!_file.light) &&
                isEmpty(_file.filenamesGlob) &&
                isEmpty(_file.extensionsGlob) &&
                isEmpty(_file.languages) &&
                isEmpty(_file.extensions);

              files.supported.forEach((file: IFileExtension) => {
                expect(testCase(file)).to.be.false;
              });
            });
          });
        });

        context('that has a light theme version', function () {
          it('has an associated icon file', function () {
            files.supported
              .filter((file: IFileExtension) => file.light)
              .forEach(async (file: IFileExtension) => {
                const filename = `${
                  constants.iconsManifest.fileTypeLightPrefix
                }${file.icon}${constants.iconsManifest.iconSuffix}.${
                  FileFormat[file.format]
                }`;
                const iconFilePath = join(iconsDirPath, filename);

                const pathExists = await existsAsync(iconFilePath);

                expect(pathExists).to.be.true;
              });
          });
        });
      });
    });
  });
});
