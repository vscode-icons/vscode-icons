/* eslint-disable prefer-arrow-callback */
/* eslint-disable no-unused-expressions */
import { expect } from 'chai';
import { cloneDeep } from 'lodash';
import { resolve } from 'path';
import * as sinon from 'sinon';
import * as packageJson from '../../../../package.json';
import { ErrorHandler } from '../../../src/common/errorHandler';
import * as fsAsync from '../../../src/common/fsAsync';
import { ConfigManager } from '../../../src/configuration/configManager';
import { constants } from '../../../src/constants';
import {
  CustomsMerger,
  IconsGenerator,
  ManifestBuilder,
} from '../../../src/iconsManifest';
import { extensions as extFiles } from '../../../src/iconsManifest/supportedExtensions';
import { extensions as extFolders } from '../../../src/iconsManifest/supportedFolders';
import {
  IConfigManager,
  IFileCollection,
  IFolderCollection,
  IIconsGenerator,
  IPresets,
  IVSCodeManager,
  IVSIcons,
  schema as iconsManifest,
} from '../../../src/models';
import { IPackageManifest } from '../../../src/models/packageManifest/package';
import { Utils } from '../../../src/utils';
import { VSCodeManager } from '../../../src/vscode/vscodeManager';
import { extensions as fixtFiles } from '../../fixtures/supportedExtensions';
import { extensions as fixtFolders } from '../../fixtures/supportedFolders';
import { vsicons } from '../../fixtures/vsicons';

describe('IconsGenerator: tests', function () {
  context('ensures that', function () {
    let sandbox: sinon.SinonSandbox;
    let vscodeManagerStub: sinon.SinonStubbedInstance<IVSCodeManager>;
    let configManagerStub: sinon.SinonStubbedInstance<IConfigManager>;
    let onDidChangeConfigurationStub: sinon.SinonStub;
    let mergeStub: sinon.SinonStub;
    let buildManifestStaticStub: sinon.SinonStub;

    let iconsGenerator: IIconsGenerator;
    let filesCollection: IFileCollection;
    let foldersCollection: IFolderCollection;
    let vsiconsClone: IVSIcons;

    beforeEach(function () {
      sandbox = sinon.createSandbox();

      vscodeManagerStub =
        sinon.createStubInstance<IVSCodeManager>(VSCodeManager);
      sandbox.stub(vscodeManagerStub, 'context').get(() => ({
        subscriptions: [],
      }));
      onDidChangeConfigurationStub = sandbox.stub();
      sandbox.stub(vscodeManagerStub, 'workspace').get(() => ({
        onDidChangeConfiguration: onDidChangeConfigurationStub,
      }));
      sandbox.stub(vscodeManagerStub, 'version');
      vscodeManagerStub.getAppUserDirPath.returns('/path/to/app/user/dir/');

      configManagerStub =
        sandbox.createStubInstance<IConfigManager>(ConfigManager);
      vsiconsClone = cloneDeep(vsicons);
      sandbox.stub(configManagerStub, 'vsicons').get(() => vsiconsClone);

      sandbox
        .stub(ConfigManager, 'rootDir')
        .get(() => resolve(__dirname, '../../../'));
      sandbox
        .stub(ConfigManager, 'sourceDir')
        .get(() =>
          resolve(
            __dirname,
            '../../../',
            `${constants.extension.outDirName}/${constants.extension.srcDirName}/`,
          ),
        );

      mergeStub = sandbox.stub(CustomsMerger, 'merge');

      buildManifestStaticStub = sandbox.stub(ManifestBuilder, 'buildManifest');

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

    context(`on instantiation`, function () {
      context(`an event listener for configuration changes`, function () {
        it(`is registered, when an instance of 'vscodeManager' is passed`, function () {
          expect(
            onDidChangeConfigurationStub.calledOnceWithExactly(
              // @ts-ignore
              iconsGenerator.didChangeConfigurationListener,
              iconsGenerator,
              vscodeManagerStub.context.subscriptions,
            ),
          ).to.be.true;
        });

        it(`is NOT registered, when an instance of 'vscodeManager' is NOT passed`, function () {
          onDidChangeConfigurationStub.reset();
          new IconsGenerator();

          expect(onDidChangeConfigurationStub.called).to.be.false;
        });
      });
    });

    context(`generating the icons manifest`, function () {
      context(`when NO custom definitions are provided`, function () {
        it(`generates the default icons manifest`, async function () {
          await iconsGenerator.generateIconsManifest();

          expect(
            buildManifestStaticStub.calledOnceWithExactly(extFiles, extFolders),
          ).to.be.true;
        });
      });

      context(`when custom definitions are provided`, function () {
        beforeEach(function () {
          mergeStub.resolves({
            files: filesCollection,
            folders: foldersCollection,
          });
          buildManifestStaticStub.resolves({ hidesExplorerArrows: undefined });
        });

        it(`throws an Error, when 'configManager' is NOT instantiated`, async function () {
          try {
            await new IconsGenerator().generateIconsManifest(
              fixtFiles,
              fixtFolders,
            );
          } catch (error) {
            expect(error).to.be.an.instanceOf(ReferenceError);
            expect(error).to.match(/'configManager' not set to an instance/);
          }
        });

        context(`generates the icons manifest`, function () {
          it(`including the custom definitions`, async function () {
            configManagerStub.getCustomIconsDirPath.resolves(
              '/default/path/to/vscode/user/folder',
            );
            await iconsGenerator.generateIconsManifest(fixtFiles, fixtFolders);

            expect(
              buildManifestStaticStub.calledOnceWithExactly(
                filesCollection,
                foldersCollection,
                '/default/path/to/vscode/user/folder',
              ),
            ).to.be.true;
          });

          it(`using the custom icons folder path`, async function () {
            vsiconsClone.customIconFolderPath = '/custom/icons/folder/path';
            configManagerStub.getCustomIconsDirPath.resolves(
              vsiconsClone.customIconFolderPath,
            );

            await iconsGenerator.generateIconsManifest(fixtFiles, fixtFolders);

            expect(
              configManagerStub.getCustomIconsDirPath.calledOnceWithExactly(
                vsiconsClone.customIconFolderPath,
              ),
            ).to.be.true;
            expect(
              buildManifestStaticStub.calledOnceWithExactly(
                filesCollection,
                foldersCollection,
                vsiconsClone.customIconFolderPath,
              ),
            ).to.be.true;
          });

          it(`correctly sets the 'hidesExplorerArrows' preset`, async function () {
            vsiconsClone.presets.hideExplorerArrows = true;

            const iconManifest = await iconsGenerator.generateIconsManifest(
              fixtFiles,
              fixtFolders,
            );
            expect(iconManifest.hidesExplorerArrows).to.be.true;
          });
        });
      });
    });

    context(`persisting the icons manifest`, function () {
      let existsAsyncStub: sinon.SinonStub;
      let createDirAsyncStub: sinon.SinonStub;
      let writeFileAsyncStub: sinon.SinonStub;
      let logErrorStub: sinon.SinonStub;
      let pathUnixJoinStub: sinon.SinonStub;
      let infoStub: sinon.SinonStub;
      let getRelativePathStub: sinon.SinonStub;
      let updateFileStub: sinon.SinonStub;

      beforeEach(function () {
        existsAsyncStub = sandbox.stub(fsAsync, 'existsAsync').resolves(true);
        createDirAsyncStub = sandbox
          .stub(Utils, 'createDirectoryRecursively')
          .resolves();
        writeFileAsyncStub = sandbox.stub(fsAsync, 'writeFileAsync').resolves();
        logErrorStub = sandbox.stub(ErrorHandler, 'logError');
        pathUnixJoinStub = sandbox.stub(Utils, 'pathUnixJoin').returns('');
        infoStub = sandbox.stub(console, 'info');
        getRelativePathStub = sandbox.stub(Utils, 'getRelativePath');
        updateFileStub = sandbox.stub(Utils, 'updateFile');
      });

      it(`creates the 'out' directory, when it doesn't exist`, async function () {
        existsAsyncStub.resolves(false);

        await iconsGenerator.persist(iconsManifest);

        expect(createDirAsyncStub.calledOnce).to.be.true;
        expect(createDirAsyncStub.calledWithMatch(/\.*[/|\\]src/)).to.be.true;
      });

      context(`writes the icons manifest to storage`, function () {
        context(`with identation`, function () {
          it(`on development`, async function () {
            const stringified = JSON.stringify(iconsManifest, null, 2);
            const filePath = `./${constants.iconsManifest.filename}`;
            pathUnixJoinStub.returns(filePath);

            await iconsGenerator.persist(iconsManifest);

            expect(
              writeFileAsyncStub.calledOnceWithExactly(filePath, stringified),
            ).to.be.true;
          });
        });

        context(`without identation`, function () {
          beforeEach(function () {
            constants.environment.production = true;
          });

          afterEach(function () {
            constants.environment.production = false;
          });

          it(`on production`, async function () {
            const stringified = JSON.stringify(iconsManifest, null, 0);
            const filePath = `./${constants.iconsManifest.filename}`;
            pathUnixJoinStub.returns(filePath);

            await iconsGenerator.persist(iconsManifest);

            expect(
              writeFileAsyncStub.calledOnceWithExactly(filePath, stringified),
            ).to.be.true;
          });
        });
      });

      it(`prints a success message to 'console' stdout`, async function () {
        await iconsGenerator.persist(iconsManifest);

        expect(
          infoStub.calledOnceWithExactly(
            `[${constants.extension.name}] Icons manifest file successfully generated!`,
          ),
        ).to.be.true;
      });

      context(`logs an Error`, function () {
        it(`when creating the 'out' directory fails`, async function () {
          existsAsyncStub.resolves(false);
          const error = new Error('test');
          createDirAsyncStub.rejects(error);

          await iconsGenerator.persist(iconsManifest);

          expect(createDirAsyncStub.calledOnce).to.be.true;
          expect(createDirAsyncStub.calledWithMatch(/\.*[/|\\]src/)).to.be.true;
          expect(logErrorStub.calledOnceWithExactly(error)).to.be.true;
        });

        it(`when writing to storage fails`, async function () {
          const error = new Error('test');
          writeFileAsyncStub.rejects(error);

          await iconsGenerator.persist(iconsManifest);

          expect(logErrorStub.calledOnceWithExactly(error)).to.be.true;
        });

        it(`when 'updateFile' fails`, async function () {
          const error = new Error();
          updateFileStub.rejects(error);
          getRelativePathStub.resolves('./');

          await iconsGenerator.persist(iconsManifest, true);

          expect(updateFileStub.calledOnce).to.be.true;
          expect(logErrorStub.calledOnceWithExactly(error)).to.be.true;
        });
      });

      context(`the 'package.json' file gets`, function () {
        context(`NOT updated`, function () {
          let manifest: IPackageManifest;

          beforeEach(function () {
            manifest = packageJson as IPackageManifest;
            getRelativePathStub.resolves(
              `${constants.extension.outDirName}/${constants.extension.srcDirName}/`,
            );
          });

          it(`when set NOT to`, async function () {
            await iconsGenerator.persist(iconsManifest, false);

            expect(updateFileStub.called).to.be.false;
          });

          context(`when the icon theme path`, function () {
            it(`does NOT exist`, async function () {
              const originalValue = manifest.contributes.iconThemes[0].path;
              delete manifest.contributes.iconThemes[0].path;

              await iconsGenerator.persist(iconsManifest, true);

              manifest.contributes.iconThemes[0].path = originalValue;

              expect(updateFileStub.called).to.be.false;
            });

            it(`does NOT need to be changed`, async function () {
              await iconsGenerator.persist(iconsManifest, true);

              expect(updateFileStub.called).to.be.false;
            });
          });

          context(`when the entry point`, function () {
            it(`does NOT exist`, async function () {
              const originalValue = manifest.main;
              delete manifest.main;

              await iconsGenerator.persist(iconsManifest, true);

              manifest.main = originalValue;

              expect(updateFileStub.called).to.be.false;
            });

            it(`does NOT need to be changed`, async function () {
              await iconsGenerator.persist(iconsManifest, true);

              expect(updateFileStub.called).to.be.false;
            });
          });

          context(`when the 'vscode:uninstall' script`, function () {
            it(`does NOT exist`, async function () {
              const originalValue = manifest.scripts['vscode:unistall'];
              delete manifest.scripts['vscode:unistall'];

              await iconsGenerator.persist(iconsManifest, true);

              manifest.scripts['vscode:unistall'] = originalValue;

              expect(updateFileStub.called).to.be.false;
            });

            it(`does NOT need to be changed`, async function () {
              await iconsGenerator.persist(iconsManifest, true);

              expect(updateFileStub.called).to.be.false;
            });
          });
        });

        context(`updated`, function () {
          context(`and the 'path' property gets`, function () {
            context(`NOT updated`, function () {
              it(`when it can NOT be found`, async function () {
                updateFileStub.callsArgWith(1, ['']).resolves();

                await iconsGenerator.persist(iconsManifest, true);

                expect(updateFileStub.calledOnce).to.be.true;
                expect(infoStub.calledOnce).to.be.true;
                expect(
                  infoStub.calledWithExactly(
                    `[${constants.extension.name}] Icons manifest file successfully generated!`,
                  ),
                ).to.be.true;
              });
            });

            it(`updated`, async function () {
              getRelativePathStub.resolves('some/path/');
              updateFileStub
                .callsArgWith(1, [
                  `  "path": "${constants.iconsManifest.filename}"`,
                ])
                .resolves();

              await iconsGenerator.persist(iconsManifest, true);

              expect(updateFileStub.calledOnce).to.be.true;
              expect(infoStub.calledTwice).to.be.true;
              expect(
                infoStub.secondCall.calledWithExactly(
                  `[${constants.extension.name}] Icons path in 'package.json' updated`,
                ),
              ).to.be.true;
            });
          });

          context(`and the 'main' property gets`, function () {
            context(`NOT updated`, function () {
              it(`when it can NOT be found`, async function () {
                updateFileStub.callsArgWith(1, ['']).resolves();

                await iconsGenerator.persist(iconsManifest, true);

                expect(updateFileStub.calledOnce).to.be.true;
                expect(infoStub.calledOnce).to.be.true;
                expect(
                  infoStub.calledWithExactly(
                    `[${constants.extension.name}] Icons manifest file successfully generated!`,
                  ),
                ).to.be.true;
              });
            });

            it(`updated`, async function () {
              getRelativePathStub.resolves('some/path/');
              updateFileStub
                .callsArgWith(1, [`"main":"some/path/"\n"path":""`])
                .resolves();

              await iconsGenerator.persist(iconsManifest, true);

              expect(updateFileStub.calledOnce).to.be.true;
              expect(infoStub.calledThrice).to.be.true;
              expect(
                infoStub.thirdCall.calledWithExactly(
                  `[${constants.extension.name}] Entrypoint in 'package.json' updated`,
                ),
              ).to.be.true;
            });

            context(`an entrypoint value`, function () {
              context(`when the environment is`, function () {
                const newDir = 'some/path/';
                beforeEach(function () {
                  getRelativePathStub.resolves(newDir);
                });

                context(`development`, function () {
                  it(`without a filename`, async function () {
                    const manifestMock =
                      '"main": "' +
                      `${constants.extension.outDirName}/${constants.extension.srcDirName}/"`;

                    await iconsGenerator.persist(iconsManifest, true);

                    const func = updateFileStub.args[0][1] as (
                      arg: string[],
                    ) => string[];
                    const returnedValue: string[] = func([manifestMock]);

                    expect(returnedValue[0]).to.equal(`"main": "${newDir}"`);
                  });
                });

                context(`production`, function () {
                  beforeEach(function () {
                    constants.environment.production = true;
                  });

                  afterEach(function () {
                    constants.environment.production = false;
                  });

                  it(`with a filename`, async function () {
                    const manifestMock =
                      '"main": "' +
                      `${constants.extension.outDirName}/${constants.extension.srcDirName}/"`;

                    await iconsGenerator.persist(iconsManifest, true);

                    const func = updateFileStub.args[0][1] as (
                      arg: string[],
                    ) => string[];
                    const returnedValue = func([manifestMock]);

                    expect(returnedValue[0]).to.equal(
                      `"main": "${newDir}${constants.extension.distEntryFilename}"`,
                    );
                  });
                });
              });
            });
          });

          context(`and the 'scripts' property gets`, function () {
            context(`NOT updated`, function () {
              it(`when it can NOT be found`, async function () {
                updateFileStub.callsArgWith(1, ['']).resolves();

                await iconsGenerator.persist(iconsManifest, true);

                expect(updateFileStub.calledOnce).to.be.true;
                expect(infoStub.calledOnce).to.be.true;
                expect(
                  infoStub.calledWithExactly(
                    `[${constants.extension.name}] Icons manifest file successfully generated!`,
                  ),
                ).to.be.true;
              });
            });

            it(`updated`, async function () {
              getRelativePathStub.resolves('some/path/');
              updateFileStub
                .callsArgWith(1, [
                  `"main":"some/path/"\n"path":""\n"scripts":{"vscode:uninstall":""}`,
                ])
                .resolves();

              await iconsGenerator.persist(iconsManifest, true);

              expect(updateFileStub.calledOnce).to.be.true;
              expect(infoStub.callCount).to.equal(4);
              expect(
                infoStub.calledWithExactly(
                  `[${constants.extension.name}] Script 'vscode:uninstall' in 'package.json' updated`,
                ),
              ).to.be.true;
            });
          });
        });
      });
    });

    context(`the listener on configuration changes`, function () {
      context(`sets the 'affected angular preset' to`, function () {
        it(`true`, function () {
          onDidChangeConfigurationStub.callArgOnWith(0, iconsGenerator, {
            affectsConfiguration: () => true,
          });

          // @ts-ignore
          const affectedPresets = iconsGenerator.affectedPresets as IPresets;

          expect(affectedPresets.angular).to.be.true;
        });

        it(`false`, function () {
          onDidChangeConfigurationStub.callArgOnWith(0, iconsGenerator, {
            affectsConfiguration: () => false,
          });

          // @ts-ignore
          const affectedPresets = iconsGenerator.affectedPresets as IPresets;

          expect(affectedPresets.angular).to.be.false;
        });
      });
    });
  });
});
