// tslint:disable only-arrow-functions
// tslint:disable no-unused-expression
import { expect } from 'chai';
import * as sinon from 'sinon';
import { cloneDeep } from 'lodash';
import * as fs from 'fs';
import {
  IconsGenerator,
  CustomsMerger,
  ManifestBuilder,
} from '../../src/iconsManifest';
import {
  IFileCollection,
  IFolderCollection,
  IIconsGenerator,
  IVSCodeManager,
  IConfigManager,
  IVSIcons,
  schema as iconsManifest,
} from '../../src/models';
import { VSCodeManager } from '../../src/vscode/vscodeManager';
import { ConfigManager } from '../../src/configuration/configManager';
import { constants } from '../../src/constants';
import { Utils } from '../../src/utils';
import { ErrorHandler } from '../../src/errorHandler';
import { extensions as extFiles } from '../../src/iconsManifest/supportedExtensions';
import { extensions as extFolders } from '../../src/iconsManifest/supportedFolders';
import { extensions as fixtFiles } from '../fixtures/supportedExtensions';
import { extensions as fixtFolders } from '../fixtures/supportedFolders';
import { vsicons } from '../fixtures/vsicons';
import * as manifest from '../../../package.json';

describe('IconsGenerator: tests', function () {
  context('ensures that', function () {
    let sandbox: sinon.SinonSandbox;
    let vscodeManagerStub: sinon.SinonStubbedInstance<IVSCodeManager>;
    let configManagerStub: sinon.SinonStubbedInstance<IConfigManager>;
    let onDidChangeConfigurationStub: sinon.SinonStub;
    let mergeStub: sinon.SinonStub;
    let buildManifestStub: sinon.SinonStub;

    let iconsGenerator: IIconsGenerator;
    let filesCollection: IFileCollection;
    let foldersCollection: IFolderCollection;
    let vsiconsClone: IVSIcons;

    beforeEach(function () {
      sandbox = sinon.createSandbox();

      vscodeManagerStub = sinon.createStubInstance<IVSCodeManager>(
        VSCodeManager
      );
      sandbox.stub(vscodeManagerStub, 'context').get(() => ({
        subscriptions: [],
      }));
      onDidChangeConfigurationStub = sandbox.stub();
      sandbox.stub(vscodeManagerStub, 'workspace').get(() => ({
        onDidChangeConfiguration: onDidChangeConfigurationStub,
      }));
      sandbox.stub(vscodeManagerStub, 'version').get(() => '1.27.1');
      vscodeManagerStub.getAppUserDirPath.returns('/path/to/app/user/dir/');

      configManagerStub = sandbox.createStubInstance<IConfigManager>(
        ConfigManager
      );
      vsiconsClone = cloneDeep(vsicons);
      sandbox.stub(configManagerStub, 'vsicons').get(() => vsiconsClone);

      mergeStub = sandbox.stub(CustomsMerger, 'merge');

      buildManifestStub = sandbox.stub(ManifestBuilder, 'buildManifest');

      iconsGenerator = new IconsGenerator(vscodeManagerStub, configManagerStub);

      filesCollection = {
        default: { file: { icon: 'file', format: 'svg' } },
        supported: [],
      };
      foldersCollection = {
        default: { folder: { icon: 'folder', format: 'svg' } },
        supported: [],
      };
    });

    afterEach(function () {
      vsiconsClone = null;
      iconsGenerator = null;
      sandbox.restore();
    });

    context(
      `on instantiation, an event listener for configuration changes`,
      function () {
        it(`is registered, when an instance of 'vscodeManager' is passed`, function () {
          expect(
            onDidChangeConfigurationStub.calledOnceWithExactly(
              // @ts-ignore
              iconsGenerator.didChangeConfigurationListener,
              iconsGenerator,
              vscodeManagerStub.context.subscriptions
            )
          ).to.be.true;
        });

        it(`is NOT registered, when an instance of 'vscodeManager' is NOT passed`, function () {
          onDidChangeConfigurationStub.reset();
          new IconsGenerator();

          expect(onDidChangeConfigurationStub.called).to.be.false;
        });
      }
    );

    context(`generating the icons manifest`, function () {
      context(`when NO custom definitions are provided`, function () {
        it(`generates the default icons manifest`, function () {
          iconsGenerator.generateIconsManifest();

          expect(
            buildManifestStub.calledOnceWithExactly(extFiles, extFolders)
          ).to.be.true;
        });
      });

      context(`when custom definitions are provided`, function () {
        beforeEach(function () {
          mergeStub.returns({
            files: filesCollection,
            folders: foldersCollection,
          });
          buildManifestStub.returns({ hidesExplorerArrows: undefined });
        });

        it(`throws an Error, when 'configManager' is NOT instantiated`, function () {
          expect(() =>
            new IconsGenerator().generateIconsManifest(fixtFiles, fixtFolders)
          ).to.throw(ReferenceError, /'configManager' not set to an instance/);
        });

        context(`generates the icons manifest`, function () {
          it(`including the custom definitions`, function () {
            iconsGenerator.generateIconsManifest(fixtFiles, fixtFolders);

            expect(
              buildManifestStub.calledOnceWithExactly(
                filesCollection,
                foldersCollection,
                ''
              )
            ).to.be.true;
          });

          it(`using the custom icons folder path`, function () {
            vsiconsClone.customIconFolderPath = '/custom/icons/foder/path';
            configManagerStub.getCustomIconsDirPath.returns(
              vsiconsClone.customIconFolderPath
            );

            iconsGenerator.generateIconsManifest(fixtFiles, fixtFolders);

            expect(
              configManagerStub.getCustomIconsDirPath.calledOnceWithExactly(
                vsiconsClone.customIconFolderPath
              )
            ).to.be.true;
            expect(
              buildManifestStub.calledOnceWithExactly(
                filesCollection,
                foldersCollection,
                vsiconsClone.customIconFolderPath
              )
            ).to.be.true;
          });

          it(`correctly sets the 'hidesExplorerArrows' preset`, function () {
            vsiconsClone.presets.hideExplorerArrows = true;

            expect(
              iconsGenerator.generateIconsManifest(fixtFiles, fixtFolders)
                .hidesExplorerArrows
            ).to.be.true;
          });
        });
      });
    });

    context(`persisting the icons manifest`, function () {
      let existsSyncStub: sinon.SinonStub;
      let mkdirSyncStub: sinon.SinonStub;
      let writeFileSyncStub: sinon.SinonStub;
      let logErrorStub: sinon.SinonStub;
      let pathUnixJoinStub: sinon.SinonStub;
      let infoStub: sinon.SinonStub;

      beforeEach(function () {
        existsSyncStub = sandbox.stub(fs, 'existsSync');
        mkdirSyncStub = sandbox.stub(fs, 'mkdirSync');
        writeFileSyncStub = sandbox.stub(fs, 'writeFileSync');
        logErrorStub = sandbox.stub(ErrorHandler, 'logError');
        pathUnixJoinStub = sandbox.stub(Utils, 'pathUnixJoin').returns('');
        infoStub = sandbox.stub(console, 'info');
      });

      it(`creates the 'out' directory, when it doesn't exist`, function () {
        existsSyncStub.returns(false);

        iconsGenerator.persist(iconsManifest);

        expect(mkdirSyncStub.calledOnce).to.be.true;
        expect(mkdirSyncStub.calledWithMatch(/out[\/|\\]src/)).to.be.true;
      });

      it(`writes the icons manifest to storage`, function () {
        const stringified = JSON.stringify(iconsManifest, null, 2);
        const filePath = `./${constants.iconsManifest.filename}`;
        pathUnixJoinStub.returns(filePath);

        iconsGenerator.persist(iconsManifest);

        expect(
          writeFileSyncStub.calledOnceWithExactly(filePath, stringified)
        ).to.be.true;
      });

      it(`prints a success message to 'console' stdout`, function () {
        iconsGenerator.persist(iconsManifest);

        expect(
          infoStub.calledOnceWithExactly(
            `[${
              constants.extension.name
            }] Icons manifest file successfully generated!`
          )
        ).to.be.true;
      });

      it(`logs an Error, when creating the 'out' directory fails`, function () {
        const error = new Error('test');
        mkdirSyncStub.throws(error);
        existsSyncStub.returns(false);

        iconsGenerator.persist(iconsManifest);

        expect(mkdirSyncStub.calledOnce).to.be.true;
        expect(mkdirSyncStub.calledWithMatch(/out[\/|\\]src/)).to.be.true;
        expect(logErrorStub.calledOnceWithExactly(error)).to.be.true;
      });

      it(`logs an Error, when writing to storage fails`, function () {
        const error = new Error('test');
        writeFileSyncStub.throws(error);

        return iconsGenerator
          .persist(iconsManifest)
          .then(
            () => expect(logErrorStub.calledOnceWithExactly(error)).to.be.true
          );
      });

      it(`logs an Error, when 'updateFile' fails`, function () {
        const error = new Error();
        const updateFileStub = sandbox.stub(Utils, 'updateFile').rejects(error);
        sandbox.stub(Utils, 'getRelativePath').returns('./');
        existsSyncStub.returns(true);

        return iconsGenerator.persist(iconsManifest, true).then(() => {
          expect(updateFileStub.calledOnce).to.be.true;
          expect(logErrorStub.calledOnceWithExactly(error)).to.be.true;
        });
      });

      context(`the 'package.json' file gets`, function () {
        let getRelativePathStub: sinon.SinonStub;
        let updateFileStub: sinon.SinonStub;

        beforeEach(function () {
          getRelativePathStub = sandbox.stub(Utils, 'getRelativePath');
          updateFileStub = sandbox.stub(Utils, 'updateFile');
        });

        context(`NOT updated`, function () {
          it(`when set NOT to`, function () {
            iconsGenerator.persist(iconsManifest, false);

            expect(updateFileStub.called).to.be.false;
          });

          context(`when the icon theme path`, function () {
            it(`does NOT exist`, function () {
              const originalValue = manifest.contributes.iconThemes[0].path;
              delete manifest.contributes.iconThemes[0].path;

              iconsGenerator.persist(iconsManifest, true);

              manifest.contributes.iconThemes[0].path = originalValue;

              expect(updateFileStub.called).to.be.false;
            });

            it(`does NOT need to be changed`, function () {
              getRelativePathStub.returns('out/src/');

              iconsGenerator.persist(iconsManifest, true);

              expect(updateFileStub.called).to.be.false;
            });
          });
        });

        context(`updated`, function () {
          context(`and the path property gets`, function () {
            context(`NOT updated`, function () {
              it(`when it can NOT be found`, function () {
                updateFileStub.callsArgWith(1, ['']).resolves();

                return iconsGenerator.persist(iconsManifest, true).then(() => {
                  expect(updateFileStub.calledOnce).to.be.true;
                  expect(infoStub.calledTwice).to.be.true;
                  expect(
                    infoStub.calledWithExactly(
                      `[${
                        constants.extension.name
                      }] Icons path in 'package.json' updated`
                    )
                  ).to.be.true;
                });
              });
            });

            it(`updated`, function () {
              getRelativePathStub.returns('some/path/');
              updateFileStub
                .callsArgWith(1, [
                  `  "path": "${constants.iconsManifest.filename}"`,
                ])
                .resolves();

              return iconsGenerator.persist(iconsManifest, true).then(() => {
                expect(updateFileStub.calledOnce).to.be.true;
                expect(infoStub.calledTwice).to.be.true;
                expect(
                  infoStub.calledWithExactly(
                    `[${
                      constants.extension.name
                    }] Icons path in 'package.json' updated`
                  )
                ).to.be.true;
              });
            });
          });

          it(`and a success message is printed to 'console' stdout`, function () {
            getRelativePathStub.returns('some/path/');
            updateFileStub.callsArgWith(1, ['']).resolves();

            return iconsGenerator.persist(iconsManifest, true).then(() => {
              expect(updateFileStub.calledOnce).to.be.true;
              expect(infoStub.calledTwice).to.be.true;
              expect(
                infoStub.calledWithExactly(
                  `[${
                    constants.extension.name
                  }] Icons path in 'package.json' updated`
                )
              ).to.be.true;
            });
          });
        });
      });
    });

    context(`the listener on configuration changes`, function () {
      context(`throws an Error`, function () {
        it(`when the 'event' object does NOT exists`, function () {
          expect(() =>
            onDidChangeConfigurationStub.callArgOn(0, iconsGenerator)
          ).to.throw(Error, /Unsupported 'vscode' version: \d+\.\d+\.\d+/);
        });

        it(`when an 'event' object is NOT of the correct type`, function () {
          expect(() =>
            onDidChangeConfigurationStub.callArgOnWith(0, iconsGenerator, {})
          ).to.throw(Error, /Unsupported 'vscode' version: \d+\.\d+\.\d+/);
        });
      });

      context(`sets the 'affected angular preset' to`, function () {
        it(`true`, function () {
          onDidChangeConfigurationStub.callArgOnWith(0, iconsGenerator, {
            affectsConfiguration: () => true,
          });

          // @ts-ignore
          expect(iconsGenerator.affectedPresets.angular).to.be.true;
        });

        it(`false`, function () {
          onDidChangeConfigurationStub.callArgOnWith(0, iconsGenerator, {
            affectsConfiguration: () => false,
          });

          // @ts-ignore
          expect(iconsGenerator.affectedPresets.angular).to.be.false;
        });
      });
    });
  });
});
