/* eslint-disable prefer-arrow-callback */
/* eslint-disable no-unused-expressions */
import { expect } from 'chai';
import * as sinon from 'sinon';
import * as proxyq from 'proxyquire';
import { schema } from '../../src/models/iconsManifest/defaultSchema';
import { ErrorHandler } from '../../src/common/errorHandler';
import { constants } from '../../src/constants';
import { ConfigManager } from '../../src/configuration/configManager';

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

      generateIconsManifestStub = sandbox.stub().resolves(schema);
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

        expect(generateIconsManifestStub.calledOnceWithExactly()).to.be.true;
        expect(persistStub.calledOnceWithExactly(schema, true)).to.be.true;
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
          });

          it(`'production'`, async function () {
            argvStub.value(['--production']);

            await build();

            expect(constants.environment.production).to.be.true;
            expect(ConfigManager.outDir).to.match(
              new RegExp(`.*[\\\\|/]${constants.extension.distDirName}$`),
            );
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
