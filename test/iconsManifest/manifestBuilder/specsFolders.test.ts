// tslint:disable only-arrow-functions
// tslint:disable no-unused-expression
import { expect } from 'chai';
import { existsSync } from 'fs';
import { join } from 'path';
import { constants } from '../../../src/constants';
import { FileFormat } from '../../../src/models';
import { extensions as folders } from '../../../src/iconsManifest/supportedFolders';

describe('Specifications of supported folders: tests', function () {
  context('ensures that', function () {
    const iconsDirPath = join(__dirname, '../../../../icons');

    context('each supported', function () {
      context('folder', function () {
        it('has an associated icon file', function () {
          folders.supported.forEach(folder => {
            const filename =
              `${constants.iconsManifest.folderTypePrefix}${folder.icon}` +
              `${constants.iconsManifest.iconSuffix}.${
                FileFormat[folder.format]
              }`;
            const iconFilePath = join(iconsDirPath, filename);

            expect(existsSync(iconFilePath)).to.be.true;
          });
        });

        it('has an associated opened icon file', function () {
          folders.supported.forEach(folder => {
            const filename =
              `${constants.iconsManifest.folderTypePrefix}${
                folder.icon
              }_opened` +
              `${constants.iconsManifest.iconSuffix}.${
                FileFormat[folder.format]
              }`;
            const iconFilePath = join(iconsDirPath, filename);

            expect(existsSync(iconFilePath)).to.be.true;
          });
        });

        context('that has a light theme version', function () {
          it('has an associated icon file', function () {
            folders.supported.filter(folder => folder.light).forEach(folder => {
              const filename =
                `${constants.iconsManifest.folderTypePrefix}${folder.icon}` +
                `${constants.iconsManifest.iconSuffix}.${
                  FileFormat[folder.format]
                }`;
              const iconFilePath = join(iconsDirPath, filename);

              expect(existsSync(iconFilePath)).to.be.true;
            });
          });

          it('has an associated opened icon file', function () {
            folders.supported.filter(folder => folder.light).forEach(folder => {
              const filename =
                `${constants.iconsManifest.folderTypePrefix}${
                  folder.icon
                }_opened` +
                `${constants.iconsManifest.iconSuffix}.${
                  FileFormat[folder.format]
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
