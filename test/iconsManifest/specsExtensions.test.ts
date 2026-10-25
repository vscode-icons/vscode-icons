import type { FileExtension } from '../../src/types';

import { join } from 'path';

import { expect } from 'chai';
import { cloneDeep, isEmpty, isEqual, uniqBy } from 'lodash';

import { existsAsync } from '../../src/common/fsAsync';
import { ConfigManager } from '../../src/configuration/configManager';
import { constants } from '../../src/constants';
import { extensions as files } from '../../src/iconsManifest/supportedExtensions';
import * as enums from '../../src/types/enums';
import { Utils } from '../../src/utils';

describe('Specifications of supported extensions: tests', function () {
  context('ensures that', function () {
    const supportedFiles = cloneDeep(files.supported);
    let testFiles: FileExtension[];

    beforeEach(function () {
      testFiles = cloneDeep(supportedFiles);
    });

    it(`an 'extension' declaration should NOT have a leading dot`, function () {
      testFiles
        .filter(
          (file: FileExtension) =>
            !!file.extensions && !!file.extensions.length && !file.filename,
        )
        .forEach((file: FileExtension) =>
          file.extensions.forEach(
            (extension: string) =>
              expect(
                extension.startsWith('.'),
                `Offender extension: ${extension}`,
              ).to.be.false,
          ),
        );
    });

    it('all Angular icons are disabled by default', function () {
      const ngIcons = testFiles.filter((file: FileExtension) =>
        file.icon.startsWith('ng_'),
      );

      expect(ngIcons).to.not.be.empty;
      ngIcons.forEach((file: FileExtension) => {
        expect(file.disabled).to.be.true;
      });
    });

    it('all Nest icons are disabled by default', function () {
      const nestIcons = testFiles.filter((file: FileExtension) =>
        file.icon.startsWith('nest_'),
      );

      expect(nestIcons).to.not.be.empty;
      nestIcons.forEach((file: FileExtension) => {
        expect(file.disabled).to.be.true;
      });
    });

    context('each supported', function () {
      const iconsDirPath = ConfigManager.iconsDir;

      context('extension', function () {
        it('defaults a missing format to svg', function () {
          const file = { icon: 'example' } as FileExtension;
          file.format = Utils.fileFormatToString(file.format);

          expect(
            file.format,
            `File format not defaulted to svg: ${file.format}`,
          ).to.equal(`.${enums.FileFormat[enums.FileFormat.svg]}`);
        });

        it('preserves an explicit format', function () {
          const file = {
            icon: 'example',
            format: enums.FileFormat.svg,
          } as FileExtension;
          file.format = Utils.fileFormatToString(file.format);

          expect(file.format).to.equal(
            `.${enums.FileFormat[enums.FileFormat.svg]}`,
          );
        });

        it('has an associated icon file', async function () {
          for (const supportedFile of testFiles) {
            supportedFile.format = Utils.fileFormatToString(
              supportedFile.format,
            );
            const filename =
              `${constants.iconsManifest.fileTypePrefix}${supportedFile.icon}` +
              `${constants.iconsManifest.iconSuffix}${supportedFile.format}`;
            const iconFilePath = join(iconsDirPath, filename);

            const pathExists = await existsAsync(iconFilePath);

            expect(pathExists, `${iconFilePath} does not exist`).to.be.true;
          }
        });

        context('does NOT have', function () {
          it(`duplicate declaration`, function () {
            const unique = uniqBy(testFiles, JSON.stringify);

            expect(unique).to.have.lengthOf(testFiles.length);
          });

          it(`same declaration with different 'extensions'`, function () {
            const checker = (
              _file: FileExtension,
              file: FileExtension,
            ): boolean =>
              (!Reflect.has(_file, 'disabled') ||
                _file.disabled !== file.disabled) &&
              !Reflect.has(_file, 'filename') &&
              !Reflect.has(file, 'filename') &&
              !isEqual(_file.extensions, file.extensions) &&
              !_file.checked &&
              _file.icon === file.icon;

            testFiles.forEach((file: FileExtension) => {
              file.checked = true;
              const otherDeclarations: FileExtension[] = testFiles.filter(
                (_file: FileExtension) => checker(_file, file),
              );

              expect(otherDeclarations).to.be.empty;
            });
          });

          context(`empty association declaration`, function () {
            it(`with 'filename' declaration`, function () {
              const testCase = (_file: FileExtension): boolean =>
                (!!_file.filename || !!_file.light) &&
                isEmpty(_file.filenamesGlob) &&
                isEmpty(_file.extensionsGlob) &&
                isEmpty(_file.languages) &&
                isEmpty(_file.extensions);

              testFiles.forEach((file: FileExtension) => {
                expect(testCase(file)).to.be.false;
              });
            });

            it(`does NOT declare empty 'extensions'`, function () {
              files.supported
                .filter((file: FileExtension) => file.extensions !== undefined)
                .forEach((file: FileExtension) => {
                  expect(
                    file.extensions,
                    `Empty 'extensions' declaration for ${file.icon}`,
                  ).to.not.be.empty;
                });
            });

            it(`does NOT declare empty 'filenamesGlob'`, function () {
              files.supported
                .filter(
                  (file: FileExtension) => file.filenamesGlob !== undefined,
                )
                .forEach((file: FileExtension) => {
                  expect(
                    file.filenamesGlob,
                    `Empty 'filenamesGlob' declaration for ${file.icon}`,
                  ).to.not.be.empty;
                });
            });

            it(`does NOT declare empty 'extensionsGlob'`, function () {
              files.supported
                .filter(
                  (file: FileExtension) => file.extensionsGlob !== undefined,
                )
                .forEach((file: FileExtension) => {
                  expect(
                    file.extensionsGlob,
                    `Empty 'extensionsGlob' declaration for ${file.icon}`,
                  ).to.not.be.empty;
                });
            });

            it(`does NOT declare empty 'languages'`, function () {
              files.supported
                .filter((file: FileExtension) => file.languages !== undefined)
                .forEach((file: FileExtension) => {
                  expect(
                    file.languages,
                    `Empty 'languages' declaration for ${file.icon}`,
                  ).to.not.be.empty;
                });
            });
          });
        });

        context('that has a light theme version', function () {
          it('has an associated icon file', async function () {
            for (const supportedFile of testFiles.filter(
              (file: FileExtension) => file.light,
            )) {
              supportedFile.format = Utils.fileFormatToString(
                supportedFile.format,
              );
              const filename = `${constants.iconsManifest.fileTypeLightPrefix}${
                supportedFile.icon
              }${constants.iconsManifest.iconSuffix}${supportedFile.format}`;
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
