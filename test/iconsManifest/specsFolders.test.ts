/* eslint-disable prefer-arrow-callback */
/* eslint-disable no-unused-expressions */
import { expect } from 'chai';
import { isEmpty, isEqual, uniqBy } from 'lodash';
import { join } from 'path';
import { existsAsync } from '../../src/common/fsAsync';
import { ConfigManager } from '../../src/configuration/configManager';
import { constants } from '../../src/constants';
import { extensions as folders } from '../../src/iconsManifest/supportedFolders';
import { FileFormat, IFolderExtension } from '../../src/models';

describe('Specifications of supported folders: tests', function () {
  context('ensures that', function () {
    const iconsDirPath = ConfigManager.iconsDir;

    context('each supported', function () {
      context('folder', function () {
        it('has an associated icon file', async function () {
          await Promise.all(
            folders.supported.map(async (folder: IFolderExtension) => {
              const filename =
                `${constants.iconsManifest.folderTypePrefix}${folder.icon}` +
                `${constants.iconsManifest.iconSuffix}.${
                  FileFormat[folder.format] as string
                }`;
              const iconFilePath = join(iconsDirPath, filename);

              const pathExists = await existsAsync(iconFilePath);

              expect(pathExists).to.be.true;
            }),
          );
        });

        it('has an associated opened icon file', async function () {
          await Promise.all(
            folders.supported.map(async (folder: IFolderExtension) => {
              const filename =
                `${constants.iconsManifest.folderTypePrefix}${folder.icon}_opened` +
                `${constants.iconsManifest.iconSuffix}.${
                  FileFormat[folder.format] as string
                }`;
              const iconFilePath = join(iconsDirPath, filename);

              const pathExists = await existsAsync(iconFilePath);

              expect(pathExists).to.be.true;
            }),
          );
        });

        context('does NOT have', function () {
          it(`duplicate declaration`, function () {
            const unique = uniqBy(folders.supported, JSON.stringify);

            expect(unique).to.have.lengthOf(folders.supported.length);
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

            folders.supported.forEach((folder: IFolderExtension) => {
              folder.checked = true;
              const otherDeclarations: IFolderExtension[] =
                folders.supported.filter((_folder: IFolderExtension) =>
                  checker(_folder, folder),
                );

              expect(otherDeclarations).to.be.empty;
            });
          });

          it(`empty 'extensions' declaration`, function () {
            folders.supported.forEach(
              (folder: IFolderExtension) =>
                expect(isEmpty(folder.extensions)).to.be.false,
            );
          });
        });

        context('that has a light theme version', function () {
          it('has an associated icon file', async function () {
            await Promise.all(
              folders.supported
                .filter((folder: IFolderExtension) => folder.light)
                .map(async (folder: IFolderExtension) => {
                  const filename =
                    `${constants.iconsManifest.folderTypePrefix}${folder.icon}` +
                    `${constants.iconsManifest.iconSuffix}.${
                      FileFormat[folder.format] as string
                    }`;
                  const iconFilePath = join(iconsDirPath, filename);
                  const pathExists = await existsAsync(iconFilePath);

                  expect(pathExists).to.be.true;
                }),
            );
          });

          it('has an associated opened icon file', async function () {
            await Promise.all(
              folders.supported
                .filter((folder: IFolderExtension) => folder.light)
                .map(async (folder: IFolderExtension) => {
                  const filename =
                    `${constants.iconsManifest.folderTypePrefix}${folder.icon}_opened` +
                    `${constants.iconsManifest.iconSuffix}.${
                      FileFormat[folder.format] as string
                    }`;
                  const iconFilePath = join(iconsDirPath, filename);
                  const pathExists = await existsAsync(iconFilePath);

                  expect(pathExists).to.be.true;
                }),
            );
          });
        });
      });
    });
  });
});
