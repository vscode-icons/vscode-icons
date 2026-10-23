import type { IFileExtension } from '../../src/types';

import { join } from 'path';

import { expect } from 'chai';
import { cloneDeep, isEmpty, isEqual, uniqBy } from 'lodash';

import { existsAsync } from '../../src/common/fsAsync';
import { ConfigManager } from '../../src/configuration/configManager';
import { constants } from '../../src/constants';
import { extensions as files } from '../../src/iconsManifest/supportedExtensions';
import * as enums from '../../src/types/enums';

describe('Specifications of supported extensions: tests', function () {
  context('ensures that', function () {
    const supportedFiles = cloneDeep(files.supported);
    let testFiles: IFileExtension[];

    beforeEach(function () {
      testFiles = cloneDeep(supportedFiles);
    });

    it(`an 'extension' declaration should NOT have a leading dot`, function () {
      testFiles
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

    it('all Angular icons are disabled by default', function () {
      const ngIcons = testFiles.filter((file: IFileExtension) =>
        file.icon.startsWith('ng_'),
      );

      expect(ngIcons).to.not.be.empty;
      ngIcons.forEach((file: IFileExtension) => {
        expect(file.disabled).to.be.true;
      });
    });

    it('all Nest icons are disabled by default', function () {
      const nestIcons = testFiles.filter((file: IFileExtension) =>
        file.icon.startsWith('nest_'),
      );

      expect(nestIcons).to.not.be.empty;
      nestIcons.forEach((file: IFileExtension) => {
        expect(file.disabled).to.be.true;
      });
    });

    context('each supported', function () {
      const iconsDirPath = ConfigManager.iconsDir;

      function ensureFormat(file: IFileExtension): void {
        file.format ??= enums.FileFormat.svg;
      }

      context('extension', function () {
        it('defaults a missing format to svg', function () {
          const file = { icon: 'example' } as IFileExtension;
          ensureFormat(file);
          expect(file.format).to.equal(enums.FileFormat.svg);
        });

        it('preserves an explicit format', function () {
          const file = {
            icon: 'example',
            format: enums.FileFormat.svg,
          } as IFileExtension;
          ensureFormat(file);
          expect(file.format).to.equal(enums.FileFormat.svg);
        });

        it('has an associated icon file', async function () {
          for (const supportedFile of testFiles) {
            ensureFormat(supportedFile);
            const filename =
              `${constants.iconsManifest.fileTypePrefix}${supportedFile.icon}` +
              `${constants.iconsManifest.iconSuffix}.${
                enums.FileFormat[supportedFile.format] as string
              }`;
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
              _file: IFileExtension,
              file: IFileExtension,
            ): boolean =>
              (!Reflect.has(_file, 'disabled') ||
                _file.disabled !== file.disabled) &&
              !Reflect.has(_file, 'filename') &&
              !Reflect.has(file, 'filename') &&
              !isEqual(_file.extensions, file.extensions) &&
              !_file.checked &&
              _file.icon === file.icon;

            testFiles.forEach((file: IFileExtension) => {
              file.checked = true;
              const otherDeclarations: IFileExtension[] = testFiles.filter(
                (_file: IFileExtension) => checker(_file, file),
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

              testFiles.forEach((file: IFileExtension) => {
                expect(testCase(file)).to.be.false;
              });
            });
          });
        });

        context('that has a light theme version', function () {
          it('has an associated icon file', async function () {
            for (const supportedFile of testFiles.filter(
              (file: IFileExtension) => file.light,
            )) {
              ensureFormat(supportedFile);
              const filename = `${constants.iconsManifest.fileTypeLightPrefix}${
                supportedFile.icon
              }${constants.iconsManifest.iconSuffix}.${
                enums.FileFormat[supportedFile.format] as string
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
