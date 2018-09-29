// tslint:disable only-arrow-functions
// tslint:disable no-unused-expression
import { expect } from 'chai';
import * as sinon from 'sinon';
import * as fs from 'fs';
import { IFileCollection } from '../../../src/models';
import { ManifestBuilder } from '../../../src/iconsManifest';
import { constants } from '../../../src/constants';
import { Utils } from '../../../src/utils';
import { extensions as fixtFolders } from '../../fixtures/supportedFolders';

describe('ManifestBuilder: folders icons test', function () {
  context('ensures that', function () {
    let sandbox: sinon.SinonSandbox;
    let pathUnixJoinStub: sinon.SinonStub;
    let emptyFileCollection: IFileCollection;

    const iconsDirRelativeBasePath = '../../path/to/icons/dir';

    beforeEach(function () {
      sandbox = sinon.createSandbox();

      sandbox.stub(Utils, 'fileFormatToString').returns('.svg');

      sandbox.stub(Utils, 'getRelativePath').returns(iconsDirRelativeBasePath);
      pathUnixJoinStub = sandbox
        .stub(Utils, 'pathUnixJoin')
        .callsFake((fpath: string, file: string) => `${fpath}/${file}`);

      emptyFileCollection = {
        default: { file: { icon: 'file', format: 'svg' } },
        supported: [],
      };
    });

    afterEach(function () {
      sandbox.restore();
    });

    context(`if a default 'light' icon is NOT defined`, function () {
      context(`the 'default' folder`, function () {
        it(`has an icon path`, function () {
          const manifest = ManifestBuilder.buildManifest(
            emptyFileCollection,
            fixtFolders
          );

          expect(manifest.iconDefinitions._folder.iconPath).not.to.be.empty;
        });

        it(`icon path has the correct structure`, function () {
          const filename = `${constants.iconsManifest.defaultPrefix}${
            fixtFolders.default.folder.icon
          }${constants.iconsManifest.iconSuffix}${Utils.fileFormatToString(
            fixtFolders.default.folder.format
          )}`;

          const manifest = ManifestBuilder.buildManifest(
            emptyFileCollection,
            fixtFolders
          );

          expect(manifest.iconDefinitions._folder.iconPath).to.equal(
            `${iconsDirRelativeBasePath}/${filename}`
          );
        });
      });

      context(`the 'default' open folder`, function () {
        it(`has an icon path`, function () {
          const manifest = ManifestBuilder.buildManifest(
            emptyFileCollection,
            fixtFolders
          );

          expect(
            manifest.iconDefinitions._folder_open.iconPath
          ).not.to.be.empty;
        });

        it(`icon path has the correct structure`, function () {
          const filename = `${constants.iconsManifest.defaultPrefix}${
            fixtFolders.default.folder.icon
          }_opened${
            constants.iconsManifest.iconSuffix
          }${Utils.fileFormatToString(fixtFolders.default.folder.format)}`;

          const manifest = ManifestBuilder.buildManifest(
            emptyFileCollection,
            fixtFolders
          );

          expect(manifest.iconDefinitions._folder_open.iconPath).to.equal(
            `${iconsDirRelativeBasePath}/${filename}`
          );
        });
      });

      it(`the 'default' 'light' folder has NOT an icon path`, function () {
        const manifest = ManifestBuilder.buildManifest(
          emptyFileCollection,
          fixtFolders
        );

        expect(manifest.iconDefinitions._folder_light.iconPath).to.be.empty;
      });

      it(`the 'default' 'light' open folder has NOT an icon path`, function () {
        const manifest = ManifestBuilder.buildManifest(
          emptyFileCollection,
          fixtFolders
        );

        expect(
          manifest.iconDefinitions._folder_light_open.iconPath
        ).to.be.empty;
      });

      context(`the 'root' folder`, function () {
        it(`has an icon path`, function () {
          const manifest = ManifestBuilder.buildManifest(
            emptyFileCollection,
            fixtFolders
          );

          expect(
            manifest.iconDefinitions._root_folder.iconPath
          ).not.to.be.empty;
        });

        it(`icon path has the correct structure`, function () {
          const filename = `${constants.iconsManifest.defaultPrefix}${
            fixtFolders.default.root_folder.icon
          }${constants.iconsManifest.iconSuffix}${Utils.fileFormatToString(
            fixtFolders.default.root_folder.format
          )}`;

          const manifest = ManifestBuilder.buildManifest(
            emptyFileCollection,
            fixtFolders
          );

          expect(manifest.iconDefinitions._root_folder.iconPath).to.equal(
            `${iconsDirRelativeBasePath}/${filename}`
          );
        });
      });

      context(`the 'root' open folder`, function () {
        it(`has an icon path`, function () {
          const manifest = ManifestBuilder.buildManifest(
            emptyFileCollection,
            fixtFolders
          );

          expect(
            manifest.iconDefinitions._root_folder_open.iconPath
          ).not.to.be.empty;
        });

        it(`icon path has the correct structure`, function () {
          const filename = `${constants.iconsManifest.defaultPrefix}${
            fixtFolders.default.root_folder.icon
          }_opened${
            constants.iconsManifest.iconSuffix
          }${Utils.fileFormatToString(fixtFolders.default.root_folder.format)}`;

          const manifest = ManifestBuilder.buildManifest(
            emptyFileCollection,
            fixtFolders
          );

          expect(manifest.iconDefinitions._root_folder_open.iconPath).to.equal(
            `${iconsDirRelativeBasePath}/${filename}`
          );
        });
      });

      it(`the 'root' 'light' folder has NOT an icon path`, function () {
        const manifest = ManifestBuilder.buildManifest(
          emptyFileCollection,
          fixtFolders
        );

        expect(
          manifest.iconDefinitions._root_folder_light.iconPath
        ).to.be.empty;
      });

      it(`the 'root' 'light' open folder has NOT an icon path`, function () {
        const manifest = ManifestBuilder.buildManifest(
          emptyFileCollection,
          fixtFolders
        );

        expect(
          manifest.iconDefinitions._root_folder_light_open.iconPath
        ).to.be.empty;
      });

      context('each supported', function () {
        context('folder', function () {
          it('has a definition', function () {
            const manifest = ManifestBuilder.buildManifest(
              emptyFileCollection,
              fixtFolders
            );
            fixtFolders.supported
              .filter(folder => !folder.disabled)
              .forEach(folder => {
                const definition = `${
                  constants.iconsManifest.definitionFolderPrefix
                }${folder.icon}`;

                expect(manifest.iconDefinitions[definition]).to.exist;
              });
          });

          it(`has an 'open' definition`, function () {
            const manifest = ManifestBuilder.buildManifest(
              emptyFileCollection,
              fixtFolders
            );

            fixtFolders.supported
              .filter(folder => !folder.disabled)
              .forEach(folder => {
                const definition = `${
                  constants.iconsManifest.definitionFolderPrefix
                }${folder.icon}_open`;

                expect(manifest.iconDefinitions[definition]).to.exist;
              });
          });

          it('has an icon path', function () {
            const manifest = ManifestBuilder.buildManifest(
              emptyFileCollection,
              fixtFolders
            );
            fixtFolders.supported
              .filter(folder => !folder.disabled)
              .forEach(folder => {
                const definition = `${
                  constants.iconsManifest.definitionFolderPrefix
                }${folder.icon}`;

                expect(manifest.iconDefinitions[definition].iconPath).not.to.be
                  .empty;
              });
          });

          it(`has an 'opened' icon path`, function () {
            const manifest = ManifestBuilder.buildManifest(
              emptyFileCollection,
              fixtFolders
            );
            fixtFolders.supported
              .filter(folder => !folder.disabled)
              .forEach(folder => {
                const definition = `${
                  constants.iconsManifest.definitionFolderPrefix
                }${folder.icon}_open`;

                expect(manifest.iconDefinitions[definition].iconPath).not.to.be
                  .empty;
              });
          });

          context('icon path has the correct structure', function () {
            it(`for closed folder`, function () {
              const manifest = ManifestBuilder.buildManifest(
                emptyFileCollection,
                fixtFolders
              );

              fixtFolders.supported
                .filter(folder => !folder.disabled)
                .forEach(folder => {
                  const filename = `${
                    constants.iconsManifest.folderTypePrefix
                  }${folder.icon}${
                    constants.iconsManifest.iconSuffix
                  }${Utils.fileFormatToString(folder.format)}`;

                  const definition = `${
                    constants.iconsManifest.definitionFolderPrefix
                  }${folder.icon}`;

                  expect(
                    manifest.iconDefinitions[definition].iconPath
                  ).to.equal(`${iconsDirRelativeBasePath}/${filename}`);
                });
            });

            it(`for opened folder`, function () {
              const manifest = ManifestBuilder.buildManifest(
                emptyFileCollection,
                fixtFolders
              );

              fixtFolders.supported
                .filter(folder => !folder.disabled)
                .forEach(folder => {
                  const filename = `${
                    constants.iconsManifest.folderTypePrefix
                  }${folder.icon}_opened${
                    constants.iconsManifest.iconSuffix
                  }${Utils.fileFormatToString(folder.format)}`;

                  const definition = `${
                    constants.iconsManifest.definitionFolderPrefix
                  }${folder.icon}_open`;

                  expect(
                    manifest.iconDefinitions[definition].iconPath
                  ).to.equal(`${iconsDirRelativeBasePath}/${filename}`);
                });
            });
          });

          context('that has NOT a light theme version', function () {
            it('has a definition', function () {
              const manifest = ManifestBuilder.buildManifest(
                emptyFileCollection,
                fixtFolders
              );
              fixtFolders.supported
                .filter(folder => !folder.light && !folder.disabled)
                .forEach(folder => {
                  const definition = `${
                    constants.iconsManifest.definitionFolderPrefix
                  }${folder.icon}`;

                  expect(manifest.iconDefinitions[definition]).to.exist;
                });
            });

            it(`has an 'open' definition`, function () {
              const manifest = ManifestBuilder.buildManifest(
                emptyFileCollection,
                fixtFolders
              );

              fixtFolders.supported
                .filter(folder => !folder.light && !folder.disabled)
                .forEach(folder => {
                  const definition = `${
                    constants.iconsManifest.definitionFolderPrefix
                  }${folder.icon}_open`;

                  expect(manifest.iconDefinitions[definition]).to.exist;
                });
            });

            it('has an icon path', function () {
              const manifest = ManifestBuilder.buildManifest(
                emptyFileCollection,
                fixtFolders
              );
              fixtFolders.supported
                .filter(folder => !folder.light && !folder.disabled)
                .forEach(folder => {
                  const definition = `${
                    constants.iconsManifest.definitionFolderPrefix
                  }${folder.icon}`;

                  expect(manifest.iconDefinitions[definition].iconPath).not.to
                    .be.empty;
                });
            });

            it(`has an 'opened' icon path`, function () {
              const manifest = ManifestBuilder.buildManifest(
                emptyFileCollection,
                fixtFolders
              );
              fixtFolders.supported
                .filter(folder => !folder.light && !folder.disabled)
                .forEach(folder => {
                  const definition = `${
                    constants.iconsManifest.definitionFolderPrefix
                  }${folder.icon}_open`;

                  expect(manifest.iconDefinitions[definition].iconPath).not.to
                    .be.empty;
                });
            });

            context('icon path has the correct structure', function () {
              it(`for closed folder`, function () {
                const manifest = ManifestBuilder.buildManifest(
                  emptyFileCollection,
                  fixtFolders
                );

                fixtFolders.supported
                  .filter(folder => !folder.light && !folder.disabled)
                  .forEach(folder => {
                    const filename = `${
                      constants.iconsManifest.folderTypePrefix
                    }${folder.icon}${
                      constants.iconsManifest.iconSuffix
                    }${Utils.fileFormatToString(folder.format)}`;

                    const definition = `${
                      constants.iconsManifest.definitionFolderPrefix
                    }${folder.icon}`;

                    expect(
                      manifest.iconDefinitions[definition].iconPath
                    ).to.equal(`${iconsDirRelativeBasePath}/${filename}`);
                  });
              });

              it(`for opened folder`, function () {
                const manifest = ManifestBuilder.buildManifest(
                  emptyFileCollection,
                  fixtFolders
                );

                fixtFolders.supported
                  .filter(folder => !folder.light && !folder.disabled)
                  .forEach(folder => {
                    const filename = `${
                      constants.iconsManifest.folderTypePrefix
                    }${folder.icon}_opened${
                      constants.iconsManifest.iconSuffix
                    }${Utils.fileFormatToString(folder.format)}`;

                    const definition = `${
                      constants.iconsManifest.definitionFolderPrefix
                    }${folder.icon}_open`;

                    expect(
                      manifest.iconDefinitions[definition].iconPath
                    ).to.equal(`${iconsDirRelativeBasePath}/${filename}`);
                  });
              });
            });
          });

          context('that has a light theme version', function () {
            it(`has a 'light' definition`, function () {
              const manifest = ManifestBuilder.buildManifest(
                emptyFileCollection,
                fixtFolders
              );
              fixtFolders.supported
                .filter(folder => folder.light && !folder.disabled)
                .forEach(folder => {
                  const definition = `${
                    constants.iconsManifest.definitionFolderLightPrefix
                  }${folder.icon}`;

                  expect(manifest.iconDefinitions[definition]).to.exist;
                });
            });

            it(`has a 'light' 'open' definition`, function () {
              const manifest = ManifestBuilder.buildManifest(
                emptyFileCollection,
                fixtFolders
              );
              fixtFolders.supported
                .filter(folder => folder.light && !folder.disabled)
                .forEach(folder => {
                  const definition = `${
                    constants.iconsManifest.definitionFolderLightPrefix
                  }${folder.icon}_open`;

                  expect(manifest.iconDefinitions[definition]).to.exist;
                });
            });

            it('has an icon path', function () {
              const manifest = ManifestBuilder.buildManifest(
                emptyFileCollection,
                fixtFolders
              );
              fixtFolders.supported
                .filter(folder => folder.light && !folder.disabled)
                .forEach(folder => {
                  const definition = `${
                    constants.iconsManifest.definitionFolderLightPrefix
                  }${folder.icon}`;

                  expect(manifest.iconDefinitions[definition].iconPath).not.to
                    .be.empty;
                });
            });

            it(`has an 'opened' icon path`, function () {
              const manifest = ManifestBuilder.buildManifest(
                emptyFileCollection,
                fixtFolders
              );
              fixtFolders.supported
                .filter(folder => folder.light && !folder.disabled)
                .forEach(folder => {
                  const definition = `${
                    constants.iconsManifest.definitionFolderLightPrefix
                  }${folder.icon}_open`;

                  expect(manifest.iconDefinitions[definition].iconPath).not.to
                    .be.empty;
                });
            });

            context('icon path has the correct structure', function () {
              it(`for closed folder`, function () {
                const manifest = ManifestBuilder.buildManifest(
                  emptyFileCollection,
                  fixtFolders
                );

                fixtFolders.supported
                  .filter(folder => folder.light && !folder.disabled)
                  .forEach(folder => {
                    const filename = `${
                      constants.iconsManifest.folderTypePrefix
                    }${folder.icon}${
                      constants.iconsManifest.iconSuffix
                    }${Utils.fileFormatToString(folder.format)}`;

                    const definition = `${
                      constants.iconsManifest.definitionFolderPrefix
                    }${folder.icon}`;

                    expect(
                      manifest.iconDefinitions[definition].iconPath
                    ).to.equal(`${iconsDirRelativeBasePath}/${filename}`);
                  });
              });

              it(`for opened folder`, function () {
                const manifest = ManifestBuilder.buildManifest(
                  emptyFileCollection,
                  fixtFolders
                );

                fixtFolders.supported
                  .filter(folder => folder.light && !folder.disabled)
                  .forEach(folder => {
                    const filename = `${
                      constants.iconsManifest.folderTypePrefix
                    }${folder.icon}_opened${
                      constants.iconsManifest.iconSuffix
                    }${Utils.fileFormatToString(folder.format)}`;

                    const definition = `${
                      constants.iconsManifest.definitionFolderPrefix
                    }${folder.icon}_open`;

                    expect(
                      manifest.iconDefinitions[definition].iconPath
                    ).to.equal(`${iconsDirRelativeBasePath}/${filename}`);
                  });
              });
            });
          });

          context('for a dark color theme', function () {
            context('and has NOT a light theme version', function () {
              it(`has a 'folderNames' extension referencing its definition`, function () {
                const manifest = ManifestBuilder.buildManifest(
                  emptyFileCollection,
                  fixtFolders
                );
                fixtFolders.supported
                  .filter(folder => !folder.light && !folder.disabled)
                  .forEach(folder => {
                    const definition = `${
                      constants.iconsManifest.definitionFolderPrefix
                    }${folder.icon}`;

                    folder.extensions.forEach(extension =>
                      expect(manifest.folderNames[extension]).to.equal(
                        definition
                      )
                    );
                  });
              });

              it(`has a 'folderNamesExpanded' extension referencing its definition`, function () {
                const manifest = ManifestBuilder.buildManifest(
                  emptyFileCollection,
                  fixtFolders
                );
                fixtFolders.supported
                  .filter(folder => !folder.light && !folder.disabled)
                  .forEach(folder => {
                    const definition = `${
                      constants.iconsManifest.definitionFolderPrefix
                    }${folder.icon}_open`;

                    folder.extensions.forEach(extension =>
                      expect(manifest.folderNamesExpanded[extension]).to.equal(
                        definition
                      )
                    );
                  });
              });
            });

            context('and has a light theme version', function () {
              it(`has a 'folderNames' extension referencing its definition`, function () {
                const manifest = ManifestBuilder.buildManifest(
                  emptyFileCollection,
                  fixtFolders
                );
                fixtFolders.supported
                  .filter(folder => folder.light && !folder.disabled)
                  .forEach(folder => {
                    const definition = `${
                      constants.iconsManifest.definitionFolderPrefix
                    }${folder.icon}`;

                    folder.extensions.forEach(extension =>
                      expect(manifest.folderNames[extension]).to.equal(
                        definition
                      )
                    );
                  });
              });

              it(`has a 'folderNamesExpanded' extension referencing its definition`, function () {
                const manifest = ManifestBuilder.buildManifest(
                  emptyFileCollection,
                  fixtFolders
                );
                fixtFolders.supported
                  .filter(folder => folder.light && !folder.disabled)
                  .forEach(folder => {
                    const definition = `${
                      constants.iconsManifest.definitionFolderPrefix
                    }${folder.icon}_open`;

                    folder.extensions.forEach(extension =>
                      expect(manifest.folderNamesExpanded[extension]).to.equal(
                        definition
                      )
                    );
                  });
              });
            });
          });

          context('for a light color theme', function () {
            context('and has NOT a light theme version', function () {
              it(`has a 'folderNames' extension referencing its 'dark' definition`, function () {
                const manifest = ManifestBuilder.buildManifest(
                  emptyFileCollection,
                  fixtFolders
                );
                fixtFolders.supported
                  .filter(folder => !folder.light && !folder.disabled)
                  .forEach(folder => {
                    const definition = `${
                      constants.iconsManifest.definitionFolderPrefix
                    }${folder.icon}`;

                    folder.extensions.forEach(extension =>
                      expect(manifest.light.folderNames[extension]).to.equal(
                        definition
                      )
                    );
                  });
              });

              it(`has a 'folderNamesExpanded' extension referencing its 'dark' definition`, function () {
                const manifest = ManifestBuilder.buildManifest(
                  emptyFileCollection,
                  fixtFolders
                );
                fixtFolders.supported
                  .filter(folder => !folder.light && !folder.disabled)
                  .forEach(folder => {
                    const definition = `${
                      constants.iconsManifest.definitionFolderPrefix
                    }${folder.icon}_open`;

                    folder.extensions.forEach(extension =>
                      expect(
                        manifest.light.folderNamesExpanded[extension]
                      ).to.equal(definition)
                    );
                  });
              });
            });

            context('and has a light theme version', function () {
              it(`has a 'folderNames' extension referencing its 'light' definition`, function () {
                const manifest = ManifestBuilder.buildManifest(
                  emptyFileCollection,
                  fixtFolders
                );
                fixtFolders.supported
                  .filter(folder => folder.light && !folder.disabled)
                  .forEach(folder => {
                    const definition = `${
                      constants.iconsManifest.definitionFolderLightPrefix
                    }${folder.icon}`;

                    folder.extensions.forEach(extension =>
                      expect(manifest.light.folderNames[extension]).to.equal(
                        definition
                      )
                    );
                  });
              });

              it(`has a 'folderNamesExpanded' extension referencing its 'light' definition`, function () {
                const manifest = ManifestBuilder.buildManifest(
                  emptyFileCollection,
                  fixtFolders
                );
                fixtFolders.supported
                  .filter(folder => folder.light && !folder.disabled)
                  .forEach(folder => {
                    const definition = `${
                      constants.iconsManifest.definitionFolderLightPrefix
                    }${folder.icon}_open`;

                    folder.extensions.forEach(extension =>
                      expect(
                        manifest.light.folderNamesExpanded[extension]
                      ).to.equal(definition)
                    );
                  });
              });
            });
          });
        });
      });
    });

    context(`if a default 'light' icon is defined`, function () {
      beforeEach(function () {
        fixtFolders.default.folder_light = {
          icon: 'folder_light',
          format: 'svg',
        };
      });

      afterEach(function () {
        fixtFolders.default.folder_light = undefined;
      });

      context(`the 'default' folder`, function () {
        it(`has an icon path`, function () {
          const manifest = ManifestBuilder.buildManifest(
            emptyFileCollection,
            fixtFolders
          );

          expect(manifest.iconDefinitions._folder.iconPath).not.to.be.empty;
        });

        it(`icon path has the correct structure`, function () {
          const filename = `${constants.iconsManifest.defaultPrefix}${
            fixtFolders.default.folder.icon
          }${constants.iconsManifest.iconSuffix}${Utils.fileFormatToString(
            fixtFolders.default.folder.format
          )}`;

          const manifest = ManifestBuilder.buildManifest(
            emptyFileCollection,
            fixtFolders
          );

          expect(manifest.iconDefinitions._folder.iconPath).to.equal(
            `${iconsDirRelativeBasePath}/${filename}`
          );
        });
      });

      context(`the 'default' open folder`, function () {
        it(`has an icon path`, function () {
          const manifest = ManifestBuilder.buildManifest(
            emptyFileCollection,
            fixtFolders
          );

          expect(
            manifest.iconDefinitions._folder_open.iconPath
          ).not.to.be.empty;
        });

        it(`icon path has the correct structure`, function () {
          const filename = `${constants.iconsManifest.defaultPrefix}${
            fixtFolders.default.folder.icon
          }_opened${
            constants.iconsManifest.iconSuffix
          }${Utils.fileFormatToString(fixtFolders.default.folder.format)}`;

          const manifest = ManifestBuilder.buildManifest(
            emptyFileCollection,
            fixtFolders
          );

          expect(manifest.iconDefinitions._folder_open.iconPath).to.equal(
            `${iconsDirRelativeBasePath}/${filename}`
          );
        });
      });

      context(`the 'default' 'light' folder`, function () {
        it(`has an icon path`, function () {
          const manifest = ManifestBuilder.buildManifest(
            emptyFileCollection,
            fixtFolders
          );

          expect(
            manifest.iconDefinitions._folder_light.iconPath
          ).not.to.be.empty;
        });

        it(`icon path has the correct structure`, function () {
          const filename = `${constants.iconsManifest.defaultPrefix}${
            fixtFolders.default.folder_light.icon
          }${constants.iconsManifest.iconSuffix}${Utils.fileFormatToString(
            fixtFolders.default.folder_light.format
          )}`;

          const manifest = ManifestBuilder.buildManifest(
            emptyFileCollection,
            fixtFolders
          );

          expect(manifest.iconDefinitions._folder_light.iconPath).to.equal(
            `${iconsDirRelativeBasePath}/${filename}`
          );
        });
      });

      context(`the 'default' 'light' open folder`, function () {
        it(`has an icon path`, function () {
          const manifest = ManifestBuilder.buildManifest(
            emptyFileCollection,
            fixtFolders
          );

          expect(
            manifest.iconDefinitions._folder_light_open.iconPath
          ).not.to.be.empty;
        });

        it(`icon path has the correct structure`, function () {
          const filename = `${constants.iconsManifest.defaultPrefix}${
            fixtFolders.default.folder_light.icon
          }_opened${
            constants.iconsManifest.iconSuffix
          }${Utils.fileFormatToString(
            fixtFolders.default.folder_light.format
          )}`;

          const manifest = ManifestBuilder.buildManifest(
            emptyFileCollection,
            fixtFolders
          );

          expect(manifest.iconDefinitions._folder_light_open.iconPath).to.equal(
            `${iconsDirRelativeBasePath}/${filename}`
          );
        });
      });

      context(`the 'root' folder`, function () {
        it(`has an icon path`, function () {
          const manifest = ManifestBuilder.buildManifest(
            emptyFileCollection,
            fixtFolders
          );

          expect(
            manifest.iconDefinitions._root_folder.iconPath
          ).not.to.be.empty;
        });

        it(`icon path has the correct structure`, function () {
          const filename = `${constants.iconsManifest.defaultPrefix}${
            fixtFolders.default.root_folder.icon
          }${constants.iconsManifest.iconSuffix}${Utils.fileFormatToString(
            fixtFolders.default.root_folder.format
          )}`;

          const manifest = ManifestBuilder.buildManifest(
            emptyFileCollection,
            fixtFolders
          );

          expect(manifest.iconDefinitions._root_folder.iconPath).to.equal(
            `${iconsDirRelativeBasePath}/${filename}`
          );
        });
      });

      context(`the 'root' open folder`, function () {
        it(`has an icon path`, function () {
          const manifest = ManifestBuilder.buildManifest(
            emptyFileCollection,
            fixtFolders
          );

          expect(
            manifest.iconDefinitions._root_folder_open.iconPath
          ).not.to.be.empty;
        });

        it(`icon path has the correct structure`, function () {
          const filename = `${constants.iconsManifest.defaultPrefix}${
            fixtFolders.default.root_folder.icon
          }_opened${
            constants.iconsManifest.iconSuffix
          }${Utils.fileFormatToString(fixtFolders.default.root_folder.format)}`;

          const manifest = ManifestBuilder.buildManifest(
            emptyFileCollection,
            fixtFolders
          );

          expect(manifest.iconDefinitions._root_folder_open.iconPath).to.equal(
            `${iconsDirRelativeBasePath}/${filename}`
          );
        });
      });

      it(`the 'root' 'light' folder has NOT an icon path`, function () {
        const manifest = ManifestBuilder.buildManifest(
          emptyFileCollection,
          fixtFolders
        );

        expect(
          manifest.iconDefinitions._root_folder_light.iconPath
        ).to.be.empty;
      });

      it(`the 'root' 'light' open folder has NOT an icon path`, function () {
        const manifest = ManifestBuilder.buildManifest(
          emptyFileCollection,
          fixtFolders
        );

        expect(
          manifest.iconDefinitions._root_folder_light_open.iconPath
        ).to.be.empty;
      });

      context('each supported', function () {
        context('folder', function () {
          it('has a definition', function () {
            const manifest = ManifestBuilder.buildManifest(
              emptyFileCollection,
              fixtFolders
            );
            fixtFolders.supported
              .filter(folder => !folder.disabled)
              .forEach(folder => {
                const definition = `${
                  constants.iconsManifest.definitionFolderPrefix
                }${folder.icon}`;

                expect(manifest.iconDefinitions[definition]).to.exist;
              });
          });

          it(`has an 'open' definition`, function () {
            const manifest = ManifestBuilder.buildManifest(
              emptyFileCollection,
              fixtFolders
            );

            fixtFolders.supported
              .filter(folder => !folder.disabled)
              .forEach(folder => {
                const definition = `${
                  constants.iconsManifest.definitionFolderPrefix
                }${folder.icon}_open`;

                expect(manifest.iconDefinitions[definition]).to.exist;
              });
          });

          it('has an icon path', function () {
            const manifest = ManifestBuilder.buildManifest(
              emptyFileCollection,
              fixtFolders
            );
            fixtFolders.supported
              .filter(folder => !folder.disabled)
              .forEach(folder => {
                const definition = `${
                  constants.iconsManifest.definitionFolderPrefix
                }${folder.icon}`;

                expect(manifest.iconDefinitions[definition].iconPath).not.to.be
                  .empty;
              });
          });

          it(`has an 'opened' icon path`, function () {
            const manifest = ManifestBuilder.buildManifest(
              emptyFileCollection,
              fixtFolders
            );
            fixtFolders.supported
              .filter(folder => !folder.disabled)
              .forEach(folder => {
                const definition = `${
                  constants.iconsManifest.definitionFolderPrefix
                }${folder.icon}_open`;

                expect(manifest.iconDefinitions[definition].iconPath).not.to.be
                  .empty;
              });
          });

          context('icon path has the correct structure', function () {
            it(`for closed folder`, function () {
              const manifest = ManifestBuilder.buildManifest(
                emptyFileCollection,
                fixtFolders
              );

              fixtFolders.supported
                .filter(folder => !folder.disabled)
                .forEach(folder => {
                  const filename = `${
                    constants.iconsManifest.folderTypePrefix
                  }${folder.icon}${
                    constants.iconsManifest.iconSuffix
                  }${Utils.fileFormatToString(folder.format)}`;

                  const definition = `${
                    constants.iconsManifest.definitionFolderPrefix
                  }${folder.icon}`;

                  expect(
                    manifest.iconDefinitions[definition].iconPath
                  ).to.equal(`${iconsDirRelativeBasePath}/${filename}`);
                });
            });

            it(`for opened folder`, function () {
              const manifest = ManifestBuilder.buildManifest(
                emptyFileCollection,
                fixtFolders
              );

              fixtFolders.supported
                .filter(folder => !folder.disabled)
                .forEach(folder => {
                  const filename = `${
                    constants.iconsManifest.folderTypePrefix
                  }${folder.icon}_opened${
                    constants.iconsManifest.iconSuffix
                  }${Utils.fileFormatToString(folder.format)}`;

                  const definition = `${
                    constants.iconsManifest.definitionFolderPrefix
                  }${folder.icon}_open`;

                  expect(
                    manifest.iconDefinitions[definition].iconPath
                  ).to.equal(`${iconsDirRelativeBasePath}/${filename}`);
                });
            });
          });

          context('that has NOT a light theme version', function () {
            it('has a definition', function () {
              const manifest = ManifestBuilder.buildManifest(
                emptyFileCollection,
                fixtFolders
              );
              fixtFolders.supported
                .filter(folder => !folder.light && !folder.disabled)
                .forEach(folder => {
                  const definition = `${
                    constants.iconsManifest.definitionFolderPrefix
                  }${folder.icon}`;

                  expect(manifest.iconDefinitions[definition]).to.exist;
                });
            });

            it(`has an 'open' definition`, function () {
              const manifest = ManifestBuilder.buildManifest(
                emptyFileCollection,
                fixtFolders
              );

              fixtFolders.supported
                .filter(folder => !folder.light && !folder.disabled)
                .forEach(folder => {
                  const definition = `${
                    constants.iconsManifest.definitionFolderPrefix
                  }${folder.icon}_open`;

                  expect(manifest.iconDefinitions[definition]).to.exist;
                });
            });

            it('has an icon path', function () {
              const manifest = ManifestBuilder.buildManifest(
                emptyFileCollection,
                fixtFolders
              );
              fixtFolders.supported
                .filter(folder => !folder.light && !folder.disabled)
                .forEach(folder => {
                  const definition = `${
                    constants.iconsManifest.definitionFolderPrefix
                  }${folder.icon}`;

                  expect(manifest.iconDefinitions[definition].iconPath).not.to
                    .be.empty;
                });
            });

            it(`has an 'opened' icon path`, function () {
              const manifest = ManifestBuilder.buildManifest(
                emptyFileCollection,
                fixtFolders
              );
              fixtFolders.supported
                .filter(folder => !folder.light && !folder.disabled)
                .forEach(folder => {
                  const definition = `${
                    constants.iconsManifest.definitionFolderPrefix
                  }${folder.icon}_open`;

                  expect(manifest.iconDefinitions[definition].iconPath).not.to
                    .be.empty;
                });
            });

            context('icon path has the correct structure', function () {
              it(`for closed folder`, function () {
                const manifest = ManifestBuilder.buildManifest(
                  emptyFileCollection,
                  fixtFolders
                );

                fixtFolders.supported
                  .filter(folder => !folder.light && !folder.disabled)
                  .forEach(folder => {
                    const filename = `${
                      constants.iconsManifest.folderTypePrefix
                    }${folder.icon}${
                      constants.iconsManifest.iconSuffix
                    }${Utils.fileFormatToString(folder.format)}`;

                    const definition = `${
                      constants.iconsManifest.definitionFolderPrefix
                    }${folder.icon}`;

                    expect(
                      manifest.iconDefinitions[definition].iconPath
                    ).to.equal(`${iconsDirRelativeBasePath}/${filename}`);
                  });
              });

              it(`for opened folder`, function () {
                const manifest = ManifestBuilder.buildManifest(
                  emptyFileCollection,
                  fixtFolders
                );

                fixtFolders.supported
                  .filter(folder => !folder.light && !folder.disabled)
                  .forEach(folder => {
                    const filename = `${
                      constants.iconsManifest.folderTypePrefix
                    }${folder.icon}_opened${
                      constants.iconsManifest.iconSuffix
                    }${Utils.fileFormatToString(folder.format)}`;

                    const definition = `${
                      constants.iconsManifest.definitionFolderPrefix
                    }${folder.icon}_open`;

                    expect(
                      manifest.iconDefinitions[definition].iconPath
                    ).to.equal(`${iconsDirRelativeBasePath}/${filename}`);
                  });
              });
            });
          });

          context('that has a light theme version', function () {
            it(`has a 'light' definition`, function () {
              const manifest = ManifestBuilder.buildManifest(
                emptyFileCollection,
                fixtFolders
              );
              fixtFolders.supported
                .filter(folder => folder.light && !folder.disabled)
                .forEach(folder => {
                  const definition = `${
                    constants.iconsManifest.definitionFolderLightPrefix
                  }${folder.icon}`;

                  expect(manifest.iconDefinitions[definition]).to.exist;
                });
            });

            it(`has a 'light' 'open' definition`, function () {
              const manifest = ManifestBuilder.buildManifest(
                emptyFileCollection,
                fixtFolders
              );
              fixtFolders.supported
                .filter(folder => folder.light && !folder.disabled)
                .forEach(folder => {
                  const definition = `${
                    constants.iconsManifest.definitionFolderLightPrefix
                  }${folder.icon}_open`;

                  expect(manifest.iconDefinitions[definition]).to.exist;
                });
            });

            it('has an icon path', function () {
              const manifest = ManifestBuilder.buildManifest(
                emptyFileCollection,
                fixtFolders
              );
              fixtFolders.supported
                .filter(folder => folder.light && !folder.disabled)
                .forEach(folder => {
                  const definition = `${
                    constants.iconsManifest.definitionFolderLightPrefix
                  }${folder.icon}`;

                  expect(manifest.iconDefinitions[definition].iconPath).not.to
                    .be.empty;
                });
            });

            it(`has an 'opened' icon path`, function () {
              const manifest = ManifestBuilder.buildManifest(
                emptyFileCollection,
                fixtFolders
              );
              fixtFolders.supported
                .filter(folder => folder.light && !folder.disabled)
                .forEach(folder => {
                  const definition = `${
                    constants.iconsManifest.definitionFolderLightPrefix
                  }${folder.icon}_open`;

                  expect(manifest.iconDefinitions[definition].iconPath).not.to
                    .be.empty;
                });
            });

            context('icon path has the correct structure', function () {
              it(`for closed folder`, function () {
                const manifest = ManifestBuilder.buildManifest(
                  emptyFileCollection,
                  fixtFolders
                );

                fixtFolders.supported
                  .filter(folder => folder.light && !folder.disabled)
                  .forEach(folder => {
                    const filename = `${
                      constants.iconsManifest.folderTypePrefix
                    }${folder.icon}${
                      constants.iconsManifest.iconSuffix
                    }${Utils.fileFormatToString(folder.format)}`;

                    const definition = `${
                      constants.iconsManifest.definitionFolderPrefix
                    }${folder.icon}`;

                    expect(
                      manifest.iconDefinitions[definition].iconPath
                    ).to.equal(`${iconsDirRelativeBasePath}/${filename}`);
                  });
              });

              it(`for opened folder`, function () {
                const manifest = ManifestBuilder.buildManifest(
                  emptyFileCollection,
                  fixtFolders
                );

                fixtFolders.supported
                  .filter(folder => folder.light && !folder.disabled)
                  .forEach(folder => {
                    const filename = `${
                      constants.iconsManifest.folderTypePrefix
                    }${folder.icon}_opened${
                      constants.iconsManifest.iconSuffix
                    }${Utils.fileFormatToString(folder.format)}`;

                    const definition = `${
                      constants.iconsManifest.definitionFolderPrefix
                    }${folder.icon}_open`;

                    expect(
                      manifest.iconDefinitions[definition].iconPath
                    ).to.equal(`${iconsDirRelativeBasePath}/${filename}`);
                  });
              });
            });
          });

          context('for a dark color theme', function () {
            context('and has NOT a light theme version', function () {
              it(`has a 'folderNames' extension referencing its definition`, function () {
                const manifest = ManifestBuilder.buildManifest(
                  emptyFileCollection,
                  fixtFolders
                );
                fixtFolders.supported
                  .filter(folder => !folder.light && !folder.disabled)
                  .forEach(folder => {
                    const definition = `${
                      constants.iconsManifest.definitionFolderPrefix
                    }${folder.icon}`;

                    folder.extensions.forEach(extension =>
                      expect(manifest.folderNames[extension]).to.equal(
                        definition
                      )
                    );
                  });
              });

              it(`has a 'folderNamesExpanded' extension referencing its definition`, function () {
                const manifest = ManifestBuilder.buildManifest(
                  emptyFileCollection,
                  fixtFolders
                );
                fixtFolders.supported
                  .filter(folder => !folder.light && !folder.disabled)
                  .forEach(folder => {
                    const definition = `${
                      constants.iconsManifest.definitionFolderPrefix
                    }${folder.icon}_open`;

                    folder.extensions.forEach(extension =>
                      expect(manifest.folderNamesExpanded[extension]).to.equal(
                        definition
                      )
                    );
                  });
              });
            });

            context('and has a light theme version', function () {
              it(`has a 'folderNames' extension referencing its definition`, function () {
                const manifest = ManifestBuilder.buildManifest(
                  emptyFileCollection,
                  fixtFolders
                );
                fixtFolders.supported
                  .filter(folder => folder.light && !folder.disabled)
                  .forEach(folder => {
                    const definition = `${
                      constants.iconsManifest.definitionFolderPrefix
                    }${folder.icon}`;

                    folder.extensions.forEach(extension =>
                      expect(manifest.folderNames[extension]).to.equal(
                        definition
                      )
                    );
                  });
              });

              it(`has a 'folderNamesExpanded' extension referencing its definition`, function () {
                const manifest = ManifestBuilder.buildManifest(
                  emptyFileCollection,
                  fixtFolders
                );
                fixtFolders.supported
                  .filter(folder => folder.light && !folder.disabled)
                  .forEach(folder => {
                    const definition = `${
                      constants.iconsManifest.definitionFolderPrefix
                    }${folder.icon}_open`;

                    folder.extensions.forEach(extension =>
                      expect(manifest.folderNamesExpanded[extension]).to.equal(
                        definition
                      )
                    );
                  });
              });
            });
          });

          context('for a light color theme', function () {
            context('and has NOT a light theme version', function () {
              it(`has a 'folderNames' extension referencing its 'dark' definition`, function () {
                const manifest = ManifestBuilder.buildManifest(
                  emptyFileCollection,
                  fixtFolders
                );
                fixtFolders.supported
                  .filter(folder => !folder.light && !folder.disabled)
                  .forEach(folder => {
                    const definition = `${
                      constants.iconsManifest.definitionFolderPrefix
                    }${folder.icon}`;

                    folder.extensions.forEach(extension =>
                      expect(manifest.light.folderNames[extension]).to.equal(
                        definition
                      )
                    );
                  });
              });

              it(`has a 'folderNamesExpanded' extension referencing its 'dark' definition`, function () {
                const manifest = ManifestBuilder.buildManifest(
                  emptyFileCollection,
                  fixtFolders
                );
                fixtFolders.supported
                  .filter(folder => !folder.light && !folder.disabled)
                  .forEach(folder => {
                    const definition = `${
                      constants.iconsManifest.definitionFolderPrefix
                    }${folder.icon}_open`;

                    folder.extensions.forEach(extension =>
                      expect(
                        manifest.light.folderNamesExpanded[extension]
                      ).to.equal(definition)
                    );
                  });
              });
            });

            context('and has a light theme version', function () {
              it(`has a 'folderNames' extension referencing its 'light' definition`, function () {
                const manifest = ManifestBuilder.buildManifest(
                  emptyFileCollection,
                  fixtFolders
                );
                fixtFolders.supported
                  .filter(folder => folder.light && !folder.disabled)
                  .forEach(folder => {
                    const definition = `${
                      constants.iconsManifest.definitionFolderLightPrefix
                    }${folder.icon}`;

                    folder.extensions.forEach(extension =>
                      expect(manifest.light.folderNames[extension]).to.equal(
                        definition
                      )
                    );
                  });
              });

              it(`has a 'folderNamesExpanded' extension referencing its 'light' definition`, function () {
                const manifest = ManifestBuilder.buildManifest(
                  emptyFileCollection,
                  fixtFolders
                );
                fixtFolders.supported
                  .filter(folder => folder.light && !folder.disabled)
                  .forEach(folder => {
                    const definition = `${
                      constants.iconsManifest.definitionFolderLightPrefix
                    }${folder.icon}_open`;

                    folder.extensions.forEach(extension =>
                      expect(
                        manifest.light.folderNamesExpanded[extension]
                      ).to.equal(definition)
                    );
                  });
              });
            });
          });
        });
      });
    });

    context(`if a default 'root' 'light' icon is defined`, function () {
      beforeEach(function () {
        fixtFolders.default.root_folder_light = {
          icon: 'root_file_light',
          format: 'svg',
        };
      });

      afterEach(function () {
        fixtFolders.default.root_folder_light = undefined;
      });

      context(`the 'default' folder`, function () {
        it(`has an icon path`, function () {
          const manifest = ManifestBuilder.buildManifest(
            emptyFileCollection,
            fixtFolders
          );

          expect(manifest.iconDefinitions._folder.iconPath).not.to.be.empty;
        });

        it(`icon path has the correct structure`, function () {
          const filename = `${constants.iconsManifest.defaultPrefix}${
            fixtFolders.default.folder.icon
          }${constants.iconsManifest.iconSuffix}${Utils.fileFormatToString(
            fixtFolders.default.folder.format
          )}`;

          const manifest = ManifestBuilder.buildManifest(
            emptyFileCollection,
            fixtFolders
          );

          expect(manifest.iconDefinitions._folder.iconPath).to.equal(
            `${iconsDirRelativeBasePath}/${filename}`
          );
        });
      });

      context(`the 'default' open folder`, function () {
        it(`has an icon path`, function () {
          const manifest = ManifestBuilder.buildManifest(
            emptyFileCollection,
            fixtFolders
          );

          expect(
            manifest.iconDefinitions._folder_open.iconPath
          ).not.to.be.empty;
        });

        it(`icon path has the correct structure`, function () {
          const filename = `${constants.iconsManifest.defaultPrefix}${
            fixtFolders.default.folder.icon
          }_opened${
            constants.iconsManifest.iconSuffix
          }${Utils.fileFormatToString(fixtFolders.default.folder.format)}`;

          const manifest = ManifestBuilder.buildManifest(
            emptyFileCollection,
            fixtFolders
          );

          expect(manifest.iconDefinitions._folder_open.iconPath).to.equal(
            `${iconsDirRelativeBasePath}/${filename}`
          );
        });
      });

      it(`the 'default' 'light' folder has NOT an icon path`, function () {
        const manifest = ManifestBuilder.buildManifest(
          emptyFileCollection,
          fixtFolders
        );

        expect(manifest.iconDefinitions._folder_light.iconPath).to.be.empty;
      });

      it(`the 'default' 'light' open folder has NOT an icon path`, function () {
        const manifest = ManifestBuilder.buildManifest(
          emptyFileCollection,
          fixtFolders
        );

        expect(
          manifest.iconDefinitions._folder_light_open.iconPath
        ).to.be.empty;
      });

      context(`the 'root' folder`, function () {
        it(`has an icon path`, function () {
          const manifest = ManifestBuilder.buildManifest(
            emptyFileCollection,
            fixtFolders
          );

          expect(
            manifest.iconDefinitions._root_folder.iconPath
          ).not.to.be.empty;
        });

        it(`icon path has the correct structure`, function () {
          const filename = `${constants.iconsManifest.defaultPrefix}${
            fixtFolders.default.root_folder.icon
          }${constants.iconsManifest.iconSuffix}${Utils.fileFormatToString(
            fixtFolders.default.root_folder.format
          )}`;

          const manifest = ManifestBuilder.buildManifest(
            emptyFileCollection,
            fixtFolders
          );

          expect(manifest.iconDefinitions._root_folder.iconPath).to.equal(
            `${iconsDirRelativeBasePath}/${filename}`
          );
        });
      });

      context(`the 'root' open folder`, function () {
        it(`has an icon path`, function () {
          const manifest = ManifestBuilder.buildManifest(
            emptyFileCollection,
            fixtFolders
          );

          expect(
            manifest.iconDefinitions._root_folder_open.iconPath
          ).not.to.be.empty;
        });

        it(`icon path has the correct structure`, function () {
          const filename = `${constants.iconsManifest.defaultPrefix}${
            fixtFolders.default.root_folder.icon
          }_opened${
            constants.iconsManifest.iconSuffix
          }${Utils.fileFormatToString(fixtFolders.default.root_folder.format)}`;

          const manifest = ManifestBuilder.buildManifest(
            emptyFileCollection,
            fixtFolders
          );

          expect(manifest.iconDefinitions._root_folder_open.iconPath).to.equal(
            `${iconsDirRelativeBasePath}/${filename}`
          );
        });
      });

      context(`the 'root' 'light' folder`, function () {
        it(`has an icon path`, function () {
          const manifest = ManifestBuilder.buildManifest(
            emptyFileCollection,
            fixtFolders
          );

          expect(
            manifest.iconDefinitions._root_folder_light.iconPath
          ).not.to.be.empty;
        });

        it(`icon path has the correct structure`, function () {
          const filename = `${constants.iconsManifest.defaultPrefix}${
            fixtFolders.default.root_folder_light.icon
          }${constants.iconsManifest.iconSuffix}${Utils.fileFormatToString(
            fixtFolders.default.root_folder_light.format
          )}`;

          const manifest = ManifestBuilder.buildManifest(
            emptyFileCollection,
            fixtFolders
          );

          expect(manifest.iconDefinitions._root_folder_light.iconPath).to.equal(
            `${iconsDirRelativeBasePath}/${filename}`
          );
        });
      });

      context(`the 'root' 'light' open folder`, function () {
        it(`has an icon path`, function () {
          const manifest = ManifestBuilder.buildManifest(
            emptyFileCollection,
            fixtFolders
          );

          expect(
            manifest.iconDefinitions._root_folder_light_open.iconPath
          ).not.to.be.empty;
        });

        it(`icon path has the correct structure`, function () {
          const filename = `${constants.iconsManifest.defaultPrefix}${
            fixtFolders.default.root_folder_light.icon
          }_opened${
            constants.iconsManifest.iconSuffix
          }${Utils.fileFormatToString(
            fixtFolders.default.root_folder_light.format
          )}`;

          const manifest = ManifestBuilder.buildManifest(
            emptyFileCollection,
            fixtFolders
          );

          expect(
            manifest.iconDefinitions._root_folder_light_open.iconPath
          ).to.equal(`${iconsDirRelativeBasePath}/${filename}`);
        });
      });

      context('each supported', function () {
        context('folder', function () {
          it('has a definition', function () {
            const manifest = ManifestBuilder.buildManifest(
              emptyFileCollection,
              fixtFolders
            );
            fixtFolders.supported
              .filter(folder => !folder.disabled)
              .forEach(folder => {
                const definition = `${
                  constants.iconsManifest.definitionFolderPrefix
                }${folder.icon}`;

                expect(manifest.iconDefinitions[definition]).to.exist;
              });
          });

          it(`has an 'open' definition`, function () {
            const manifest = ManifestBuilder.buildManifest(
              emptyFileCollection,
              fixtFolders
            );

            fixtFolders.supported
              .filter(folder => !folder.disabled)
              .forEach(folder => {
                const definition = `${
                  constants.iconsManifest.definitionFolderPrefix
                }${folder.icon}_open`;

                expect(manifest.iconDefinitions[definition]).to.exist;
              });
          });

          it('has an icon path', function () {
            const manifest = ManifestBuilder.buildManifest(
              emptyFileCollection,
              fixtFolders
            );
            fixtFolders.supported
              .filter(folder => !folder.disabled)
              .forEach(folder => {
                const definition = `${
                  constants.iconsManifest.definitionFolderPrefix
                }${folder.icon}`;

                expect(manifest.iconDefinitions[definition].iconPath).not.to.be
                  .empty;
              });
          });

          it(`has an 'opened' icon path`, function () {
            const manifest = ManifestBuilder.buildManifest(
              emptyFileCollection,
              fixtFolders
            );
            fixtFolders.supported
              .filter(folder => !folder.disabled)
              .forEach(folder => {
                const definition = `${
                  constants.iconsManifest.definitionFolderPrefix
                }${folder.icon}_open`;

                expect(manifest.iconDefinitions[definition].iconPath).not.to.be
                  .empty;
              });
          });

          context('icon path has the correct structure', function () {
            it(`for closed folder`, function () {
              const manifest = ManifestBuilder.buildManifest(
                emptyFileCollection,
                fixtFolders
              );

              fixtFolders.supported
                .filter(folder => !folder.disabled)
                .forEach(folder => {
                  const filename = `${
                    constants.iconsManifest.folderTypePrefix
                  }${folder.icon}${
                    constants.iconsManifest.iconSuffix
                  }${Utils.fileFormatToString(folder.format)}`;

                  const definition = `${
                    constants.iconsManifest.definitionFolderPrefix
                  }${folder.icon}`;

                  expect(
                    manifest.iconDefinitions[definition].iconPath
                  ).to.equal(`${iconsDirRelativeBasePath}/${filename}`);
                });
            });

            it(`for opened folder`, function () {
              const manifest = ManifestBuilder.buildManifest(
                emptyFileCollection,
                fixtFolders
              );

              fixtFolders.supported
                .filter(folder => !folder.disabled)
                .forEach(folder => {
                  const filename = `${
                    constants.iconsManifest.folderTypePrefix
                  }${folder.icon}_opened${
                    constants.iconsManifest.iconSuffix
                  }${Utils.fileFormatToString(folder.format)}`;

                  const definition = `${
                    constants.iconsManifest.definitionFolderPrefix
                  }${folder.icon}_open`;

                  expect(
                    manifest.iconDefinitions[definition].iconPath
                  ).to.equal(`${iconsDirRelativeBasePath}/${filename}`);
                });
            });
          });

          context('that has NOT a light theme version', function () {
            it('has a definition', function () {
              const manifest = ManifestBuilder.buildManifest(
                emptyFileCollection,
                fixtFolders
              );
              fixtFolders.supported
                .filter(folder => !folder.light && !folder.disabled)
                .forEach(folder => {
                  const definition = `${
                    constants.iconsManifest.definitionFolderPrefix
                  }${folder.icon}`;

                  expect(manifest.iconDefinitions[definition]).to.exist;
                });
            });

            it(`has an 'open' definition`, function () {
              const manifest = ManifestBuilder.buildManifest(
                emptyFileCollection,
                fixtFolders
              );

              fixtFolders.supported
                .filter(folder => !folder.light && !folder.disabled)
                .forEach(folder => {
                  const definition = `${
                    constants.iconsManifest.definitionFolderPrefix
                  }${folder.icon}_open`;

                  expect(manifest.iconDefinitions[definition]).to.exist;
                });
            });

            it('has an icon path', function () {
              const manifest = ManifestBuilder.buildManifest(
                emptyFileCollection,
                fixtFolders
              );
              fixtFolders.supported
                .filter(folder => !folder.light && !folder.disabled)
                .forEach(folder => {
                  const definition = `${
                    constants.iconsManifest.definitionFolderPrefix
                  }${folder.icon}`;

                  expect(manifest.iconDefinitions[definition].iconPath).not.to
                    .be.empty;
                });
            });

            it(`has an 'opened' icon path`, function () {
              const manifest = ManifestBuilder.buildManifest(
                emptyFileCollection,
                fixtFolders
              );
              fixtFolders.supported
                .filter(folder => !folder.light && !folder.disabled)
                .forEach(folder => {
                  const definition = `${
                    constants.iconsManifest.definitionFolderPrefix
                  }${folder.icon}_open`;

                  expect(manifest.iconDefinitions[definition].iconPath).not.to
                    .be.empty;
                });
            });

            context('icon path has the correct structure', function () {
              it(`for closed folder`, function () {
                const manifest = ManifestBuilder.buildManifest(
                  emptyFileCollection,
                  fixtFolders
                );

                fixtFolders.supported
                  .filter(folder => !folder.light && !folder.disabled)
                  .forEach(folder => {
                    const filename = `${
                      constants.iconsManifest.folderTypePrefix
                    }${folder.icon}${
                      constants.iconsManifest.iconSuffix
                    }${Utils.fileFormatToString(folder.format)}`;

                    const definition = `${
                      constants.iconsManifest.definitionFolderPrefix
                    }${folder.icon}`;

                    expect(
                      manifest.iconDefinitions[definition].iconPath
                    ).to.equal(`${iconsDirRelativeBasePath}/${filename}`);
                  });
              });

              it(`for opened folder`, function () {
                const manifest = ManifestBuilder.buildManifest(
                  emptyFileCollection,
                  fixtFolders
                );

                fixtFolders.supported
                  .filter(folder => !folder.light && !folder.disabled)
                  .forEach(folder => {
                    const filename = `${
                      constants.iconsManifest.folderTypePrefix
                    }${folder.icon}_opened${
                      constants.iconsManifest.iconSuffix
                    }${Utils.fileFormatToString(folder.format)}`;

                    const definition = `${
                      constants.iconsManifest.definitionFolderPrefix
                    }${folder.icon}_open`;

                    expect(
                      manifest.iconDefinitions[definition].iconPath
                    ).to.equal(`${iconsDirRelativeBasePath}/${filename}`);
                  });
              });
            });
          });

          context('that has a light theme version', function () {
            it(`has a 'light' definition`, function () {
              const manifest = ManifestBuilder.buildManifest(
                emptyFileCollection,
                fixtFolders
              );
              fixtFolders.supported
                .filter(folder => folder.light && !folder.disabled)
                .forEach(folder => {
                  const definition = `${
                    constants.iconsManifest.definitionFolderLightPrefix
                  }${folder.icon}`;

                  expect(manifest.iconDefinitions[definition]).to.exist;
                });
            });

            it(`has a 'light' 'open' definition`, function () {
              const manifest = ManifestBuilder.buildManifest(
                emptyFileCollection,
                fixtFolders
              );
              fixtFolders.supported
                .filter(folder => folder.light && !folder.disabled)
                .forEach(folder => {
                  const definition = `${
                    constants.iconsManifest.definitionFolderLightPrefix
                  }${folder.icon}_open`;

                  expect(manifest.iconDefinitions[definition]).to.exist;
                });
            });

            it('has an icon path', function () {
              const manifest = ManifestBuilder.buildManifest(
                emptyFileCollection,
                fixtFolders
              );
              fixtFolders.supported
                .filter(folder => folder.light && !folder.disabled)
                .forEach(folder => {
                  const definition = `${
                    constants.iconsManifest.definitionFolderLightPrefix
                  }${folder.icon}`;

                  expect(manifest.iconDefinitions[definition].iconPath).not.to
                    .be.empty;
                });
            });

            it(`has an 'opened' icon path`, function () {
              const manifest = ManifestBuilder.buildManifest(
                emptyFileCollection,
                fixtFolders
              );
              fixtFolders.supported
                .filter(folder => folder.light && !folder.disabled)
                .forEach(folder => {
                  const definition = `${
                    constants.iconsManifest.definitionFolderLightPrefix
                  }${folder.icon}_open`;

                  expect(manifest.iconDefinitions[definition].iconPath).not.to
                    .be.empty;
                });
            });

            context('icon path has the correct structure', function () {
              it(`for closed folder`, function () {
                const manifest = ManifestBuilder.buildManifest(
                  emptyFileCollection,
                  fixtFolders
                );

                fixtFolders.supported
                  .filter(folder => folder.light && !folder.disabled)
                  .forEach(folder => {
                    const filename = `${
                      constants.iconsManifest.folderTypePrefix
                    }${folder.icon}${
                      constants.iconsManifest.iconSuffix
                    }${Utils.fileFormatToString(folder.format)}`;

                    const definition = `${
                      constants.iconsManifest.definitionFolderPrefix
                    }${folder.icon}`;

                    expect(
                      manifest.iconDefinitions[definition].iconPath
                    ).to.equal(`${iconsDirRelativeBasePath}/${filename}`);
                  });
              });

              it(`for opened folder`, function () {
                const manifest = ManifestBuilder.buildManifest(
                  emptyFileCollection,
                  fixtFolders
                );

                fixtFolders.supported
                  .filter(folder => folder.light && !folder.disabled)
                  .forEach(folder => {
                    const filename = `${
                      constants.iconsManifest.folderTypePrefix
                    }${folder.icon}_opened${
                      constants.iconsManifest.iconSuffix
                    }${Utils.fileFormatToString(folder.format)}`;

                    const definition = `${
                      constants.iconsManifest.definitionFolderPrefix
                    }${folder.icon}_open`;

                    expect(
                      manifest.iconDefinitions[definition].iconPath
                    ).to.equal(`${iconsDirRelativeBasePath}/${filename}`);
                  });
              });
            });
          });

          context('for a dark color theme', function () {
            context('and has NOT a light theme version', function () {
              it(`has a 'folderNames' extension referencing its definition`, function () {
                const manifest = ManifestBuilder.buildManifest(
                  emptyFileCollection,
                  fixtFolders
                );
                fixtFolders.supported
                  .filter(folder => !folder.light && !folder.disabled)
                  .forEach(folder => {
                    const definition = `${
                      constants.iconsManifest.definitionFolderPrefix
                    }${folder.icon}`;

                    folder.extensions.forEach(extension =>
                      expect(manifest.folderNames[extension]).to.equal(
                        definition
                      )
                    );
                  });
              });

              it(`has a 'folderNamesExpanded' extension referencing its definition`, function () {
                const manifest = ManifestBuilder.buildManifest(
                  emptyFileCollection,
                  fixtFolders
                );
                fixtFolders.supported
                  .filter(folder => !folder.light && !folder.disabled)
                  .forEach(folder => {
                    const definition = `${
                      constants.iconsManifest.definitionFolderPrefix
                    }${folder.icon}_open`;

                    folder.extensions.forEach(extension =>
                      expect(manifest.folderNamesExpanded[extension]).to.equal(
                        definition
                      )
                    );
                  });
              });
            });

            context('and has a light theme version', function () {
              it(`has a 'folderNames' extension referencing its definition`, function () {
                const manifest = ManifestBuilder.buildManifest(
                  emptyFileCollection,
                  fixtFolders
                );
                fixtFolders.supported
                  .filter(folder => folder.light && !folder.disabled)
                  .forEach(folder => {
                    const definition = `${
                      constants.iconsManifest.definitionFolderPrefix
                    }${folder.icon}`;

                    folder.extensions.forEach(extension =>
                      expect(manifest.folderNames[extension]).to.equal(
                        definition
                      )
                    );
                  });
              });

              it(`has a 'folderNamesExpanded' extension referencing its definition`, function () {
                const manifest = ManifestBuilder.buildManifest(
                  emptyFileCollection,
                  fixtFolders
                );
                fixtFolders.supported
                  .filter(folder => folder.light && !folder.disabled)
                  .forEach(folder => {
                    const definition = `${
                      constants.iconsManifest.definitionFolderPrefix
                    }${folder.icon}_open`;

                    folder.extensions.forEach(extension =>
                      expect(manifest.folderNamesExpanded[extension]).to.equal(
                        definition
                      )
                    );
                  });
              });
            });
          });

          context('for a light color theme', function () {
            context('and has NOT a light theme version', function () {
              it(`has a 'folderNames' extension referencing its 'dark' definition`, function () {
                const manifest = ManifestBuilder.buildManifest(
                  emptyFileCollection,
                  fixtFolders
                );
                fixtFolders.supported
                  .filter(folder => !folder.light && !folder.disabled)
                  .forEach(folder => {
                    const definition = `${
                      constants.iconsManifest.definitionFolderPrefix
                    }${folder.icon}`;

                    folder.extensions.forEach(extension =>
                      expect(manifest.light.folderNames[extension]).to.equal(
                        definition
                      )
                    );
                  });
              });

              it(`has a 'folderNamesExpanded' extension referencing its 'dark' definition`, function () {
                const manifest = ManifestBuilder.buildManifest(
                  emptyFileCollection,
                  fixtFolders
                );
                fixtFolders.supported
                  .filter(folder => !folder.light && !folder.disabled)
                  .forEach(folder => {
                    const definition = `${
                      constants.iconsManifest.definitionFolderPrefix
                    }${folder.icon}_open`;

                    folder.extensions.forEach(extension =>
                      expect(
                        manifest.light.folderNamesExpanded[extension]
                      ).to.equal(definition)
                    );
                  });
              });
            });

            context('and has a light theme version', function () {
              it(`has a 'folderNames' extension referencing its 'light' definition`, function () {
                const manifest = ManifestBuilder.buildManifest(
                  emptyFileCollection,
                  fixtFolders
                );
                fixtFolders.supported
                  .filter(folder => folder.light && !folder.disabled)
                  .forEach(folder => {
                    const definition = `${
                      constants.iconsManifest.definitionFolderLightPrefix
                    }${folder.icon}`;

                    folder.extensions.forEach(extension =>
                      expect(manifest.light.folderNames[extension]).to.equal(
                        definition
                      )
                    );
                  });
              });

              it(`has a 'folderNamesExpanded' extension referencing its 'light' definition`, function () {
                const manifest = ManifestBuilder.buildManifest(
                  emptyFileCollection,
                  fixtFolders
                );
                fixtFolders.supported
                  .filter(folder => folder.light && !folder.disabled)
                  .forEach(folder => {
                    const definition = `${
                      constants.iconsManifest.definitionFolderLightPrefix
                    }${folder.icon}_open`;

                    folder.extensions.forEach(extension =>
                      expect(
                        manifest.light.folderNamesExpanded[extension]
                      ).to.equal(definition)
                    );
                  });
              });
            });
          });
        });
      });
    });

    context(`when a custom icons directory path is provided`, function () {
      let existsSyncStub: sinon.SinonStub;
      let belongToSameDriveStub: sinon.SinonStub;
      let overwriteDriveStub: sinon.SinonStub;

      const customIconDirPath = 'path/to/custom/icons/dir';

      beforeEach(function () {
        existsSyncStub = sandbox.stub(fs, 'existsSync').returns(true);
        belongToSameDriveStub = sandbox
          .stub(Utils, 'belongToSameDrive')
          .returns(true);
        overwriteDriveStub = sandbox.stub(Utils, 'overwriteDrive');
      });

      context(`an Error gets thrown`, function () {
        it(`if the closed and opened icons are NOT in the same directory`, function () {
          sandbox
            // @ts-ignore
            .stub(ManifestBuilder, 'getIconPath')
            .callsFake(
              (file: string) =>
                /opened/g.test(file) ? '' : iconsDirRelativeBasePath
            );

          expect(() =>
            ManifestBuilder.buildManifest(
              emptyFileCollection,
              fixtFolders,
              customIconDirPath
            )
          ).to.throw(
            Error,
            /Folder icons for '.*' must be placed in the same directory/
          );
        });
      });

      it(`that path is used, when it has a custom icon`, function () {
        pathUnixJoinStub.returns(
          `${customIconDirPath}/${constants.extension.customIconFolderName}`
        );

        const manifest = ManifestBuilder.buildManifest(
          emptyFileCollection,
          fixtFolders,
          customIconDirPath
        );

        expect(manifest.iconDefinitions._folder.iconPath).not.to.be.empty;
        expect(manifest.iconDefinitions._folder.iconPath).to.equal(
          `${customIconDirPath}/${constants.extension.customIconFolderName}`
        );
      });

      it(`that path is NOT used, when it has NOT a custom icon`, function () {
        existsSyncStub.returns(false);
        pathUnixJoinStub.returns(
          `${iconsDirRelativeBasePath}/${
            constants.extension.customIconFolderName
          }`
        );

        const manifest = ManifestBuilder.buildManifest(
          emptyFileCollection,
          fixtFolders,
          customIconDirPath
        );
        expect(manifest.iconDefinitions._folder.iconPath).not.to.be.empty;
        expect(manifest.iconDefinitions._folder.iconPath).to.equal(
          `${iconsDirRelativeBasePath}/${
            constants.extension.customIconFolderName
          }`
        );
      });

      it(`that path gets sanitized, when it's NOT on the same drive`, function () {
        belongToSameDriveStub.returns(false);

        const manifest = ManifestBuilder.buildManifest(
          emptyFileCollection,
          fixtFolders,
          customIconDirPath
        );

        expect(manifest.iconDefinitions._folder.iconPath).not.to.be.empty;
        expect(manifest.iconDefinitions._folder.iconPath).to.equal(
          `${iconsDirRelativeBasePath}/${
            constants.iconsManifest.defaultPrefix
          }folder.svg`
        );
        expect(
          overwriteDriveStub.calledWith(
            `${customIconDirPath}/${constants.extension.customIconFolderName}`
          )
        ).to.be.true;
      });
    });
  });
});
