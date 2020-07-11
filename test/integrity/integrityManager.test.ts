/* eslint-disable prefer-arrow-callback */
/* eslint-disable no-unused-expressions */
import { expect } from 'chai';
import { Integrity } from 'nsri';
import * as sinon from 'sinon';
import { ErrorHandler } from '../../src/common/errorHandler';
import { IntegrityManager } from '../../src/integrity/integrityManager';
import { IIntegrityManager } from '../../src/models';

describe('IntegrityManager: tests', function () {
  context('ensures that', function () {
    let sandbox: sinon.SinonSandbox;
    let integrityManager: IIntegrityManager;
    let logErrorStub: sinon.SinonStub;
    let integrityStub: sinon.SinonStub;

    beforeEach(function () {
      sandbox = sinon.createSandbox();

      integrityManager = new IntegrityManager();
      logErrorStub = sandbox.stub(ErrorHandler, 'logError');
      integrityStub = sandbox.stub(Integrity, 'check');
    });

    afterEach(function () {
      integrityManager = null;
      sandbox.restore();
    });

    context('integrity check', function () {
      context('logs an Error when', function () {
        it(`it throws an Error`, async function () {
          integrityStub.rejects();

          await integrityManager.check();

          expect(logErrorStub.calledOnce).to.be.true;
        });
      });

      context(`return 'true' when`, function () {
        it(`it throws an Error`, async function () {
          integrityStub.rejects();

          const sut = await integrityManager.check();

          expect(sut).to.be.true;
        });

        it('check passes', async function () {
          integrityStub.resolves(true);

          const sut = await integrityManager.check();

          expect(logErrorStub.called).to.be.false;
          expect(sut).to.be.true;
        });
      });

      context(`return 'false' when`, function () {
        it('check fails', async function () {
          integrityStub.resolves(false);

          const sut = await integrityManager.check();

          expect(logErrorStub.called).to.be.false;
          expect(sut).to.be.false;
        });
      });
    });
  });
});
