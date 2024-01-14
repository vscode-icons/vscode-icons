/* eslint-disable prefer-arrow-callback */
/* eslint-disable no-unused-expressions */
import { expect } from 'chai';
import * as sinon from 'sinon';
import * as fsAsync from '../../../src/common/fsAsync';
import { ManifestReader } from '../../../src/iconsManifest';
import { Projects, PresetNames, IPresets } from '../../../src/models';
import { Utils } from '../../../src/utils';

describe('ManifestReader: tests', function () {
  context('ensures that', function () {
    let sandbox: sinon.SinonSandbox;
    let readFileAsyncStub: sinon.SinonStub;
    let parseJSONStub: sinon.SinonStub;

    beforeEach(function () {
      sandbox = sinon.createSandbox();

      readFileAsyncStub = sandbox.stub(fsAsync, 'readFileAsync');
      parseJSONStub = sandbox.stub(Utils, 'parseJSONSafe');
    });

    afterEach(function () {
      sandbox.restore();
    });

    context(`function 'getToggledValue'`, function () {
      let presets: IPresets;

      beforeEach(function () {
        presets = {
          angular: false,
          nestjs: false,
          jsOfficial: false,
          tsOfficial: false,
          jsonOfficial: false,
          foldersAllDefaultIcon: false,
          hideFolders: false,
          hideExplorerArrows: false,
        };
      });

      context(`for non icons related presets`, function () {
        it(`returns 'true' when the preset is 'false'`, async function () {
          const sut = await ManifestReader.getToggledValue(
            PresetNames.hideExplorerArrows,
            presets,
          );

          expect(sut).to.be.true;
        });

        it(`returns 'false' when the preset is 'true'`, async function () {
          presets.hideExplorerArrows = true;

          const sut = await ManifestReader.getToggledValue(
            PresetNames.hideExplorerArrows,
            presets,
          );

          expect(sut).to.be.false;
        });
      });

      context(`for folders related presets`, function () {
        context(`'hideFolders'`, function () {
          it(`returns 'true', when folder definitions exists in the icons manifest`, async function () {
            const iconManifest =
              '{ "iconDefinitions": { "_folder": { "iconPath": "../../" }, ' +
              '"_fd_aws": {} }, "folderNames": { "aws": "_fd_aws" } }';
            parseJSONStub.returns(JSON.parse(iconManifest));

            const sut = await ManifestReader.getToggledValue(
              PresetNames.hideFolders,
              presets,
            );

            expect(sut).to.be.true;
          });

          it(`returns 'false', when folder definitions do NOT exist in the icons manifest`, async function () {
            const iconManifest =
              '{ "iconDefinitions": { "_folder": { "iconPath": "" } },' +
              '"folderNames": {} }';
            parseJSONStub.returns(JSON.parse(iconManifest));

            const sut = await ManifestReader.getToggledValue(
              PresetNames.hideFolders,
              presets,
            );

            expect(sut).to.be.false;
          });
        });

        context(`'foldersAllDefaultIcon'`, function () {
          it(`returns 'true', when folder definitions exists in the icons manifest`, async function () {
            const iconManifest =
              '{ "iconDefinitions": { "_folder": { "iconPath": "../../" }, ' +
              '"_fd_aws": {} }, "folderNames": { "aws": "_fd_aws" } }';
            parseJSONStub.returns(JSON.parse(iconManifest));

            const sut = await ManifestReader.getToggledValue(
              PresetNames.foldersAllDefaultIcon,
              presets,
            );

            expect(sut).to.be.true;
          });

          it(`returns 'false', when folder definitions do NOT exist in the icons manifest`, async function () {
            const iconManifest =
              '{ "iconDefinitions": { "_folder": { "iconPath": "../../" } }, ' +
              '"folderNames": {} }';
            parseJSONStub.returns(JSON.parse(iconManifest));

            const sut = await ManifestReader.getToggledValue(
              PresetNames.foldersAllDefaultIcon,
              presets,
            );

            expect(sut).to.be.false;
          });
        });
      });

      context(`for icons related presets`, function () {
        it(`returns 'true', when icons are disabled`, async function () {
          const iconManifest = '{ "iconDefinitions": {} }';
          parseJSONStub.returns(JSON.parse(iconManifest));

          const sut = await ManifestReader.getToggledValue(
            PresetNames.angular,
            presets,
          );

          expect(sut).to.be.true;
        });

        it(`returns 'false', when icons are disabled`, async function () {
          const iconManifest = '{ "iconDefinitions": { "_f_ng_icon": {} } }';
          parseJSONStub.returns(JSON.parse(iconManifest));

          const sut = await ManifestReader.getToggledValue(
            PresetNames.angular,
            presets,
          );

          expect(sut).to.be.false;
        });
      });
    });

    context(`function 'iconsDisabled'`, function () {
      context('detects that specific icons are', function () {
        it('enabled', async function () {
          const iconManifest = '{ "iconDefinitions": { "_f_ng_": {} } }';
          parseJSONStub.returns(JSON.parse(iconManifest));

          const sut = await ManifestReader.iconsDisabled(Projects.angular);

          expect(sut).to.be.false;
        });

        it('disabled', async function () {
          const iconManifest = '{ "iconDefinitions": { "_f_codecov": {} } }';
          parseJSONStub.returns(JSON.parse(iconManifest));

          const sut = await ManifestReader.iconsDisabled(Projects.angular);

          expect(sut).to.be.true;
        });

        it('disabled, if they do NOT exist', async function () {
          parseJSONStub.returns(null);

          const sut = await ManifestReader.iconsDisabled(Projects.angular);

          expect(sut).to.be.true;
        });

        it('assumed disabled, if icon manifest file fails to be loaded', async function () {
          readFileAsyncStub.throws(Error);

          const sut = await ManifestReader.iconsDisabled(Projects.angular);

          expect(sut).to.be.true;
        });

        context('detects that specific folder icons are', function () {
          it('enabled', async function () {
            const iconManifest = '{ "iconDefinitions": { "_fd_aws": {} } }';
            parseJSONStub.returns(JSON.parse(iconManifest));

            const sut = await ManifestReader.iconsDisabled('aws', false);

            expect(sut).to.be.false;
          });

          it('disabled', async function () {
            const iconManifest = '{ "iconDefinitions": { "_fd_git": {} } }';
            parseJSONStub.returns(JSON.parse(iconManifest));

            const sut = await ManifestReader.iconsDisabled('aws', false);

            expect(sut).to.be.true;
          });

          it('disabled, if they do NOT exist', async function () {
            parseJSONStub.returns(null);

            const sut = await ManifestReader.iconsDisabled('aws', false);

            expect(sut).to.be.true;
          });

          it('assumed disabled, if icon manifest file fails to be loaded', async function () {
            readFileAsyncStub.throws(Error);

            const sut = await ManifestReader.iconsDisabled('aws', false);

            expect(sut).to.be.true;
          });
        });
      });
    });

    context(`function 'folderIconsDisabled'`, function () {
      context(
        'detects that folders icons, for specific presets, are',
        function () {
          it('disabled, if they do NOT exist', async function () {
            parseJSONStub.returns(null);

            const sut = await ManifestReader.folderIconsDisabled('');

            expect(sut).to.be.true;
          });

          it('assumed disabled, if reading the icon manifest file fails', async function () {
            readFileAsyncStub.throws(Error);

            const sut = await ManifestReader.folderIconsDisabled('');

            expect(sut).to.be.true;
          });

          context(`for 'hideFolders' preset`, function () {
            it('enabled, when specific folder icons do exist', async function () {
              const iconManifest =
                '{ "iconDefinitions": { "_folder": { "iconPath": "" }, ' +
                '"_fd_aws": {} }, "folderNames": { "aws": "_fd_aws" } }';
              parseJSONStub.returns(JSON.parse(iconManifest));

              const sut =
                await ManifestReader.folderIconsDisabled('hideFolders');

              expect(sut).to.be.false;
            });

            it('enabled, when default folder icon path do exists', async function () {
              const iconManifest =
                '{ "iconDefinitions": { "_folder": { "iconPath": "../../" } },' +
                '"folderNames": {} }';
              parseJSONStub.returns(JSON.parse(iconManifest));

              const sut =
                await ManifestReader.folderIconsDisabled('hideFolders');

              expect(sut).to.be.false;
            });

            it('disabled', async function () {
              const iconManifest =
                '{ "iconDefinitions": { "_folder": { "iconPath": "" } }, ' +
                '"folderNames": {} }';
              parseJSONStub.returns(JSON.parse(iconManifest));

              const sut =
                await ManifestReader.folderIconsDisabled('hideFolders');

              expect(sut).to.be.true;
            });
          });

          context(`for 'foldersAllDefaultIcon' preset are`, function () {
            it('enabled, when specific folder icons do exist', async function () {
              const iconManifest =
                '{ "iconDefinitions": { "_folder": { "iconPath": "" }, ' +
                '"_fd_aws": {} }, "folderNames": { "aws": "_fd_aws" } }';
              parseJSONStub.returns(JSON.parse(iconManifest));

              const sut = await ManifestReader.folderIconsDisabled(
                'foldersAllDefaultIcon',
              );

              expect(sut).to.be.false;
            });

            it('disabled, when specific folder icons do NOT exist', async function () {
              const iconManifest =
                '{ "iconDefinitions": { "_folder": { "iconPath": "../../" } }, ' +
                '"folderNames": {} }';
              parseJSONStub.returns(JSON.parse(iconManifest));

              const sut = await ManifestReader.folderIconsDisabled(
                'foldersAllDefaultIcon',
              );

              expect(sut).to.be.true;
            });
          });

          context(`for any other preset`, function () {
            it(`throws an Error`, function () {
              const iconManifest =
                '{ "iconDefinitions": { "_folder": { "iconPath": "" }, ' +
                '"_fd_aws": {} }, "folderNames": { "aws": "_fd_aws" } }';
              parseJSONStub.returns(JSON.parse(iconManifest));

              void Reflect.ownKeys(PresetNames)
                .filter(
                  (preset: string) =>
                    isNaN(parseInt(preset, 10)) &&
                    [
                      PresetNames.hideFolders,
                      PresetNames.foldersAllDefaultIcon,
                    ].every(
                      (prst: PresetNames) => prst !== PresetNames[preset],
                    ),
                )
                .map(async (preset: string) => {
                  try {
                    await ManifestReader.folderIconsDisabled(preset);
                  } catch (error) {
                    expect(error).to.match(/Not Implemented/);
                  }
                });
            });
          });
        },
      );
    });
  });
});
