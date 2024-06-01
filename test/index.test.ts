/* eslint-disable no-unused-expressions */
/* eslint-disable prefer-arrow-callback */
import { expect } from 'chai';
import * as sinon from 'sinon';
import * as proxyq from 'proxyquire';
import { constants } from '../src/constants';
import { IExtensionManager } from '../src/models';
import { ExtensionManager } from '../src/app/extensionManager';
import { context as extensionContext } from './fixtures/extensionContext';
import { Debugger } from '../src/common';

describe('Entry points: tests', function () {
  interface IEntrypoint {
    activate: (arg: unknown) => unknown;
    deactivate: () => unknown;
  }

  context('ensures that', function () {
    let sandbox: sinon.SinonSandbox;
    let extensionStub: sinon.SinonStubbedInstance<IExtensionManager>;
    let EntryPoint: IEntrypoint;

    before(function () {
      proxyq.noCallThru();
      extensionStub =
        sinon.createStubInstance<IExtensionManager>(ExtensionManager);
      EntryPoint = proxyq('../src/index', {
        './services/compositionRootService': {
          CompositionRootService: sinon
            .stub()
            .returns({ get: sinon.stub().returns(extensionStub) }),
        },
      }) as IEntrypoint;
    });

    after(function () {
      proxyq.callThru();
    });

    beforeEach(function () {
      sandbox = sinon.createSandbox();
    });

    afterEach(function () {
      sandbox.restore();
    });

    context('when activated', function () {
      let infoStub: sinon.SinonStub;

      beforeEach(function () {
        infoStub = sandbox.stub(console, 'info');
      });

      it('activates the extension', function () {
        EntryPoint.activate(extensionContext);

        expect(extensionStub.activate.calledOnceWithExactly()).to.be.true;
      });

      context(`and 'Debugger' is`, function () {
        let debuggerAttachedStub: sinon.SinonStub;
        beforeEach(function () {
          debuggerAttachedStub = sandbox.stub(Debugger, 'isAttached');
        });

        context('NOT attached', function () {
          beforeEach(function () {
            debuggerAttachedStub.value(false);
          });

          it('prints an activation informative message', async function () {
            await EntryPoint.activate(extensionContext);

            expect(
              infoStub.calledOnceWithExactly(
                `[${constants.extension.name}] v${constants.extension.version} activated!`,
              ),
            ).to.be.true;
          });
        });

        context('attached', function () {
          beforeEach(function () {
            debuggerAttachedStub.value(true);
          });

          it('does NOT print an activation informative message', async function () {
            await EntryPoint.activate(extensionContext);

            expect(infoStub.called).to.be.false;
          });
        });
      });
    });

    context('when deactivated', function () {
      it('does nothing', function () {
        return EntryPoint.deactivate();
      });
    });
  });
});
