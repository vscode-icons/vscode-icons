/* eslint-disable prefer-arrow-callback */
/* eslint-disable no-unused-expressions */
import { expect } from 'chai';
import * as proxyq from 'proxyquire';
import * as sinon from 'sinon';
import { ErrorHandler } from '../../src/common/errorHandler';
import { constants } from '../../src/constants';

describe('Bundle: tests', function () {
  interface IBundler {
    bundleLangResources: (...arg: unknown[]) => Promise<void>;
    copyPackageResources: (...arg: unknown[]) => Promise<void>;
  }

  context('ensures that', function () {
    let sandbox: sinon.SinonSandbox;
    let bundleLangResourcesStub: sinon.SinonStub;
    let copyPackageResourcesStub: sinon.SinonStub;
    let logErrorStub: sinon.SinonStub;
    let bundle: () => Promise<void>;

    before(function () {
      proxyq.noPreserveCache();
      proxyq.noCallThru();
    });

    after(function () {
      proxyq.callThru();
    });

    beforeEach(function () {
      sandbox = sinon.createSandbox();

      bundleLangResourcesStub = sinon.stub().resolves();
      copyPackageResourcesStub = sinon.stub().resolves();
      logErrorStub = sandbox.stub(ErrorHandler, 'logError');

      bundle = (): Promise<void> =>
        proxyq('../../src/tools/bundle', {
          '../common/bundler': {
            Bundler: {
              bundleLangResources: bundleLangResourcesStub,
              copyPackageResources: copyPackageResourcesStub,
            },
          } as Record<string, IBundler>,
        }) as Promise<void>;
    });

    afterEach(function () {
      sandbox.restore();
    });

    context(`the 'bundle' script`, function () {
      it(`generates the bundled lang resource file`, async function () {
        await bundle();

        expect(
          bundleLangResourcesStub.calledOnceWithExactly(
            './locale/lang',
            './lang.nls.bundle.json',
          ),
        ).to.be.true;
        expect(logErrorStub.called).to.be.false;
      });

      it(`copies the package resource files`, async function () {
        await bundle();

        expect(
          copyPackageResourcesStub.calledOnceWithExactly(
            './locale/package',
            '.',
          ),
        ).to.be.true;
        expect(logErrorStub.called).to.be.false;
      });

      context(`changes environment to production when`, function () {
        context(`using flag`, function () {
          let argvStub: sinon.SinonStub;
          beforeEach(function () {
            argvStub = sandbox.stub(process, 'argv');
          });

          it(`'release'`, async function () {
            argvStub.value(['--release']);

            await bundle();

            expect(constants.environment.production).to.be.true;
          });

          it(`'production'`, async function () {
            argvStub.value(['--production']);

            await bundle();

            expect(constants.environment.production).to.be.true;
          });
        });
      });

      context(`throws an Error when`, function () {
        it(`generating the lang resource file fails`, async function () {
          const error = new Error('bundleError');
          bundleLangResourcesStub.throws(error);

          await bundle();

          expect(bundleLangResourcesStub.calledOnce).to.be.true;
          expect(copyPackageResourcesStub.called).to.be.false;
          expect(logErrorStub.calledOnceWithExactly(error)).to.be.true;
        });

        it(`copying the package resource files fails`, async function () {
          const error = new Error('copyError');
          copyPackageResourcesStub.throws(error);

          await bundle();

          expect(bundleLangResourcesStub.calledOnce).to.be.true;
          expect(copyPackageResourcesStub.calledOnce).to.be.true;
          expect(logErrorStub.calledOnceWithExactly(error)).to.be.true;
        });
      });
    });
  });
});
