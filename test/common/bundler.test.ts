/* eslint-disable prefer-arrow-callback */
/* eslint-disable no-unused-expressions */
import { expect } from 'chai';
import { join } from 'path';
import * as sinon from 'sinon';
import { Bundler } from '../../src/common/bundler';
import * as fsAsync from '../../src/common/fsAsync';
import { constants } from '../../src/constants';

describe('Bundler: tests', function () {
  context('ensures that', function () {
    let sandbox: sinon.SinonSandbox;
    let writeFileAsyncStub: sinon.SinonStub;
    let jsonStringifiedSpy: sinon.SinonSpy;

    beforeEach(function () {
      sandbox = sinon.createSandbox();

      writeFileAsyncStub = sandbox.stub(fsAsync, 'writeFileAsync').resolves();
      jsonStringifiedSpy = sandbox.spy(JSON, 'stringify');
    });

    afterEach(function () {
      sandbox.restore();
    });

    context(`function 'bundleLangResources'`, function () {
      const targetFilePath = './lang.nls.bundle.json';

      it(`produces a bundled language resource file`, async function () {
        await Bundler.bundleLangResources(
          join(__dirname, '../../../locale/lang'),
          targetFilePath,
        );

        expect(writeFileAsyncStub.calledOnceWith(targetFilePath)).to.be.true;
      });

      context(`when environment is`, function () {
        context(`'production'`, function () {
          beforeEach(function () {
            constants.environment.production = true;
          });

          afterEach(function () {
            constants.environment.production = false;
          });

          it(`creates a minified bundle file`, async function () {
            await Bundler.bundleLangResources(
              join(__dirname, '../../../locale/lang'),
              targetFilePath,
            );

            expect(
              jsonStringifiedSpy.calledOnceWith(
                jsonStringifiedSpy.args[0][0],
                null,
                0,
              ),
            ).to.be.true;
            expect(constants.environment.production).to.be.true;
          });
        });

        context(`'development'`, function () {
          it(`creates a regular bundle file`, async function () {
            await Bundler.bundleLangResources(
              join(__dirname, '../../../locale/lang'),
              targetFilePath,
            );

            expect(
              jsonStringifiedSpy.calledOnceWith(
                jsonStringifiedSpy.args[0][0],
                null,
                2,
              ),
            ).to.be.true;
            expect(constants.environment.production).to.be.false;
          });
        });
      });

      it(`produces a bundled language resource file`, async function () {
        await Bundler.bundleLangResources(
          join(__dirname, '../../../locale/lang'),
          targetFilePath,
        );

        expect(writeFileAsyncStub.calledOnceWith(targetFilePath)).to.be.true;
      });

      context('throws an Error', function () {
        let readdirAsyncStub: sinon.SinonStub;
        beforeEach(function () {
          readdirAsyncStub = sandbox.stub(fsAsync, 'readdirAsync');
        });

        it('when no locale found', async function () {
          readdirAsyncStub.resolves(['lang.nls.!1.json']);

          try {
            await Bundler.bundleLangResources(
              join(__dirname, '../../../locale/lang'),
              targetFilePath,
            );
          } catch (error) {
            expect(error).to.match(/No locale found for: /);
          }
        });

        it('when bundling fails', async function () {
          readdirAsyncStub.rejects('ENOENT: no file or directory');

          try {
            await Bundler.bundleLangResources(
              join(__dirname, '../../locale/lang'),
              targetFilePath,
            );
          } catch (error) {
            expect(error).to.match(/ENOENT: no file or directory/);
          }
        });

        it('when bundling files are not found', async function () {
          readdirAsyncStub.resolves([]);

          try {
            await Bundler.bundleLangResources(
              join(__dirname, '../../../locale/lang'),
              targetFilePath,
            );
          } catch (error) {
            expect(error).to.match(/Bundling language resources failed/);
          }
        });
      });
    });

    context(`function 'copyPackageResources'`, function () {
      it(`copies all package resource files`, async function () {
        const localePackagePath = join(__dirname, '../../../locale/package');
        const packageFiles = await fsAsync.readdirAsync(localePackagePath);

        await Bundler.copyPackageResources(localePackagePath, '.');

        expect(writeFileAsyncStub.callCount).to.equal(packageFiles.length);
      });

      context(`when environment is`, function () {
        context(`'production'`, function () {
          beforeEach(function () {
            constants.environment.production = true;
          });

          afterEach(function () {
            constants.environment.production = false;
          });

          it(`copies a minified bundle file`, async function () {
            await Bundler.copyPackageResources(
              join(__dirname, '../../../locale/package'),
              '.',
            );

            expect(
              jsonStringifiedSpy.calledWith(
                jsonStringifiedSpy.args[0][0],
                null,
                0,
              ),
            ).to.be.true;
            expect(constants.environment.production).to.be.true;
          });
        });

        context(`'development'`, function () {
          it(`copies a regular bundle file`, async function () {
            await Bundler.copyPackageResources(
              join(__dirname, '../../../locale/package'),
              '.',
            );

            expect(
              jsonStringifiedSpy.calledWith(
                jsonStringifiedSpy.args[0][0],
                null,
                2,
              ),
            ).to.be.true;
            expect(constants.environment.production).to.be.false;
          });
        });
      });
    });
  });
});
