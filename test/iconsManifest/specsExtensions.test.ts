/* eslint-disable prefer-arrow-callback */
/* eslint-disable no-unused-expressions */
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
        .filter(
          (file: IFileExtension) => file.extensions.length && !file.filename,
        )
        .forEach((file: IFileExtension) =>
          file.extensions.forEach(
            (extension: string) =>
              expect(
                extension.startsWith('.'),
                `Offender extension: ${extension}`,
              ).to.be.false,
          ),
        );
    });

    context('each supported', function () {
      const iconsDirPath = ConfigManager.iconsDir;

      context('extension', function () {
        it('has an associated icon file', async function () {
          for (const supportedFile of files.supported) {
            const filename =
              `${constants.iconsManifest.fileTypePrefix}${supportedFile.icon}` +
              `${constants.iconsManifest.iconSuffix}.${
                FileFormat[supportedFile.format] as string
              }`;
            const iconFilePath = join(iconsDirPath, filename);

            const pathExists = await existsAsync(iconFilePath);

            expect(pathExists, `${iconFilePath} does not exist`).to.be.true;
          }
        });

        context('does NOT have', function () {
          it(`duplicate declaration`, function () {
            const unique = uniqBy(files.supported, JSON.stringify);

            expect(unique).to.have.lengthOf(files.supported.length);
          });

          it(`same declaration with different 'extensions'`, function () {
            const checker = (
              _file: IFileExtension,
              file: IFileExtension,
            ): boolean =>
              (!Reflect.has(_file, 'disabled') ||
                _file.disabled !== file.disabled) &&
              !Reflect.has(_file, 'filename') &&
              !isEqual(_file.extensions, file.extensions) &&
              !_file.checked &&
              _file.icon === file.icon;

            files.supported.forEach((file: IFileExtension) => {
              file.checked = true;
              const otherDeclarations: IFileExtension[] =
                files.supported.filter((_file: IFileExtension) =>
                  checker(_file, file),
                );

              expect(otherDeclarations).to.be.empty;
            });
          });

          context(`empty 'extensions' declaration`, function () {
            it(`with 'filename' declaration`, function () {
              const testCase = (_file: IFileExtension): boolean =>
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
          it('has an associated icon file', async function () {
            for (const supportedFile of files.supported.filter(
              (file: IFileExtension) => file.light,
            )) {
              const filename = `${constants.iconsManifest.fileTypeLightPrefix}${
                supportedFile.icon
              }${constants.iconsManifest.iconSuffix}.${
                FileFormat[supportedFile.format] as string
              }`;
              const iconFilePath = join(iconsDirPath, filename);

              const pathExists = await existsAsync(iconFilePath);

              expect(pathExists).to.be.true;
            }
          });
        });
      });
    });
  });
});
