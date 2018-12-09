// tslint:disable only-arrow-functions
// tslint:disable no-unused-expression
import { expect } from 'chai';
import * as sinon from 'sinon';
import * as proxyq from 'proxyquire';
import { constants } from '../src/constants';
import { IExtensionManager } from '../src/models';
import { ExtensionManager } from '../src/app/extensionManager';
import { context as extensionContext } from './fixtures/extensionContext';

describe('Entry points: tests', function () {
  context('ensures that', function () {
    let sandbox: sinon.SinonSandbox;
    let extensionStub: sinon.SinonStubbedInstance<IExtensionManager>;
    let EntryPoint: any;

    before(function () {
      proxyq.noCallThru();
      extensionStub = sinon.createStubInstance<IExtensionManager>(
        ExtensionManager,
      );
      EntryPoint = proxyq('../src/index', {
        './services/compositionRootService': {
          CompositionRootService: sinon
            .stub()
            .returns({ get: sinon.stub().returns(extensionStub) }),
        },
      });
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

    context(`when activated`, function () {
      let infoStub: sinon.SinonStub;

      beforeEach(function () {
        infoStub = sandbox.stub(console, 'info');
      });

      it(`activates the extension`, function () {
        EntryPoint.activate(extensionContext);

        expect(extensionStub.activate.calledOnceWithExactly()).to.be.true;
      });

      it(`prints an activation informative message`, function () {
        EntryPoint.activate(extensionContext);

        expect(
          infoStub.calledOnceWithExactly(
            `[${constants.extension.name}] v${
              constants.extension.version
            } activated!`,
          ),
        ).to.be.true;
      });
    });

    context(`when deactivated`, function () {
      it(`does nothing`, function () {
        return EntryPoint.deactivate();
      });
    });
  });
});
