import type { IFolderExtension } from '../../src/types';

import { join } from 'path';

import { expect } from 'chai';
import { cloneDeep, isEmpty, isEqual, uniqBy } from 'lodash';

import { existsAsync } from '../../src/common/fsAsync';
import { ConfigManager } from '../../src/configuration/configManager';
import { constants } from '../../src/constants';
import { extensions as folders } from '../../src/iconsManifest/supportedFolders';
import * as enums from '../../src/types/enums';
import { Utils } from '../../src/utils';

describe('Specifications of supported folders: tests', function () {
  context('ensures that', function () {
    const iconsDirPath = ConfigManager.iconsDir;
    const supportedFolders = cloneDeep(folders.supported);
    let testFolders: IFolderExtension[];

    beforeEach(function () {
      testFolders = cloneDeep(supportedFolders);
    });

    context('each supported', function () {
      context('folder', function () {
        it('defaults a missing format to svg', function () {
          const folder = { icon: 'example' } as IFolderExtension;
          folder.format = Utils.fileFormatToString(folder.format);
          expect(
            folder.format,
            `Folder format not defaulted to svg: ${folder.format}`,
          ).to.equal(`.${enums.FileFormat[enums.FileFormat.svg]}`);
        });

        it('preserves an explicit format', function () {
          const folder = {
            icon: 'example',
            format: enums.FileFormat.svg,
          } as IFolderExtension;
          folder.format = Utils.fileFormatToString(folder.format);

          expect(
            folder.format,
            `Folder format not preserved: ${folder.format}`,
          ).to.equal(`.${enums.FileFormat[enums.FileFormat.svg]}`);
        });

        it('has an associated icon file', async function () {
          await Promise.all(
            testFolders.map(async (folder: IFolderExtension) => {
              folder.format = Utils.fileFormatToString(folder.format);
              const filename =
                `${constants.iconsManifest.folderTypePrefix}${folder.icon}` +
                `${constants.iconsManifest.iconSuffix}${folder.format}`;
              const iconFilePath = join(iconsDirPath, filename);

              const pathExists = await existsAsync(iconFilePath);

              expect(pathExists, `Icon file not found: ${iconFilePath}`).to.be
                .true;
            }),
          );
        });

        it('has an associated opened icon file', async function () {
          await Promise.all(
            testFolders.map(async (folder: IFolderExtension) => {
              folder.format = Utils.fileFormatToString(folder.format);
              const filename =
                `${constants.iconsManifest.folderTypePrefix}${folder.icon}_opened` +
                `${constants.iconsManifest.iconSuffix}${folder.format}`;
              const iconFilePath = join(iconsDirPath, filename);

              const pathExists = await existsAsync(iconFilePath);

              expect(pathExists, `Icon file not found: ${iconFilePath}`).to.be
                .true;
            }),
          );
        });

        context('does NOT have', function () {
          it(`duplicate declaration`, function () {
            const unique = uniqBy(testFolders, JSON.stringify);

            expect(unique).to.have.lengthOf(testFolders.length);
          });

          it(`same declaration with different 'extensions'`, function () {
            const checker = (
              _folder: IFolderExtension,
              folder: IFolderExtension,
            ): boolean =>
              (!Reflect.has(_folder, 'disabled') ||
                _folder.disabled !== folder.disabled) &&
              !Reflect.has(_folder, 'filename') &&
              !isEqual(_folder.extensions, folder.extensions) &&
              !_folder.checked &&
              _folder.icon === folder.icon;

            testFolders.forEach((folder: IFolderExtension) => {
              folder.checked = true;
              const otherDeclarations: IFolderExtension[] = testFolders.filter(
                (_folder: IFolderExtension) => checker(_folder, folder),
              );

              expect(otherDeclarations).to.be.empty;
            });
          });

          it(`empty 'extensions' declaration`, function () {
            testFolders.forEach(
              (folder: IFolderExtension) =>
                expect(isEmpty(folder.extensions)).to.be.false,
            );
          });
        });

        context('that has a light theme version', function () {
          it('has an associated icon file', async function () {
            await Promise.all(
              testFolders
                .filter((folder: IFolderExtension) => folder.light)
                .map(async (folder: IFolderExtension) => {
                  folder.format = Utils.fileFormatToString(folder.format);
                  const filename =
                    `${constants.iconsManifest.folderTypePrefix}${folder.icon}` +
                    `${constants.iconsManifest.iconSuffix}${folder.format}`;
                  const iconFilePath = join(iconsDirPath, filename);
                  const pathExists = await existsAsync(iconFilePath);

                  expect(pathExists, `Icon file not found: ${iconFilePath}`).to
                    .be.true;
                }),
            );
          });

          it('has an associated opened icon file', async function () {
            await Promise.all(
              testFolders
                .filter((folder: IFolderExtension) => folder.light)
                .map(async (folder: IFolderExtension) => {
                  folder.format = Utils.fileFormatToString(folder.format);
                  const filename =
                    `${constants.iconsManifest.folderTypePrefix}${folder.icon}_opened` +
                    `${constants.iconsManifest.iconSuffix}${folder.format}`;
                  const iconFilePath = join(iconsDirPath, filename);
                  const pathExists = await existsAsync(iconFilePath);

                  expect(pathExists, `Icon file not found: ${iconFilePath}`).to
                    .be.true;
                }),
            );
          });
        });
      });
    });
  });
});
