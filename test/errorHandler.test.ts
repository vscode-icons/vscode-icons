// tslint:disable only-arrow-functions
// tslint:disable no-unused-expression
import { expect } from 'chai';
import * as sinon from 'sinon';
import { ErrorHandler } from '../src/errorHandler';

describe('ErrorHandler: tests', function () {
  context('ensures that', function () {
    let sandbox: sinon.SinonSandbox;
    let consoleErrorStub: sinon.SinonStub;

    beforeEach(function () {
      sandbox = sinon.createSandbox();
      consoleErrorStub = sandbox.stub(console, 'error');
    });

    afterEach(function () {
      sandbox.restore();
    });

    it('does NOT log anything when no error', function () {
      ErrorHandler.logError(null);
      expect(consoleErrorStub.called).to.be.false;
    });

    context('it logs', function () {
      it('the error stack', function () {
        const error = new Error();
        error.stack = 'contextOfStack';
        ErrorHandler.logError(error);
        expect(
          consoleErrorStub.calledOnceWithExactly(
            `Unhandled Error: ${error.stack}`
          )
        ).to.be.true;
        expect(consoleErrorStub.calledWithMatch(/contextOfStack/)).to.be.true;
        expect(error)
          .to.haveOwnProperty('stack')
          .and.to.equal(error.stack);
      });

      it('the error message, when no error stack is available', function () {
        const error = new Error('message');
        delete error.stack;
        ErrorHandler.logError(error);
        expect(
          consoleErrorStub.calledOnceWithExactly(
            `Unhandled Error: ${error.message}`
          )
        ).to.be.true;
        expect(consoleErrorStub.calledWithMatch(/message/)).to.be.true;
        expect(error).to.not.haveOwnProperty('stack').to.be.true;
      });

      it('the error itself, when no error stack and message are available', function () {
        const error = new Error();
        delete error.stack;
        delete error.message;
        ErrorHandler.logError(error);
        expect(
          consoleErrorStub.calledOnceWithExactly(`Unhandled Error: ${error}`)
        ).to.be.true;
        expect(error).to.not.haveOwnProperty('stack').to.be.true;
        expect(error).to.not.haveOwnProperty('message').to.be.true;
      });

      it('handled errors', function () {
        const error = new Error();
        ErrorHandler.logError(error, true);
        expect(consoleErrorStub.calledOnceWithExactly(`Handled Error: ${error.stack}`)).to.be.true;
      });

      it('unhandled errors', function () {
        const error = new Error();
        delete error.stack;
        delete error.message;
        ErrorHandler.logError(error);
        expect(consoleErrorStub.calledOnceWithExactly(`Unhandled Error: ${error}`)).to.be.true;
      });
    });
  });
});
