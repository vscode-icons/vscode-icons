import { expect } from 'chai';
import proxyq from 'proxyquire';
import * as sinon from 'sinon';
import { sys } from 'typescript';

import { ErrorHandler } from '../../src/common/errorHandler';
import { ConfigManager } from '../../src/configuration/configManager';
import { constants } from '../../src/constants';
import { vscodeSchema } from '../../src/types/iconSchema/vscode';

describe('Build: tests', function () {
  context('ensures that', function () {
    let sandbox: sinon.SinonSandbox;
    let generateIconsManifestStub: sinon.SinonStub;
    let persistStub: sinon.SinonStub;
    let logErrorStub: sinon.SinonStub;
    let infoStub: sinon.SinonStub;
    let build: () => Promise<void>;

    before(function () {
      proxyq.noCallThru();
    });

    after(function () {
      proxyq.callThru();
    });

    beforeEach(function () {
      sandbox = sinon.createSandbox();

      generateIconsManifestStub = sandbox.stub().resolves(vscodeSchema);
      persistStub = sandbox.stub().resolves();
      logErrorStub = sandbox.stub(ErrorHandler, 'logError');
      infoStub = sandbox.stub(console, 'info').get(() => infoStub);

      const iconsGeneratorStub = sandbox.stub().callsFake(() => ({
        generateIconsManifest: generateIconsManifestStub,
        persist: persistStub,
      }));
      build = (): Promise<void> =>
        proxyq('../../src/tools/build', {
          '../iconsManifest/iconsGenerator': {
            IconsGenerator: iconsGeneratorStub,
          },
        }) as Promise<void>;
    });

    afterEach(function () {
      sandbox.restore();
    });

    context(`the 'build' script`, function () {
      let originalRootDir: string;
      let originalExitCode: string | number | undefined;

      beforeEach(function () {
        originalRootDir = ConfigManager.rootDir;
        originalExitCode = process.exitCode;
      });

      afterEach(function () {
        ConfigManager.rootDir = originalRootDir;
        process.exitCode = originalExitCode;
        constants.environment.production = false;
      });

      it(`generates and saves the default icons manifest`, async function () {
        await build();

        expect(
          generateIconsManifestStub.calledOnce,
          'generateIconsManifest should be called once',
        ).to.be.true;
        expect(
          persistStub.calledOnceWithExactly(vscodeSchema, false),
          'persist should be called once with correct arguments',
        ).to.be.true;
        expect(logErrorStub.called).to.be.false;
      });

      it(`generates and saves the API JSON schema`, async function () {
        ConfigManager.rootDir = process.cwd();
        const generatedSchema = {
          $schema: 'https://json-schema.org/draft/2020-12/schema',
          type: 'object',
        };
        const createSchemaStub = sandbox.stub().returns(generatedSchema);
        const createGeneratorStub = sandbox
          .stub()
          .returns({ createSchema: createSchemaStub });
        const writeFileAsyncStub = sandbox.stub().resolves();
        const buildWithSchemaStubs = (): Promise<void> =>
          proxyq('../../src/tools/build', {
            '../iconsManifest/iconsGenerator': {
              IconsGenerator: sandbox.stub().callsFake(() => ({
                generateIconsManifest: generateIconsManifestStub,
                persist: persistStub,
              })),
            },
            '../common/fsAsync': { writeFileAsync: writeFileAsyncStub },
            'ts-json-schema-generator': {
              createGenerator: createGeneratorStub,
            },
          }) as Promise<void>;

        await buildWithSchemaStubs();

        // The build runs fire-and-forget on import,
        // so let its promise chain finish before asserting
        await new Promise<void>(resolve => setImmediate(resolve));

        expect(logErrorStub.called).to.be.false;
        expect(
          createGeneratorStub.calledOnce,
          'createGenerator should be called once',
        ).to.be.true;
        expect(createGeneratorStub.firstCall.args[0]).to.deep.equal({
          path: `${ConfigManager.rootDir}/${constants.schemas.apiSourceFile}`,
          skipTypeCheck: true,
          topRef: false,
          tsconfig: `${ConfigManager.rootDir}/tsconfig.json`,
          type: 'ApiIconSchema',
        });
        expect(
          createSchemaStub.calledOnceWithExactly('ApiIconSchema'),
          'createSchema should receive the discovered API type name',
        ).to.be.true;
        expect(
          writeFileAsyncStub.calledOnceWithExactly(
            `${ConfigManager.rootDir}/${constants.schemas.apiSchemaFile}`,
            JSON.stringify(
              {
                $schema: generatedSchema.$schema,
                title: 'ApiIconSchema',
                type: 'object',
              },
              null,
              2,
            ),
          ),
          'writeFileAsync should persist the titled API schema',
        ).to.be.true;
      });

      it(`does not throw an error when generating the API JSON schema`, async function () {
        ConfigManager.rootDir = process.cwd();
        const writeFileAsyncStub = sandbox.stub().resolves();
        const buildWithRealSchemaGenerator = (): Promise<void> =>
          proxyq('../../src/tools/build', {
            '../iconsManifest/iconsGenerator': {
              IconsGenerator: sandbox.stub().callsFake(() => ({
                generateIconsManifest: generateIconsManifestStub,
                persist: persistStub,
              })),
            },
            '../common/fsAsync': { writeFileAsync: writeFileAsyncStub },
          }) as Promise<void>;

        await buildWithRealSchemaGenerator();
        await new Promise<void>(resolve => setImmediate(resolve));

        expect(logErrorStub.called).to.be.false;
        expect(writeFileAsyncStub.calledOnce).to.be.true;
      });

      context(`prints a success message to 'console' stdout`, function () {
        it(`when the API JSON schema is generated`, async function () {
          ConfigManager.rootDir = process.cwd();
          const writeFileAsyncStub = sandbox.stub().resolves();
          const buildWithRealSchemaGenerator = (): Promise<void> =>
            proxyq('../../src/tools/build', {
              '../iconsManifest/iconsGenerator': {
                IconsGenerator: sandbox.stub().callsFake(() => ({
                  generateIconsManifest: generateIconsManifestStub,
                  persist: persistStub,
                })),
              },
              '../common/fsAsync': { writeFileAsync: writeFileAsyncStub },
            }) as Promise<void>;

          await buildWithRealSchemaGenerator();
          await new Promise<void>(resolve => setImmediate(resolve));

          expect(logErrorStub.called).to.be.false;
          expect(
            infoStub.calledOnceWithExactly(
              `[${constants.extension.apiName}] API schema file successfully generated!`,
            ),
          ).to.be.true;
        });
      });

      it(`logs an error when the API schema declaration has no type annotation`, async function () {
        ConfigManager.rootDir = process.cwd();
        sandbox.stub(sys, 'readFile').returns('export const apiSchema = {};');

        await build();
        await new Promise<void>(resolve => setImmediate(resolve));

        expect(logErrorStub.calledOnce).to.be.true;
        expect(logErrorStub.firstCall.args[0]).to.be.instanceOf(Error);
        expect((logErrorStub.firstCall.args[0] as Error).message).to.equal(
          'Unable to find the API schema type annotation',
        );
      });

      it(`logs an error when the API schema declaration is missing`, async function () {
        ConfigManager.rootDir = process.cwd();
        sandbox.stub(sys, 'readFile').returns('export const otherSchema = {};');

        await build();
        await new Promise<void>(resolve => setImmediate(resolve));

        expect(logErrorStub.calledOnce).to.be.true;
        expect(logErrorStub.firstCall.args[0]).to.be.instanceOf(Error);
        expect((logErrorStub.firstCall.args[0] as Error).message).to.equal(
          'Unable to find the API schema type annotation',
        );
      });

      it(`logs an error when the API schema annotation is not a type reference`, async function () {
        ConfigManager.rootDir = process.cwd();
        sandbox
          .stub(sys, 'readFile')
          .returns("export const apiSchema: string = '';\n");

        await build();
        await new Promise<void>(resolve => setImmediate(resolve));

        expect(logErrorStub.calledOnce).to.be.true;
        expect(logErrorStub.firstCall.args[0]).to.be.instanceOf(Error);
        expect((logErrorStub.firstCall.args[0] as Error).message).to.equal(
          'Unable to find the API schema type annotation',
        );
      });

      context(`changes the 'out' directory to 'dist'`, function () {
        context(`when environment is production using flag`, function () {
          let argvStub: sinon.SinonStub;
          beforeEach(function () {
            argvStub = sandbox.stub(process, 'argv');
          });

          it(`'release'`, async function () {
            argvStub.value(['--release']);

            await build();

            expect(constants.environment.production).to.be.true;
            expect(ConfigManager.outDir).to.match(
              new RegExp(`.*[\\\\|/]${constants.extension.distDirName}$`),
            );
            expect(
              persistStub.calledOnceWithExactly(vscodeSchema, true),
              'persist should be called once with correct arguments',
            ).to.be.true;
          });

          it(`'production'`, async function () {
            argvStub.value(['--production']);

            await build();

            expect(constants.environment.production).to.be.true;
            expect(ConfigManager.outDir).to.match(
              new RegExp(`.*[\\\\|/]${constants.extension.distDirName}$`),
            );
            expect(
              persistStub.calledOnceWithExactly(vscodeSchema, true),
              'persist should be called once with correct arguments',
            ).to.be.true;
          });
        });
      });

      context(`throws an Error when`, function () {
        it(`generating the icons manifest fails`, async function () {
          const error = new Error('generateIconsManifestError');
          generateIconsManifestStub.throws(error);

          await build();

          expect(generateIconsManifestStub.calledOnce).to.be.true;
          expect(persistStub.called).to.be.false;
          expect(logErrorStub.calledOnceWithExactly(error)).to.be.true;
        });

        it(`persisting the icons manifest fails`, async function () {
          const error = new Error('persistError');
          persistStub.throws(error);

          await build();

          expect(generateIconsManifestStub.calledOnce).to.be.true;
          expect(persistStub.calledOnce).to.be.true;
          expect(logErrorStub.calledOnceWithExactly(error)).to.be.true;
        });
      });
    });
  });
});
