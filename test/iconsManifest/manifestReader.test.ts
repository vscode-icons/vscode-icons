// tslint:disable only-arrow-functions
// tslint:disable no-unused-expression
import { expect } from 'chai';
import * as sinon from 'sinon';
import * as fs from 'fs';
import { ManifestReader } from '../../src/iconsManifest';
import { Projects, PresetNames, IPresets } from '../../src/models';
import { Utils } from '../../src/utils';

describe('ManifestReader: tests', function () {
  context('ensures that', function () {
    let sandbox: sinon.SinonSandbox;
    let readFileStub: sinon.SinonStub;
    let parseJSONStub: sinon.SinonStub;

    beforeEach(function () {
      sandbox = sinon.createSandbox();

      readFileStub = sandbox.stub(fs, 'readFileSync');
      parseJSONStub = sandbox.stub(Utils, 'parseJSON');
    });

    afterEach(function () {
      sandbox.restore();
    });

    context(`function 'getToggledValue'`, function () {
      let presets: IPresets;

      beforeEach(function () {
        presets = {
          angular: false,
          jsOfficial: false,
          tsOfficial: false,
          jsonOfficial: false,
          foldersAllDefaultIcon: false,
          hideFolders: false,
          hideExplorerArrows: false,
        };
      });

      context(`for non icons related presets`, function () {
        it(`returns 'true' when the preset is 'false'`, function () {
          const sut = ManifestReader.getToggledValue(
            PresetNames.hideExplorerArrows,
            presets
          );

          expect(sut).to.be.true;
        });

        it(`returns 'false' when the preset is 'true'`, function () {
          presets.hideExplorerArrows = true;

          const sut = ManifestReader.getToggledValue(
            PresetNames.hideExplorerArrows,
            presets
          );

          expect(sut).to.be.false;
        });
      });

      context(`for folders related presets`, function () {
        context(`'hideFolders'`, function () {
          it(`returns 'true', when folder definitions exists in the icons manifest`, function () {
            const iconManifest =
              '{ "iconDefinitions": { "_folder": { "iconPath": "../../" }, ' +
              '"_fd_aws": {} }, "folderNames": { "aws": "_fd_aws" } }';
            parseJSONStub.returns(JSON.parse(iconManifest));

            const sut = ManifestReader.getToggledValue(
              PresetNames.hideFolders,
              presets
            );

            expect(sut).to.be.true;
          });

          it(`returns 'false', when folder definitions do NOT exist in the icons manifest`, function () {
            const iconManifest =
              '{ "iconDefinitions": { "_folder": { "iconPath": "" } },' +
              '"folderNames": {} }';
            parseJSONStub.returns(JSON.parse(iconManifest));

            const sut = ManifestReader.getToggledValue(
              PresetNames.hideFolders,
              presets
            );

            expect(sut).to.be.false;
          });
        });

        context(`'foldersAllDefaultIcon'`, function () {
          it(`returns 'true', when folder definitions exists in the icons manifest`, function () {
            const iconManifest =
              '{ "iconDefinitions": { "_folder": { "iconPath": "../../" }, ' +
              '"_fd_aws": {} }, "folderNames": { "aws": "_fd_aws" } }';
            parseJSONStub.returns(JSON.parse(iconManifest));

            const sut = ManifestReader.getToggledValue(
              PresetNames.foldersAllDefaultIcon,
              presets
            );

            expect(sut).to.be.true;
          });

          it(`returns 'false', when folder definitions do NOT exist in the icons manifest`, function () {
            const iconManifest =
              '{ "iconDefinitions": { "_folder": { "iconPath": "../../" } }, ' +
              '"folderNames": {} }';
            parseJSONStub.returns(JSON.parse(iconManifest));

            const sut = ManifestReader.getToggledValue(
              PresetNames.foldersAllDefaultIcon,
              presets
            );

            expect(sut).to.be.false;
          });
        });
      });

      context(`for icons related presets`, function () {
        it(`returns 'true', when icons are disabled`, function () {
          const iconManifest = '{ "iconDefinitions": {} }';
          parseJSONStub.returns(JSON.parse(iconManifest));

          const sut = ManifestReader.getToggledValue(
            PresetNames.angular,
            presets
          );

          expect(sut).to.be.true;
        });

        it(`returns 'false', when icons are disabled`, function () {
          const iconManifest = '{ "iconDefinitions": { "_f_ng_icon": {} } }';
          parseJSONStub.returns(JSON.parse(iconManifest));

          const sut = ManifestReader.getToggledValue(
            PresetNames.angular,
            presets
          );

          expect(sut).to.be.false;
        });
      });
    });

    context(`function 'iconsDisabled'`, function () {
      context('detects that specific icons are', function () {
        it('enabled', function () {
          const iconManifest = '{ "iconDefinitions": { "_f_ng_": {} } }';
          parseJSONStub.returns(JSON.parse(iconManifest));

          expect(ManifestReader.iconsDisabled(Projects.angular)).to.be.false;
        });

        it('disabled', function () {
          const iconManifest = '{ "iconDefinitions": { "_f_codecov": {} } }';
          parseJSONStub.returns(JSON.parse(iconManifest));

          expect(ManifestReader.iconsDisabled(Projects.angular)).to.be.true;
        });

        it('disabled, if they do NOT exist', function () {
          parseJSONStub.returns(null);

          expect(ManifestReader.iconsDisabled(Projects.angular)).to.be.true;
        });

        it('assumed disabled, if icon manifest file fails to be loaded', function () {
          readFileStub.throws(Error);

          expect(ManifestReader.iconsDisabled(Projects.angular)).to.be.true;
        });

        context('detects that specific folder icons are', function () {
          it('enabled', function () {
            const iconManifest = '{ "iconDefinitions": { "_fd_aws": {} } }';
            parseJSONStub.returns(JSON.parse(iconManifest));

            expect(ManifestReader.iconsDisabled('aws', false)).to.be.false;
          });

          it('disabled', function () {
            const iconManifest = '{ "iconDefinitions": { "_fd_git": {} } }';
            parseJSONStub.returns(JSON.parse(iconManifest));

            expect(ManifestReader.iconsDisabled('aws', false)).to.be.true;
          });

          it('disabled, if they do NOT exist', function () {
            parseJSONStub.returns(null);

            expect(ManifestReader.iconsDisabled('aws', false)).to.be.true;
          });

          it('assumed disabled, if icon manifest file fails to be loaded', function () {
            readFileStub.throws(Error);

            expect(ManifestReader.iconsDisabled('aws', false)).to.be.true;
          });
        });
      });
    });

    context(`function 'folderIconsDisabled'`, function () {
      context(
        'detects that folders icons, for specific presets, are',
        function () {
          it('disabled, if they do NOT exist', function () {
            parseJSONStub.returns(null);

            expect(ManifestReader.folderIconsDisabled('')).to.be.true;
          });

          it('assumed disabled, if reading the icon manifest file fails', function () {
            readFileStub.throws(Error);

            expect(ManifestReader.folderIconsDisabled('')).to.be.true;
          });

          context(`for 'hideFolders' preset`, function () {
            it('enabled, when specific folder icons do exist', function () {
              const iconManifest =
                '{ "iconDefinitions": { "_folder": { "iconPath": "" }, ' +
                '"_fd_aws": {} }, "folderNames": { "aws": "_fd_aws" } }';
              parseJSONStub.returns(JSON.parse(iconManifest));

              expect(
                ManifestReader.folderIconsDisabled('hideFolders')
              ).to.be.false;
            });

            it('enabled, when default folder icon path do exists', function () {
              const iconManifest =
                '{ "iconDefinitions": { "_folder": { "iconPath": "../../" } },' +
                '"folderNames": {} }';
              parseJSONStub.returns(JSON.parse(iconManifest));

              expect(
                ManifestReader.folderIconsDisabled('hideFolders')
              ).to.be.false;
            });

            it('disabled', function () {
              const iconManifest =
                '{ "iconDefinitions": { "_folder": { "iconPath": "" } }, ' +
                '"folderNames": {} }';
              parseJSONStub.returns(JSON.parse(iconManifest));

              expect(
                ManifestReader.folderIconsDisabled('hideFolders')
              ).to.be.true;
            });
          });

          context(`for 'foldersAllDefaultIcon' preset are`, function () {
            it('enabled, when specific folder icons do exist', function () {
              const iconManifest =
                '{ "iconDefinitions": { "_folder": { "iconPath": "" }, ' +
                '"_fd_aws": {} }, "folderNames": { "aws": "_fd_aws" } }';
              parseJSONStub.returns(JSON.parse(iconManifest));

              expect(
                ManifestReader.folderIconsDisabled('foldersAllDefaultIcon')
              ).to.be.false;
            });

            it('disabled, when specific folder icons do NOT exist', function () {
              const iconManifest =
                '{ "iconDefinitions": { "_folder": { "iconPath": "../../" } }, ' +
                '"folderNames": {} }';
              parseJSONStub.returns(JSON.parse(iconManifest));

              expect(
                ManifestReader.folderIconsDisabled('foldersAllDefaultIcon')
              ).to.be.true;
            });
          });

          context(`for any other preset`, function () {
            it(`throws an Error`, function () {
              const iconManifest =
                '{ "iconDefinitions": { "_folder": { "iconPath": "" }, ' +
                '"_fd_aws": {} }, "folderNames": { "aws": "_fd_aws" } }';
              parseJSONStub.returns(JSON.parse(iconManifest));

              Reflect.ownKeys(PresetNames)
                .filter(
                  (preset: string) =>
                    isNaN(parseInt(preset, 10)) &&
                    [
                      PresetNames.hideFolders,
                      PresetNames.foldersAllDefaultIcon,
                    ].every(prst => prst !== PresetNames[preset])
                )
                .forEach((preset: string) => {
                  expect(() =>
                    ManifestReader.folderIconsDisabled(preset)
                  ).to.throw(Error, /Not Implemented/);
                });
            });
          });
        }
      );
    });
  });
});
