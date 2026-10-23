import { expect } from 'chai';
import proxyq from 'proxyquire';
import * as sinon from 'sinon';

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
      afterEach(function () {
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
