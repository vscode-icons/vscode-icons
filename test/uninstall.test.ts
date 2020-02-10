/* eslint-disable prefer-arrow-callback */
/* eslint-disable no-unused-expressions */
import { expect } from 'chai';
import * as sinon from 'sinon';
import * as proxyq from 'proxyquire';

describe('Uninstall: tests', function () {
  context('ensures that', function () {
    let sandbox: sinon.SinonSandbox;

    before(function () {
      proxyq.noCallThru();
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

    context(`the 'uninstall' script`, function () {
      it(`calls the 'uninstall' function`, function () {
        const removeSettingsStub = sandbox.stub();
        proxyq('../src/uninstall', {
          './configuration/configManager': {
            ConfigManager: { removeSettings: removeSettingsStub },
          },
        });

        expect(removeSettingsStub.calledOnceWithExactly()).to.be.true;
      });
    });
  });
});
