// tslint:disable only-arrow-functions
// tslint:disable no-unused-expression
import { expect } from 'chai';
import * as sinon from 'sinon';
import * as proxyq from 'proxyquire';
import { schema } from '../src/models/iconsManifest/defaultSchema';

describe('Build: tests', function () {
  context('ensures that', function () {
    let sandbox: sinon.SinonSandbox;
    let iconsGeneratorStub: sinon.SinonStub;
    let generateIconsManifestStub: sinon.SinonStub;
    let persistStub: sinon.SinonStub;

    beforeEach(function () {
      sandbox = sinon.createSandbox();

      generateIconsManifestStub = sandbox.stub().returns(schema);
      persistStub = sandbox.stub();
      iconsGeneratorStub = sandbox.stub().callsFake(() => ({
        generateIconsManifest: generateIconsManifestStub,
        persist: persistStub,
      }));
    });

    afterEach(function () {
      sandbox.restore();
    });

    context(`the 'build' script`, function () {
      it(`generates and saves the default icons manifest`, function () {
        proxyq('../src/build', {
          './iconsManifest/iconsGenerator': {
            IconsGenerator: iconsGeneratorStub,
          },
        });

        expect(generateIconsManifestStub.calledOnceWithExactly()).to.be.true;
        expect(persistStub.calledOnceWithExactly(schema, true)).to.be.true;
      });
    });
  });
});
