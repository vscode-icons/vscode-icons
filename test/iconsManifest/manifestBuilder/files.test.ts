import type {
  IFileCollection,
  IFileExtension,
  IFolderCollection,
  IIconAssociation,
  ILanguage,
} from '../../../src/types';

import { expect } from 'chai';
import { cloneDeep } from 'lodash';
import * as sinon from 'sinon';

import * as fsAsync from '../../../src/common/fsAsync';
import { constants } from '../../../src/constants';
import { ManifestBuilder } from '../../../src/iconsManifest';
import * as enums from '../../../src/types/enums';
import { Utils } from '../../../src/utils';
import { extensions as fixtFiles } from '../../fixtures/supportedExtensions';

describe('ManifestBuilder: files icons test', function () {
  context('ensures that', function () {
    let sandbox: sinon.SinonSandbox;
    let pathUnixJoinStub: sinon.SinonStub;
    let emptyFolderCollection: IFolderCollection;
    let fileFormatToStringStub: sinon.SinonStub;

    const iconsDirRelativeBasePath = '../../path/to/icons/dir';

    const filesWithExtensionlessLightFilename = (): IFileCollection => {
      const files = cloneDeep(fixtFiles);
      files.supported.push({
        icon: 'extensionless_filename_light',
        filename: true,
        light: true,
      });
      return files;
    };

    beforeEach(function () {
      sandbox = sinon.createSandbox();

      fileFormatToStringStub = sandbox
        .stub(Utils, 'fileFormatToString')
        .returns('.svg');
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

    it('uses the configured format for the default file icon', async function () {
      const files: IFileCollection = cloneDeep(fixtFiles);
      files.default.file.format = enums.FileFormat.png;
      fileFormatToStringStub.withArgs(enums.FileFormat.png).returns('.png');

      const manifest = await ManifestBuilder.buildManifest(
        files,
        emptyFolderCollection,
      );

      expect(manifest.vscode.iconDefinitions._file.iconPath).to.equal(
        `${iconsDirRelativeBasePath}/${constants.iconsManifest.defaultPrefix}file${constants.iconsManifest.iconSuffix}.png`,
      );
    });

    it('uses a supported file format when provided', async function () {
      const files = cloneDeep(fixtFiles);
      const file = files.supported.find(({ icon }) => icon === 'actionscript');

      file.format = enums.FileFormat.png;
      fileFormatToStringStub.withArgs(enums.FileFormat.png).returns('.png');

      const manifest = await ManifestBuilder.buildManifest(
        files,
        emptyFolderCollection,
      );
      const definition = `${constants.iconsManifest.definitionFilePrefix}${file.icon}`;
      const icon = manifest.vscode.iconDefinitions[
        definition
      ] as IIconAssociation;

      expect(fileFormatToStringStub.calledWith(enums.FileFormat.png)).to.be
        .true;
      expect(icon.iconPath).to.equal(
        `${iconsDirRelativeBasePath}/${constants.iconsManifest.fileTypePrefix}${file.icon}${constants.iconsManifest.iconSuffix}.png`,
      );
    });

    it('creates a definition without mappings when extensions are undefined', async function () {
      const files = cloneDeep(fixtFiles);
      const file = files.supported.find(({ icon }) => icon === 'actionscript');
      files.supported = [file];
      file.extensions = undefined;

      const manifest = await ManifestBuilder.buildManifest(
        files,
        emptyFolderCollection,
      );
      const definition = `${constants.iconsManifest.definitionFilePrefix}${file.icon}`;

      expect(manifest.vscode.iconDefinitions[definition]).to.exist;
      expect(manifest.vscode.fileExtensions).to.be.empty;
      expect(manifest.vscode.fileNames).to.be.empty;
    });

    it('defaults the default file format to SVG when it is undefined', async function () {
      const files = cloneDeep(fixtFiles);
      files.default.file.format = undefined;

      const manifest = await ManifestBuilder.buildManifest(
        files,
        emptyFolderCollection,
      );

      expect(fileFormatToStringStub.firstCall.args[0]).to.be.undefined;
      expect(manifest.vscode.iconDefinitions._file.iconPath).to.equal(
        `${iconsDirRelativeBasePath}/${constants.iconsManifest.defaultPrefix}file${constants.iconsManifest.iconSuffix}.svg`,
      );
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

          expect(manifest.vscode.iconDefinitions._file.iconPath).to.equal(
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

          expect(manifest.vscode.iconDefinitions._file.iconPath).not.to.be
            .empty;
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

          expect(manifest.vscode.iconDefinitions._file.iconPath).to.equal(
            `${iconsDirRelativeBasePath}/${filename}`,
          );
        });
      });

      it(`the 'default' 'light' file has NOT an icon path`, async function () {
        const manifest = await ManifestBuilder.buildManifest(
          fixtFiles,
          emptyFolderCollection,
        );

        expect(manifest.vscode.iconDefinitions._file_light.iconPath).to.be
          .empty;
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

                expect(manifest.vscode.iconDefinitions[definition]).to.exist;
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
                const def = manifest.vscode.iconDefinitions[
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
                const def = manifest.vscode.iconDefinitions[
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

                  expect(manifest.vscode.iconDefinitions[definition]).to.exist;
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
                  const def = manifest.vscode.iconDefinitions[
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
                  const def = manifest.vscode.iconDefinitions[
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

                  expect(manifest.vscode.iconDefinitions[definition]).to.exist;
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
                  const def = manifest.vscode.iconDefinitions[
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
                  const def = manifest.vscode.iconDefinitions[
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

                      file.extensions?.forEach((extension: string) =>
                        expect(
                          manifest.vscode.fileExtensions[extension],
                        ).to.equal(definition),
                      );
                    });
                });
              });

              context('and has a light theme version', function () {
                it(`has a 'fileExtensions' referencing its definition`, async function () {
                  const files = cloneDeep(fixtFiles);
                  files.supported.find(
                    ({ icon }) => icon === 'mlang',
                  ).extensions = undefined;
                  const manifest = await ManifestBuilder.buildManifest(
                    files,
                    emptyFolderCollection,
                  );
                  files.supported
                    .filter(
                      (file: IFileExtension) =>
                        !file.filename && file.light && !file.disabled,
                    )
                    .forEach((file: IFileExtension) => {
                      const definition = `${constants.iconsManifest.definitionFilePrefix}${file.icon}`;

                      file.extensions?.forEach((extension: string) =>
                        expect(
                          manifest.vscode.fileExtensions[extension],
                        ).to.equal(definition),
                      );
                    });
                });
              });
            });

            context('that is a filename', function () {
              context('and has NOT a light theme version', function () {
                it(`has a 'fileNames' referencing its definition`, async function () {
                  const files = filesWithExtensionlessLightFilename();
                  const manifest = await ManifestBuilder.buildManifest(
                    files,
                    emptyFolderCollection,
                  );
                  files.supported
                    .filter(
                      (file: IFileExtension) =>
                        file.filename &&
                        !file.light &&
                        !file.languages &&
                        !file.disabled,
                    )
                    .forEach((file: IFileExtension) => {
                      const definition = `${constants.iconsManifest.definitionFilePrefix}${file.icon}`;

                      file.extensions?.forEach((extension: string) =>
                        expect(manifest.vscode.fileNames[extension]).to.equal(
                          definition,
                        ),
                      );
                    });
                });
              });

              context('and has a light theme version', function () {
                it(`has a 'fileNames' referencing its definition`, async function () {
                  const files = filesWithExtensionlessLightFilename();
                  const manifest = await ManifestBuilder.buildManifest(
                    files,
                    emptyFolderCollection,
                  );
                  files.supported
                    .filter(
                      (file: IFileExtension) =>
                        file.filename &&
                        !file.languages &&
                        file.light &&
                        !file.disabled,
                    )
                    .forEach((file: IFileExtension) => {
                      const definition = `${constants.iconsManifest.definitionFilePrefix}${file.icon}`;

                      file.extensions?.forEach((extension: string) =>
                        expect(manifest.vscode.fileNames[extension]).to.equal(
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
                        expect(manifest.vscode.languageIds[language]).to.equal(
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
                        expect(manifest.vscode.languageIds[language]).to.equal(
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

                      file.extensions?.forEach((extension: string) =>
                        expect(
                          manifest.vscode.light.fileExtensions[extension],
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

                      file.extensions?.forEach((extension: string) =>
                        expect(
                          manifest.vscode.light.fileExtensions[extension],
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

                      file.extensions?.forEach((extension: string) =>
                        expect(
                          manifest.vscode.light.fileNames[extension],
                        ).to.equal(definition),
                      );
                    });
                });
              });

              context('and has a light theme version', function () {
                it(`has a 'fileNames' referencing its 'light' definition`, async function () {
                  const files = filesWithExtensionlessLightFilename();
                  const manifest = await ManifestBuilder.buildManifest(
                    files,
                    emptyFolderCollection,
                  );
                  files.supported
                    .filter(
                      (file: IFileExtension) =>
                        file.filename &&
                        !file.languages &&
                        file.light &&
                        !file.disabled,
                    )
                    .forEach((file: IFileExtension) => {
                      const definition = `${constants.iconsManifest.definitionFileLightPrefix}${file.icon}`;

                      file.extensions?.forEach((extension: string) =>
                        expect(
                          manifest.vscode.light.fileNames[extension],
                        ).to.equal(definition),
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
                        expect(
                          manifest.vscode.light.languageIds[language],
                        ).to.equal(definition);
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
                        expect(
                          manifest.vscode.light.languageIds[language],
                        ).to.equal(definition);
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

      context('API schema', function () {
        it('maps files, extensions, and filenames to icon paths', async function () {
          const manifest = await ManifestBuilder.buildManifest(
            fixtFiles,
            emptyFolderCollection,
          );

          expect(manifest.api.files._default).to.equal(
            `${iconsDirRelativeBasePath}/${constants.iconsManifest.defaultPrefix}file.svg`,
          );
          expect(manifest.api.files.extensions.as).to.equal(
            `${iconsDirRelativeBasePath}/${constants.iconsManifest.fileTypePrefix}actionscript.svg`,
          );
          expect(manifest.api.files.filenames['angular-cli.json']).to.equal(
            `${iconsDirRelativeBasePath}/${constants.iconsManifest.fileTypePrefix}angular.svg`,
          );
          expect(manifest.api.light.files.extensions.plist).to.equal(
            `${iconsDirRelativeBasePath}/${constants.iconsManifest.fileTypeLightPrefix}config.svg`,
          );
        });

        it('gives supported extensions and filenames precedence over language known ones', async function () {
          const python: ILanguage = {
            ids: 'python',
            knownExtensions: ['pyc'],
            knownFilenames: ['.zshrc'],
          };
          const languageEntry: IFileExtension = {
            icon: 'python',
            extensions: [],
            languages: [python],
            format: enums.FileFormat.svg,
          };
          const nameEntries: IFileExtension[] = [
            {
              icon: 'binary',
              extensions: ['pyc'],
              format: enums.FileFormat.svg,
            },
            {
              icon: 'zsh',
              extensions: ['.zshrc'],
              filename: true,
              format: enums.FileFormat.svg,
            },
          ];
          const prefix = `${iconsDirRelativeBasePath}/${constants.iconsManifest.fileTypePrefix}`;
          const files = cloneDeep(fixtFiles);

          for (const supported of [
            [languageEntry, ...nameEntries],
            [...nameEntries, languageEntry],
          ]) {
            files.supported = supported;
            const manifest = await ManifestBuilder.buildManifest(
              files,
              emptyFolderCollection,
            );

            expect(manifest.api.files.extensions.pyc).to.equal(
              `${prefix}binary.svg`,
            );
            expect(manifest.api.files.filenames['.zshrc']).to.equal(
              `${prefix}zsh.svg`,
            );
            expect(manifest.api.light.files.extensions.pyc).to.equal(
              `${prefix}binary.svg`,
            );
            expect(manifest.api.light.files.filenames['.zshrc']).to.equal(
              `${prefix}zsh.svg`,
            );
          }
        });
      });

      context('zed theme', function () {
        it('should get official icons for official theme', async function () {
          const files = cloneDeep(fixtFiles);

          const manifest = await ManifestBuilder.buildManifest(
            files,
            emptyFolderCollection,
          );

          const officialTheme = manifest.zed.themes[1];

          // should have js
          const jsId = officialTheme.file_suffixes.js;
          expect(jsId.endsWith('official')).to.be.true;

          // should not have json
          const jsonId = officialTheme.file_suffixes.json;
          expect(jsonId.endsWith('official')).to.be.false;
        });

        it('should not have light theme defs in dark themes', async function () {
          const files = cloneDeep(fixtFiles);

          const manifest = await ManifestBuilder.buildManifest(
            files,
            emptyFolderCollection,
          );

          const darkTheme = manifest.zed.themes[0];
          const lightTheme = manifest.zed.themes[4];

          const jsDark = darkTheme.file_suffixes.js;
          const jsLight = lightTheme.file_suffixes.js;

          expect(jsDark).to.not.include('light_');
          expect(jsLight).to.include('light_');

          // Check that dark theme has only the dark version
          expect(darkTheme.file_icons).to.have.property('_f_js');
          expect(darkTheme.file_icons).to.not.have.property('_f_light_js');

          // Check that light theme has only the light version
          expect(lightTheme.file_icons).to.have.property('_f_light_js');
          expect(lightTheme.file_icons).to.not.have.property('_f_js');
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

          expect(manifest.vscode.iconDefinitions._file.iconPath).to.equal(
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

          expect(manifest.vscode.iconDefinitions._file.iconPath).not.to.be
            .empty;
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

          expect(manifest.vscode.iconDefinitions._file.iconPath).to.equal(
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

          expect(manifest.vscode.iconDefinitions._file_light.iconPath).not.to.be
            .empty;
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

          expect(manifest.vscode.iconDefinitions._file_light.iconPath).to.equal(
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

                expect(manifest.vscode.iconDefinitions[definition]).to.exist;
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
                const def = manifest.vscode.iconDefinitions[
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
                const def = manifest.vscode.iconDefinitions[
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

                  expect(manifest.vscode.iconDefinitions[definition]).to.exist;
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
                  const def = manifest.vscode.iconDefinitions[
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
                  const def = manifest.vscode.iconDefinitions[
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

                  expect(manifest.vscode.iconDefinitions[definition]).to.exist;
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
                  const def = manifest.vscode.iconDefinitions[
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
                  const def = manifest.vscode.iconDefinitions[
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

                      file.extensions?.forEach((extension: string) =>
                        expect(
                          manifest.vscode.fileExtensions[extension],
                        ).to.equal(definition),
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

                      file.extensions?.forEach((extension: string) =>
                        expect(
                          manifest.vscode.fileExtensions[extension],
                        ).to.equal(definition),
                      );
                    });
                });
              });
            });

            context('that is a filename', function () {
              context('and has NOT a light theme version', function () {
                it(`has a 'fileNames' referencing its definition`, async function () {
                  const files = filesWithExtensionlessLightFilename();
                  const manifest = await ManifestBuilder.buildManifest(
                    files,
                    emptyFolderCollection,
                  );
                  files.supported
                    .filter(
                      (file: IFileExtension) =>
                        file.filename &&
                        !file.light &&
                        !file.languages &&
                        !file.disabled,
                    )
                    .forEach((file: IFileExtension) => {
                      const definition = `${constants.iconsManifest.definitionFilePrefix}${file.icon}`;

                      file.extensions?.forEach((extension: string) =>
                        expect(manifest.vscode.fileNames[extension]).to.equal(
                          definition,
                        ),
                      );
                    });
                });
              });

              context('and has a light theme version', function () {
                it(`has a 'fileNames' referencing its definition`, async function () {
                  const files = filesWithExtensionlessLightFilename();
                  const manifest = await ManifestBuilder.buildManifest(
                    files,
                    emptyFolderCollection,
                  );
                  files.supported
                    .filter(
                      (file: IFileExtension) =>
                        file.filename &&
                        !file.languages &&
                        file.light &&
                        !file.disabled,
                    )
                    .forEach((file: IFileExtension) => {
                      const definition = `${constants.iconsManifest.definitionFilePrefix}${file.icon}`;

                      file.extensions?.forEach((extension: string) =>
                        expect(manifest.vscode.fileNames[extension]).to.equal(
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
                        expect(manifest.vscode.languageIds[language]).to.equal(
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
                        expect(manifest.vscode.languageIds[language]).to.equal(
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

                      file.extensions?.forEach((extension: string) =>
                        expect(
                          manifest.vscode.light.fileExtensions[extension],
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

                      file.extensions?.forEach((extension: string) =>
                        expect(
                          manifest.vscode.light.fileExtensions[extension],
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

                      file.extensions?.forEach((extension: string) =>
                        expect(
                          manifest.vscode.light.fileNames[extension],
                        ).to.equal(definition),
                      );
                    });
                });
              });

              context('and has a light theme version', function () {
                it(`has a 'fileNames' referencing its 'light' definition`, async function () {
                  const files = filesWithExtensionlessLightFilename();
                  const manifest = await ManifestBuilder.buildManifest(
                    files,
                    emptyFolderCollection,
                  );
                  files.supported
                    .filter(
                      (file: IFileExtension) =>
                        file.filename &&
                        !file.languages &&
                        file.light &&
                        !file.disabled,
                    )
                    .forEach((file: IFileExtension) => {
                      const definition = `${constants.iconsManifest.definitionFileLightPrefix}${file.icon}`;

                      file.extensions?.forEach((extension: string) =>
                        expect(
                          manifest.vscode.light.fileNames[extension],
                        ).to.equal(definition),
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
                        expect(
                          manifest.vscode.light.languageIds[language],
                        ).to.equal(definition);
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
                        expect(
                          manifest.vscode.light.languageIds[language],
                        ).to.equal(definition);
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

        expect(manifest.vscode.iconDefinitions._file.iconPath).not.to.be.empty;
        expect(manifest.vscode.iconDefinitions._file.iconPath).to.equal(
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
        expect(manifest.vscode.iconDefinitions._file.iconPath).not.to.be.empty;
        expect(manifest.vscode.iconDefinitions._file.iconPath).to.equal(
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

        expect(manifest.vscode.iconDefinitions._file.iconPath).not.to.be.empty;
        expect(manifest.vscode.iconDefinitions._file.iconPath).to.equal(
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
