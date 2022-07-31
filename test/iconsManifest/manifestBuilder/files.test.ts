/* eslint-disable prefer-arrow-callback */
/* eslint-disable no-unused-expressions */
import { expect } from 'chai';
import { cloneDeep } from 'lodash';
import * as sinon from 'sinon';
import * as fsAsync from '../../../src/common/fsAsync';
import { constants } from '../../../src/constants';
import { ManifestBuilder } from '../../../src/iconsManifest';
import {
  IFolderCollection,
  IFileExtension,
  ILanguage,
  IIconAssociation,
} from '../../../src/models';
import { Utils } from '../../../src/utils';
import { extensions as fixtFiles } from '../../fixtures/supportedExtensions';

describe('ManifestBuilder: files icons test', function () {
  context('ensures that', function () {
    let sandbox: sinon.SinonSandbox;
    let pathUnixJoinStub: sinon.SinonStub;
    let emptyFolderCollection: IFolderCollection;

    const iconsDirRelativeBasePath = '../../path/to/icons/dir';

    beforeEach(function () {
      sandbox = sinon.createSandbox();

      sandbox.stub(Utils, 'fileFormatToString').returns('.svg');
      sandbox
        .stub(Utils, 'removeFirstDot')
        .callsFake((txt: string) => txt.replace(/^\./, ''));
      sandbox
        .stub(Utils, 'combine')
        .callsFake((array1: string[], array2: string[]) =>
          array1.reduce(
            (previous: string[], current: string) =>
              previous.concat(
                array2.map((value: string) => [current, value].join('.')),
              ),
            [],
          ),
        );
      sandbox.stub(Utils, 'getRelativePath').resolves(iconsDirRelativeBasePath);
      pathUnixJoinStub = sandbox
        .stub(Utils, 'pathUnixJoin')
        .callsFake((fpath: string, file: string) => `${fpath}/${file}`);

      emptyFolderCollection = {
        default: { folder: { icon: 'folder', format: 'svg' } },
        supported: [],
      };
    });

    afterEach(function () {
      sandbox.restore();
    });

    context(`if a default 'light' icon is NOT defined`, function () {
      context('and useBundledIcon is enabled', function () {
        it(`the 'default' file icon path has the correct structure`, async function () {
          const filename = `${constants.iconsManifest.fileTypePrefix}${
            fixtFiles.default.file.icon
          }${constants.iconsManifest.iconSuffix}${Utils.fileFormatToString(
            fixtFiles.default.file.format,
          )}`;

          const files = cloneDeep(fixtFiles);
          files.default.file.useBundledIcon = true;

          const manifest = await ManifestBuilder.buildManifest(
            files,
            emptyFolderCollection,
          );

          expect(manifest.iconDefinitions._file.iconPath).to.equal(
            `${iconsDirRelativeBasePath}/${filename}`,
          );
        });
      });

      context(`the 'default' file`, function () {
        it(`has an icon path`, async function () {
          const manifest = await ManifestBuilder.buildManifest(
            fixtFiles,
            emptyFolderCollection,
          );

          expect(manifest.iconDefinitions._file.iconPath).not.to.be.empty;
        });

        it(`icon path has the correct structure`, async function () {
          const filename = `${constants.iconsManifest.defaultPrefix}${
            fixtFiles.default.file.icon
          }${constants.iconsManifest.iconSuffix}${Utils.fileFormatToString(
            fixtFiles.default.file.format,
          )}`;

          const manifest = await ManifestBuilder.buildManifest(
            fixtFiles,
            emptyFolderCollection,
          );

          expect(manifest.iconDefinitions._file.iconPath).to.equal(
            `${iconsDirRelativeBasePath}/${filename}`,
          );
        });
      });

      it(`the 'default' 'light' file has NOT an icon path`, async function () {
        const manifest = await ManifestBuilder.buildManifest(
          fixtFiles,
          emptyFolderCollection,
        );

        expect(manifest.iconDefinitions._file_light.iconPath).to.be.empty;
      });

      context('each supported', function () {
        context('file extension', function () {
          it('has a definition', async function () {
            const manifest = await ManifestBuilder.buildManifest(
              fixtFiles,
              emptyFolderCollection,
            );
            fixtFiles.supported
              .filter((file: IFileExtension) => !file.disabled)
              .forEach((file: IFileExtension) => {
                const definition = `${constants.iconsManifest.definitionFilePrefix}${file.icon}`;

                expect(manifest.iconDefinitions[definition]).to.exist;
              });
          });

          it('has an icon path', async function () {
            const manifest = await ManifestBuilder.buildManifest(
              fixtFiles,
              emptyFolderCollection,
            );
            fixtFiles.supported
              .filter((file: IFileExtension) => !file.disabled)
              .forEach((file: IFileExtension) => {
                const definition = `${constants.iconsManifest.definitionFilePrefix}${file.icon}`;
                const def = manifest.iconDefinitions[
                  definition
                ] as IIconAssociation;

                expect(def.iconPath).not.to.be.empty;
              });
          });

          it(`icon path has the correct structure`, async function () {
            const manifest = await ManifestBuilder.buildManifest(
              fixtFiles,
              emptyFolderCollection,
            );

            fixtFiles.supported
              .filter((file: IFileExtension) => !file.disabled)
              .forEach((file: IFileExtension) => {
                const filename = `${constants.iconsManifest.fileTypePrefix}${
                  file.icon
                }${
                  constants.iconsManifest.iconSuffix
                }${Utils.fileFormatToString(file.format)}`;

                const definition = `${constants.iconsManifest.definitionFilePrefix}${file.icon}`;
                const def = manifest.iconDefinitions[
                  definition
                ] as IIconAssociation;

                expect(def.iconPath).to.equal(
                  `${iconsDirRelativeBasePath}/${filename}`,
                );
              });
          });

          context('that has NOT a light theme version', function () {
            it('has a definition', async function () {
              const manifest = await ManifestBuilder.buildManifest(
                fixtFiles,
                emptyFolderCollection,
              );
              fixtFiles.supported
                .filter((file: IFileExtension) => !file.light && !file.disabled)
                .forEach((file: IFileExtension) => {
                  const definition = `${constants.iconsManifest.definitionFilePrefix}${file.icon}`;

                  expect(manifest.iconDefinitions[definition]).to.exist;
                });
            });

            it('has an icon path', async function () {
              const manifest = await ManifestBuilder.buildManifest(
                fixtFiles,
                emptyFolderCollection,
              );
              fixtFiles.supported
                .filter((file: IFileExtension) => !file.light && !file.disabled)
                .forEach((file: IFileExtension) => {
                  const definition = `${constants.iconsManifest.definitionFilePrefix}${file.icon}`;
                  const def = manifest.iconDefinitions[
                    definition
                  ] as IIconAssociation;

                  expect(def.iconPath).not.to.be.empty;
                });
            });

            it(`icon path has the correct structure`, async function () {
              const manifest = await ManifestBuilder.buildManifest(
                fixtFiles,
                emptyFolderCollection,
              );

              fixtFiles.supported
                .filter((file: IFileExtension) => !file.light && !file.disabled)
                .forEach((file: IFileExtension) => {
                  const filename = `${constants.iconsManifest.fileTypePrefix}${
                    file.icon
                  }${
                    constants.iconsManifest.iconSuffix
                  }${Utils.fileFormatToString(file.format)}`;
                  const definition = `${constants.iconsManifest.definitionFilePrefix}${file.icon}`;
                  const def = manifest.iconDefinitions[
                    definition
                  ] as IIconAssociation;

                  expect(def.iconPath).to.equal(
                    `${iconsDirRelativeBasePath}/${filename}`,
                  );
                });
            });
          });

          context('that has a light theme version', function () {
            it(`has a 'light' definition`, async function () {
              const manifest = await ManifestBuilder.buildManifest(
                fixtFiles,
                emptyFolderCollection,
              );
              fixtFiles.supported
                .filter((file: IFileExtension) => file.light && !file.disabled)
                .forEach((file: IFileExtension) => {
                  const definition = `${constants.iconsManifest.definitionFileLightPrefix}${file.icon}`;

                  expect(manifest.iconDefinitions[definition]).to.exist;
                });
            });

            it('has an icon path', async function () {
              const manifest = await ManifestBuilder.buildManifest(
                fixtFiles,
                emptyFolderCollection,
              );
              fixtFiles.supported
                .filter((file: IFileExtension) => file.light && !file.disabled)
                .forEach((file: IFileExtension) => {
                  const definition = `${constants.iconsManifest.definitionFileLightPrefix}${file.icon}`;
                  const def = manifest.iconDefinitions[
                    definition
                  ] as IIconAssociation;

                  expect(def.iconPath).not.to.be.empty;
                });
            });

            it(`icon path has the correct structure`, async function () {
              const manifest = await ManifestBuilder.buildManifest(
                fixtFiles,
                emptyFolderCollection,
              );

              fixtFiles.supported
                .filter((file: IFileExtension) => file.light && !file.disabled)
                .forEach((file: IFileExtension) => {
                  const filename = `${
                    constants.iconsManifest.fileTypeLightPrefix
                  }${file.icon}${
                    constants.iconsManifest.iconSuffix
                  }${Utils.fileFormatToString(file.format)}`;
                  const definition = `${constants.iconsManifest.definitionFileLightPrefix}${file.icon}`;
                  const def = manifest.iconDefinitions[
                    definition
                  ] as IIconAssociation;

                  expect(def.iconPath).to.equal(
                    `${iconsDirRelativeBasePath}/${filename}`,
                  );
                });
            });
          });

          context('for a dark color theme', function () {
            context('that is NOT a filename', function () {
              context('and has NOT a light theme version', function () {
                it(`has a 'fileExtensions' referencing its definition`, async function () {
                  const manifest = await ManifestBuilder.buildManifest(
                    fixtFiles,
                    emptyFolderCollection,
                  );
                  fixtFiles.supported
                    .filter(
                      (file: IFileExtension) =>
                        !file.filename && !file.light && !file.disabled,
                    )
                    .forEach((file: IFileExtension) => {
                      const definition = `${constants.iconsManifest.definitionFilePrefix}${file.icon}`;

                      file.extensions.forEach((extension: string) =>
                        expect(manifest.fileExtensions[extension]).to.equal(
                          definition,
                        ),
                      );
                    });
                });
              });

              context('and has a light theme version', function () {
                it(`has a 'fileExtensions' referencing its definition`, async function () {
                  const manifest = await ManifestBuilder.buildManifest(
                    fixtFiles,
                    emptyFolderCollection,
                  );
                  fixtFiles.supported
                    .filter(
                      (file: IFileExtension) =>
                        !file.filename && file.light && !file.disabled,
                    )
                    .forEach((file: IFileExtension) => {
                      const definition = `${constants.iconsManifest.definitionFilePrefix}${file.icon}`;

                      file.extensions.forEach((extension: string) =>
                        expect(manifest.fileExtensions[extension]).to.equal(
                          definition,
                        ),
                      );
                    });
                });
              });
            });

            context('that is a filename', function () {
              context('and has NOT a light theme version', function () {
                it(`has a 'fileNames' referencing its definition`, async function () {
                  const manifest = await ManifestBuilder.buildManifest(
                    fixtFiles,
                    emptyFolderCollection,
                  );
                  fixtFiles.supported
                    .filter(
                      (file: IFileExtension) =>
                        file.filename &&
                        !file.light &&
                        !file.languages &&
                        !file.disabled,
                    )
                    .forEach((file: IFileExtension) => {
                      const definition = `${constants.iconsManifest.definitionFilePrefix}${file.icon}`;

                      file.extensions.forEach((extension: string) =>
                        expect(manifest.fileNames[extension]).to.equal(
                          definition,
                        ),
                      );
                    });
                });
              });

              context('and has a light theme version', function () {
                it(`has a 'fileNames' referencing its definition`, async function () {
                  const manifest = await ManifestBuilder.buildManifest(
                    fixtFiles,
                    emptyFolderCollection,
                  );
                  fixtFiles.supported
                    .filter(
                      (file: IFileExtension) =>
                        file.filename &&
                        !file.languages &&
                        file.light &&
                        !file.disabled,
                    )
                    .forEach((file: IFileExtension) => {
                      const definition = `${constants.iconsManifest.definitionFilePrefix}${file.icon}`;

                      file.extensions.forEach((extension: string) =>
                        expect(manifest.fileNames[extension]).to.equal(
                          definition,
                        ),
                      );
                    });
                });
              });
            });

            context(`that is supported by 'language ids'`, function () {
              context('and has NOT a light theme version', function () {
                it(`has a 'languageIds', referencing its definition`, async function () {
                  const manifest = await ManifestBuilder.buildManifest(
                    fixtFiles,
                    emptyFolderCollection,
                  );
                  fixtFiles.supported
                    .filter(
                      (file: IFileExtension) =>
                        file.languages && !file.disabled,
                    )
                    .forEach((file: IFileExtension) => {
                      const definition = `${constants.iconsManifest.definitionFilePrefix}${file.icon}`;

                      const assertLanguage = (language: string): void => {
                        expect(manifest.languageIds[language]).to.equal(
                          definition,
                        );
                      };

                      file.languages.forEach((langIds: ILanguage) => {
                        if (Array.isArray(langIds.ids)) {
                          langIds.ids.forEach((id: string) =>
                            assertLanguage(id),
                          );
                        } else {
                          assertLanguage(langIds.ids);
                        }
                      });
                    });
                });
              });

              context('and has a light theme version', function () {
                it(`has a 'languageIds', referencing its definition`, async function () {
                  const manifest = await ManifestBuilder.buildManifest(
                    fixtFiles,
                    emptyFolderCollection,
                  );
                  fixtFiles.supported
                    .filter(
                      (file: IFileExtension) =>
                        file.languages && file.light && !file.disabled,
                    )
                    .forEach((file: IFileExtension) => {
                      const definition = `${constants.iconsManifest.definitionFilePrefix}${file.icon}`;

                      const assertLanguageLight = (language: string): void => {
                        expect(manifest.languageIds[language]).to.equal(
                          definition,
                        );
                      };

                      file.languages.forEach((langIds: ILanguage) => {
                        if (Array.isArray(langIds.ids)) {
                          langIds.ids.forEach((id: string) =>
                            assertLanguageLight(id),
                          );
                        } else {
                          assertLanguageLight(langIds.ids);
                        }
                      });
                    });
                });
              });
            });
          });

          context('for a light color theme', function () {
            context('that is NOT a filename', function () {
              context('and has NOT a light theme version', function () {
                it(`has a 'fileExtensions' referencing its 'dark' definition`, async function () {
                  const manifest = await ManifestBuilder.buildManifest(
                    fixtFiles,
                    emptyFolderCollection,
                  );
                  fixtFiles.supported
                    .filter(
                      (file: IFileExtension) =>
                        !file.filename && !file.light && !file.disabled,
                    )
                    .forEach((file: IFileExtension) => {
                      const definition = `${constants.iconsManifest.definitionFilePrefix}${file.icon}`;

                      file.extensions.forEach((extension: string) =>
                        expect(
                          manifest.light.fileExtensions[extension],
                        ).to.equal(definition),
                      );
                    });
                });
              });

              context('and has a light theme version', function () {
                it(`has a 'fileExtensions' referencing its 'light' definition`, async function () {
                  const manifest = await ManifestBuilder.buildManifest(
                    fixtFiles,
                    emptyFolderCollection,
                  );
                  fixtFiles.supported
                    .filter(
                      (file: IFileExtension) =>
                        !file.filename && file.light && !file.disabled,
                    )
                    .forEach((file: IFileExtension) => {
                      const definition = `${constants.iconsManifest.definitionFileLightPrefix}${file.icon}`;

                      file.extensions.forEach((extension: string) =>
                        expect(
                          manifest.light.fileExtensions[extension],
                        ).to.equal(definition),
                      );
                    });
                });
              });
            });

            context('that is a filename', function () {
              context('and has NOT a light theme version', function () {
                it(`has a 'fileNames' referencing its 'dark' definition`, async function () {
                  const manifest = await ManifestBuilder.buildManifest(
                    fixtFiles,
                    emptyFolderCollection,
                  );
                  fixtFiles.supported
                    .filter(
                      (file: IFileExtension) =>
                        file.filename &&
                        !file.light &&
                        !file.languages &&
                        !file.disabled,
                    )
                    .forEach((file: IFileExtension) => {
                      const definition = `${constants.iconsManifest.definitionFilePrefix}${file.icon}`;

                      file.extensions.forEach((extension: string) =>
                        expect(manifest.light.fileNames[extension]).to.equal(
                          definition,
                        ),
                      );
                    });
                });
              });

              context('and has a light theme version', function () {
                it(`has a 'fileNames' referencing its 'light' definition`, async function () {
                  const manifest = await ManifestBuilder.buildManifest(
                    fixtFiles,
                    emptyFolderCollection,
                  );
                  fixtFiles.supported
                    .filter(
                      (file: IFileExtension) =>
                        file.filename &&
                        !file.languages &&
                        file.light &&
                        !file.disabled,
                    )
                    .forEach((file: IFileExtension) => {
                      const definition = `${constants.iconsManifest.definitionFileLightPrefix}${file.icon}`;

                      file.extensions.forEach((extension: string) =>
                        expect(manifest.light.fileNames[extension]).to.equal(
                          definition,
                        ),
                      );
                    });
                });
              });
            });

            context(`that is supported by 'language ids'`, function () {
              context('and has NOT a light theme version', function () {
                it(`has a 'languageIds', referencing its ' dark'definition`, async function () {
                  const manifest = await ManifestBuilder.buildManifest(
                    fixtFiles,
                    emptyFolderCollection,
                  );
                  fixtFiles.supported
                    .filter(
                      (file: IFileExtension) =>
                        file.languages && !file.light && !file.disabled,
                    )
                    .forEach((file: IFileExtension) => {
                      const definition = `${constants.iconsManifest.definitionFilePrefix}${file.icon}`;

                      const assertLanguage = (language: string): void => {
                        expect(manifest.light.languageIds[language]).to.equal(
                          definition,
                        );
                      };

                      file.languages.forEach((langIds: ILanguage) => {
                        if (Array.isArray(langIds.ids)) {
                          langIds.ids.forEach((id: string) =>
                            assertLanguage(id),
                          );
                        } else {
                          assertLanguage(langIds.ids);
                        }
                      });
                    });
                });
              });

              context('and has a light theme version', function () {
                it(`has a 'languageIds', referencing its 'light' definition`, async function () {
                  const manifest = await ManifestBuilder.buildManifest(
                    fixtFiles,
                    emptyFolderCollection,
                  );
                  fixtFiles.supported
                    .filter(
                      (file: IFileExtension) =>
                        file.languages && file.light && !file.disabled,
                    )
                    .forEach((file: IFileExtension) => {
                      const definition = `${constants.iconsManifest.definitionFileLightPrefix}${file.icon}`;

                      const assertLanguageLight = (language: string): void => {
                        expect(manifest.light.languageIds[language]).to.equal(
                          definition,
                        );
                      };

                      file.languages.forEach((langIds: ILanguage) => {
                        if (Array.isArray(langIds.ids)) {
                          langIds.ids.forEach((id: string) =>
                            assertLanguageLight(id),
                          );
                        } else {
                          assertLanguageLight(langIds.ids);
                        }
                      });
                    });
                });
              });
            });
          });
        });
      });
    });

    context(`if a default 'light' icon is defined`, function () {
      beforeEach(function () {
        fixtFiles.default.file_light = { icon: 'file_light', format: 'svg' };
      });

      afterEach(function () {
        fixtFiles.default.file_light = undefined;
      });

      context('and useBundledIcon is enabled', function () {
        it(`the 'default' file icon path has the correct structure`, async function () {
          const filename = `${constants.iconsManifest.fileTypePrefix}${
            fixtFiles.default.file.icon
          }${constants.iconsManifest.iconSuffix}${Utils.fileFormatToString(
            fixtFiles.default.file.format,
          )}`;

          const files = cloneDeep(fixtFiles);
          files.default.file.useBundledIcon = true;

          const manifest = await ManifestBuilder.buildManifest(
            files,
            emptyFolderCollection,
          );

          expect(manifest.iconDefinitions._file.iconPath).to.equal(
            `${iconsDirRelativeBasePath}/${filename}`,
          );
        });
      });

      context(`the 'default' file`, function () {
        it(`has an icon path`, async function () {
          const manifest = await ManifestBuilder.buildManifest(
            fixtFiles,
            emptyFolderCollection,
          );

          expect(manifest.iconDefinitions._file.iconPath).not.to.be.empty;
        });

        it(`icon path has the correct structure`, async function () {
          const filename = `${constants.iconsManifest.defaultPrefix}${
            fixtFiles.default.file.icon
          }${constants.iconsManifest.iconSuffix}${Utils.fileFormatToString(
            fixtFiles.default.file.format,
          )}`;

          const manifest = await ManifestBuilder.buildManifest(
            fixtFiles,
            emptyFolderCollection,
          );

          expect(manifest.iconDefinitions._file.iconPath).to.equal(
            `${iconsDirRelativeBasePath}/${filename}`,
          );
        });
      });

      context(`the 'default' 'light' file`, function () {
        it(`has an icon path`, async function () {
          const manifest = await ManifestBuilder.buildManifest(
            fixtFiles,
            emptyFolderCollection,
          );

          expect(manifest.iconDefinitions._file_light.iconPath).not.to.be.empty;
        });

        it(`icon path has the correct structure`, async function () {
          const filename = `${constants.iconsManifest.defaultPrefix}${
            fixtFiles.default.file_light.icon
          }${constants.iconsManifest.iconSuffix}${Utils.fileFormatToString(
            fixtFiles.default.file_light.format,
          )}`;

          const manifest = await ManifestBuilder.buildManifest(
            fixtFiles,
            emptyFolderCollection,
          );

          expect(manifest.iconDefinitions._file_light.iconPath).to.equal(
            `${iconsDirRelativeBasePath}/${filename}`,
          );
        });
      });

      context('each supported', function () {
        context('file extension', function () {
          it('has a definition', async function () {
            const manifest = await ManifestBuilder.buildManifest(
              fixtFiles,
              emptyFolderCollection,
            );
            fixtFiles.supported
              .filter((file: IFileExtension) => !file.disabled)
              .forEach((file: IFileExtension) => {
                const definition = `${constants.iconsManifest.definitionFilePrefix}${file.icon}`;

                expect(manifest.iconDefinitions[definition]).to.exist;
              });
          });

          it('has an icon path', async function () {
            const manifest = await ManifestBuilder.buildManifest(
              fixtFiles,
              emptyFolderCollection,
            );
            fixtFiles.supported
              .filter((file: IFileExtension) => !file.disabled)
              .forEach((file: IFileExtension) => {
                const definition = `${constants.iconsManifest.definitionFilePrefix}${file.icon}`;
                const def = manifest.iconDefinitions[
                  definition
                ] as IIconAssociation;

                expect(def.iconPath).not.to.be.empty;
              });
          });

          it(`icon path has the correct structure`, async function () {
            const manifest = await ManifestBuilder.buildManifest(
              fixtFiles,
              emptyFolderCollection,
            );

            fixtFiles.supported
              .filter((file: IFileExtension) => !file.disabled)
              .forEach((file: IFileExtension) => {
                const filename = `${constants.iconsManifest.fileTypePrefix}${
                  file.icon
                }${
                  constants.iconsManifest.iconSuffix
                }${Utils.fileFormatToString(file.format)}`;
                const definition = `${constants.iconsManifest.definitionFilePrefix}${file.icon}`;
                const def = manifest.iconDefinitions[
                  definition
                ] as IIconAssociation;

                expect(def.iconPath).to.equal(
                  `${iconsDirRelativeBasePath}/${filename}`,
                );
              });
          });

          context('that has NOT a light theme version', function () {
            it('has a definition', async function () {
              const manifest = await ManifestBuilder.buildManifest(
                fixtFiles,
                emptyFolderCollection,
              );
              fixtFiles.supported
                .filter((file: IFileExtension) => !file.light && !file.disabled)
                .forEach((file: IFileExtension) => {
                  const definition = `${constants.iconsManifest.definitionFilePrefix}${file.icon}`;

                  expect(manifest.iconDefinitions[definition]).to.exist;
                });
            });

            it('has an icon path', async function () {
              const manifest = await ManifestBuilder.buildManifest(
                fixtFiles,
                emptyFolderCollection,
              );
              fixtFiles.supported
                .filter((file: IFileExtension) => !file.light && !file.disabled)
                .forEach((file: IFileExtension) => {
                  const definition = `${constants.iconsManifest.definitionFilePrefix}${file.icon}`;
                  const def = manifest.iconDefinitions[
                    definition
                  ] as IIconAssociation;

                  expect(def.iconPath).not.to.be.empty;
                });
            });

            it(`icon path has the correct structure`, async function () {
              const manifest = await ManifestBuilder.buildManifest(
                fixtFiles,
                emptyFolderCollection,
              );

              fixtFiles.supported
                .filter((file: IFileExtension) => !file.light && !file.disabled)
                .forEach((file: IFileExtension) => {
                  const filename = `${constants.iconsManifest.fileTypePrefix}${
                    file.icon
                  }${
                    constants.iconsManifest.iconSuffix
                  }${Utils.fileFormatToString(file.format)}`;
                  const definition = `${constants.iconsManifest.definitionFilePrefix}${file.icon}`;
                  const def = manifest.iconDefinitions[
                    definition
                  ] as IIconAssociation;

                  expect(def.iconPath).to.equal(
                    `${iconsDirRelativeBasePath}/${filename}`,
                  );
                });
            });
          });

          context('that has a light theme version', function () {
            it(`has a 'light' definition`, async function () {
              const manifest = await ManifestBuilder.buildManifest(
                fixtFiles,
                emptyFolderCollection,
              );
              fixtFiles.supported
                .filter((file: IFileExtension) => file.light && !file.disabled)
                .forEach((file: IFileExtension) => {
                  const definition = `${constants.iconsManifest.definitionFileLightPrefix}${file.icon}`;

                  expect(manifest.iconDefinitions[definition]).to.exist;
                });
            });

            it('has an icon path', async function () {
              const manifest = await ManifestBuilder.buildManifest(
                fixtFiles,
                emptyFolderCollection,
              );
              fixtFiles.supported
                .filter((file: IFileExtension) => file.light && !file.disabled)
                .forEach((file: IFileExtension) => {
                  const definition = `${constants.iconsManifest.definitionFileLightPrefix}${file.icon}`;
                  const def = manifest.iconDefinitions[
                    definition
                  ] as IIconAssociation;

                  expect(def.iconPath).not.to.be.empty;
                });
            });

            it(`icon path has the correct structure`, async function () {
              const manifest = await ManifestBuilder.buildManifest(
                fixtFiles,
                emptyFolderCollection,
              );

              fixtFiles.supported
                .filter((file: IFileExtension) => file.light && !file.disabled)
                .forEach((file: IFileExtension) => {
                  const filename = `${
                    constants.iconsManifest.fileTypeLightPrefix
                  }${file.icon}${
                    constants.iconsManifest.iconSuffix
                  }${Utils.fileFormatToString(file.format)}`;
                  const definition = `${constants.iconsManifest.definitionFileLightPrefix}${file.icon}`;
                  const def = manifest.iconDefinitions[
                    definition
                  ] as IIconAssociation;

                  expect(def.iconPath).to.equal(
                    `${iconsDirRelativeBasePath}/${filename}`,
                  );
                });
            });
          });

          context('for a dark color theme', function () {
            context('that is NOT a filename', function () {
              context('and has NOT a light theme version', function () {
                it(`has a 'fileExtensions' referencing its definition`, async function () {
                  const manifest = await ManifestBuilder.buildManifest(
                    fixtFiles,
                    emptyFolderCollection,
                  );
                  fixtFiles.supported
                    .filter(
                      (file: IFileExtension) =>
                        !file.filename && !file.light && !file.disabled,
                    )
                    .forEach((file: IFileExtension) => {
                      const definition = `${constants.iconsManifest.definitionFilePrefix}${file.icon}`;

                      file.extensions.forEach((extension: string) =>
                        expect(manifest.fileExtensions[extension]).to.equal(
                          definition,
                        ),
                      );
                    });
                });
              });

              context('and has a light theme version', function () {
                it(`has a 'fileExtensions' referencing its definition`, async function () {
                  const manifest = await ManifestBuilder.buildManifest(
                    fixtFiles,
                    emptyFolderCollection,
                  );
                  fixtFiles.supported
                    .filter(
                      (file: IFileExtension) =>
                        !file.filename && file.light && !file.disabled,
                    )
                    .forEach((file: IFileExtension) => {
                      const definition = `${constants.iconsManifest.definitionFilePrefix}${file.icon}`;

                      file.extensions.forEach((extension: string) =>
                        expect(manifest.fileExtensions[extension]).to.equal(
                          definition,
                        ),
                      );
                    });
                });
              });
            });

            context('that is a filename', function () {
              context('and has NOT a light theme version', function () {
                it(`has a 'fileNames' referencing its definition`, async function () {
                  const manifest = await ManifestBuilder.buildManifest(
                    fixtFiles,
                    emptyFolderCollection,
                  );
                  fixtFiles.supported
                    .filter(
                      (file: IFileExtension) =>
                        file.filename &&
                        !file.light &&
                        !file.languages &&
                        !file.disabled,
                    )
                    .forEach((file: IFileExtension) => {
                      const definition = `${constants.iconsManifest.definitionFilePrefix}${file.icon}`;

                      file.extensions.forEach((extension: string) =>
                        expect(manifest.fileNames[extension]).to.equal(
                          definition,
                        ),
                      );
                    });
                });
              });

              context('and has a light theme version', function () {
                it(`has a 'fileNames' referencing its definition`, async function () {
                  const manifest = await ManifestBuilder.buildManifest(
                    fixtFiles,
                    emptyFolderCollection,
                  );
                  fixtFiles.supported
                    .filter(
                      (file: IFileExtension) =>
                        file.filename &&
                        !file.languages &&
                        file.light &&
                        !file.disabled,
                    )
                    .forEach((file: IFileExtension) => {
                      const definition = `${constants.iconsManifest.definitionFilePrefix}${file.icon}`;

                      file.extensions.forEach((extension: string) =>
                        expect(manifest.fileNames[extension]).to.equal(
                          definition,
                        ),
                      );
                    });
                });
              });
            });

            context(`that is supported by 'language ids'`, function () {
              context('and has NOT a light theme version', function () {
                it(`has a 'languageIds', referencing its definition`, async function () {
                  const manifest = await ManifestBuilder.buildManifest(
                    fixtFiles,
                    emptyFolderCollection,
                  );
                  fixtFiles.supported
                    .filter(
                      (file: IFileExtension) =>
                        file.languages && !file.disabled,
                    )
                    .forEach((file: IFileExtension) => {
                      const definition = `${constants.iconsManifest.definitionFilePrefix}${file.icon}`;

                      const assertLanguage = (language: string): void => {
                        expect(manifest.languageIds[language]).to.equal(
                          definition,
                        );
                      };

                      file.languages.forEach((langIds: ILanguage) => {
                        if (Array.isArray(langIds.ids)) {
                          langIds.ids.forEach((id: string) =>
                            assertLanguage(id),
                          );
                        } else {
                          assertLanguage(langIds.ids);
                        }
                      });
                    });
                });
              });

              context('and has a light theme version', function () {
                it(`has a 'languageIds', referencing its definition`, async function () {
                  const manifest = await ManifestBuilder.buildManifest(
                    fixtFiles,
                    emptyFolderCollection,
                  );
                  fixtFiles.supported
                    .filter(
                      (file: IFileExtension) =>
                        file.languages && file.light && !file.disabled,
                    )
                    .forEach((file: IFileExtension) => {
                      const definition = `${constants.iconsManifest.definitionFilePrefix}${file.icon}`;

                      const assertLanguageLight = (language: string): void => {
                        expect(manifest.languageIds[language]).to.equal(
                          definition,
                        );
                      };

                      file.languages.forEach((langIds: ILanguage) => {
                        if (Array.isArray(langIds.ids)) {
                          langIds.ids.forEach((id: string) =>
                            assertLanguageLight(id),
                          );
                        } else {
                          assertLanguageLight(langIds.ids);
                        }
                      });
                    });
                });
              });
            });
          });

          context('for a light color theme', function () {
            context('that is NOT a filename', function () {
              context('and has NOT a light theme version', function () {
                it(`has a 'fileExtensions' referencing its 'dark' definition`, async function () {
                  const manifest = await ManifestBuilder.buildManifest(
                    fixtFiles,
                    emptyFolderCollection,
                  );
                  fixtFiles.supported
                    .filter(
                      (file: IFileExtension) =>
                        !file.filename && !file.light && !file.disabled,
                    )
                    .forEach((file: IFileExtension) => {
                      const definition = `${constants.iconsManifest.definitionFilePrefix}${file.icon}`;

                      file.extensions.forEach((extension: string) =>
                        expect(
                          manifest.light.fileExtensions[extension],
                        ).to.equal(definition),
                      );
                    });
                });
              });

              context('and has a light theme version', function () {
                it(`has a 'fileExtensions' referencing its 'light' definition`, async function () {
                  const manifest = await ManifestBuilder.buildManifest(
                    fixtFiles,
                    emptyFolderCollection,
                  );
                  fixtFiles.supported
                    .filter(
                      (file: IFileExtension) =>
                        !file.filename && file.light && !file.disabled,
                    )
                    .forEach((file: IFileExtension) => {
                      const definition = `${constants.iconsManifest.definitionFileLightPrefix}${file.icon}`;

                      file.extensions.forEach((extension: string) =>
                        expect(
                          manifest.light.fileExtensions[extension],
                        ).to.equal(definition),
                      );
                    });
                });
              });
            });

            context('that is a filename', function () {
              context('and has NOT a light theme version', function () {
                it(`has a 'fileNames' referencing its 'dark' definition`, async function () {
                  const manifest = await ManifestBuilder.buildManifest(
                    fixtFiles,
                    emptyFolderCollection,
                  );
                  fixtFiles.supported
                    .filter(
                      (file: IFileExtension) =>
                        file.filename &&
                        !file.light &&
                        !file.languages &&
                        !file.disabled,
                    )
                    .forEach((file: IFileExtension) => {
                      const definition = `${constants.iconsManifest.definitionFilePrefix}${file.icon}`;

                      file.extensions.forEach((extension: string) =>
                        expect(manifest.light.fileNames[extension]).to.equal(
                          definition,
                        ),
                      );
                    });
                });
              });

              context('and has a light theme version', function () {
                it(`has a 'fileNames' referencing its 'light' definition`, async function () {
                  const manifest = await ManifestBuilder.buildManifest(
                    fixtFiles,
                    emptyFolderCollection,
                  );
                  fixtFiles.supported
                    .filter(
                      (file: IFileExtension) =>
                        file.filename &&
                        !file.languages &&
                        file.light &&
                        !file.disabled,
                    )
                    .forEach((file: IFileExtension) => {
                      const definition = `${constants.iconsManifest.definitionFileLightPrefix}${file.icon}`;

                      file.extensions.forEach((extension: string) =>
                        expect(manifest.light.fileNames[extension]).to.equal(
                          definition,
                        ),
                      );
                    });
                });
              });
            });

            context(`that is supported by 'language ids'`, function () {
              context('and has NOT a light theme version', function () {
                it(`has a 'languageIds', referencing its ' dark'definition`, async function () {
                  const manifest = await ManifestBuilder.buildManifest(
                    fixtFiles,
                    emptyFolderCollection,
                  );
                  fixtFiles.supported
                    .filter(
                      (file: IFileExtension) =>
                        file.languages && !file.light && !file.disabled,
                    )
                    .forEach((file: IFileExtension) => {
                      const definition = `${constants.iconsManifest.definitionFilePrefix}${file.icon}`;

                      const assertLanguage = (language: string): void => {
                        expect(manifest.light.languageIds[language]).to.equal(
                          definition,
                        );
                      };

                      file.languages.forEach((langIds: ILanguage) => {
                        if (Array.isArray(langIds.ids)) {
                          langIds.ids.forEach((id: string) =>
                            assertLanguage(id),
                          );
                        } else {
                          assertLanguage(langIds.ids);
                        }
                      });
                    });
                });
              });

              context('and has a light theme version', function () {
                it(`has a 'languageIds', referencing its 'light' definition`, async function () {
                  const manifest = await ManifestBuilder.buildManifest(
                    fixtFiles,
                    emptyFolderCollection,
                  );
                  fixtFiles.supported
                    .filter(
                      (file: IFileExtension) =>
                        file.languages && file.light && !file.disabled,
                    )
                    .forEach((file: IFileExtension) => {
                      const definition = `${constants.iconsManifest.definitionFileLightPrefix}${file.icon}`;

                      const assertLanguageLight = (language: string): void => {
                        expect(manifest.light.languageIds[language]).to.equal(
                          definition,
                        );
                      };

                      file.languages.forEach((langIds: ILanguage) => {
                        if (Array.isArray(langIds.ids)) {
                          langIds.ids.forEach((id: string) =>
                            assertLanguageLight(id),
                          );
                        } else {
                          assertLanguageLight(langIds.ids);
                        }
                      });
                    });
                });
              });
            });
          });
        });
      });
    });

    context(`when a custom icons directory path is provided`, function () {
      let existsAsyncStub: sinon.SinonStub;
      let belongToSameDriveStub: sinon.SinonStub;
      let overwriteDriveStub: sinon.SinonStub;

      const customIconDirPath = 'path/to/custom/icons/dir';

      beforeEach(function () {
        existsAsyncStub = sandbox.stub(fsAsync, 'existsAsync').resolves(true);
        belongToSameDriveStub = sandbox
          .stub(Utils, 'belongToSameDrive')
          .returns(true);
        overwriteDriveStub = sandbox.stub(Utils, 'overwriteDrive');
      });

      it(`that path is used, when it has a custom icon`, async function () {
        pathUnixJoinStub.returns(
          `${customIconDirPath}/${constants.extension.customIconFolderName}`,
        );

        const manifest = await ManifestBuilder.buildManifest(
          fixtFiles,
          emptyFolderCollection,
          customIconDirPath,
        );

        expect(manifest.iconDefinitions._file.iconPath).not.to.be.empty;
        expect(manifest.iconDefinitions._file.iconPath).to.equal(
          `${customIconDirPath}/${constants.extension.customIconFolderName}`,
        );
      });

      it(`that path is NOT used, when it has NOT a custom icon`, async function () {
        existsAsyncStub.resolves(false);
        pathUnixJoinStub.returns(
          `${iconsDirRelativeBasePath}/${constants.extension.customIconFolderName}`,
        );

        const manifest = await ManifestBuilder.buildManifest(
          fixtFiles,
          emptyFolderCollection,
          customIconDirPath,
        );
        expect(manifest.iconDefinitions._file.iconPath).not.to.be.empty;
        expect(manifest.iconDefinitions._file.iconPath).to.equal(
          `${iconsDirRelativeBasePath}/${constants.extension.customIconFolderName}`,
        );
      });

      it(`that path gets sanitized, when it's NOT on the same drive`, async function () {
        belongToSameDriveStub.returns(false);

        const manifest = await ManifestBuilder.buildManifest(
          fixtFiles,
          emptyFolderCollection,
          customIconDirPath,
        );

        expect(manifest.iconDefinitions._file.iconPath).not.to.be.empty;
        expect(manifest.iconDefinitions._file.iconPath).to.equal(
          `${iconsDirRelativeBasePath}/${constants.iconsManifest.defaultPrefix}file.svg`,
        );
        expect(
          overwriteDriveStub.calledWith(
            `${customIconDirPath}/${constants.extension.customIconFolderName}`,
          ),
        ).to.be.true;
      });
    });
  });
});
