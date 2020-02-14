/* eslint-disable prefer-arrow-callback */
/* eslint-disable no-unused-expressions */
import { expect } from 'chai';
import * as sinon from 'sinon';
import { Debugger } from '../../src/common/debugger';

describe('Bundler: tests', function () {
  context('ensures that', function () {
    let sandbox: sinon.SinonSandbox;
    let execArgvStub: sinon.SinonStub;

    beforeEach(function () {
      sandbox = sinon.createSandbox();
      execArgvStub = sandbox.stub(process, 'execArgv');
    });

    afterEach(function () {
      sandbox.restore();
    });

    context(`function 'isAttached'`, function () {
      context(`returns 'true'`, function () {
        context(`when executing process does contain an argument`, function () {
          it(`inspect`, function () {
            execArgvStub.value(['--inspect']);

            expect(Debugger.isAttached).to.be.true;
          });

          it(`debug`, function () {
            execArgvStub.value(['--debug']);

            expect(Debugger.isAttached).to.be.true;
          });
        });
      });

      context(`returns 'false'`, function () {
        context(
          `when executing process does NOT contain an argument`,
          function () {
            beforeEach(function () {
              execArgvStub.value([]);
            });

            it(`inspect`, function () {
              expect(Debugger.isAttached).to.be.false;
            });

            it(`debug`, function () {
              expect(Debugger.isAttached).to.be.false;
            });
          },
        );
      });
    });
  });
});
