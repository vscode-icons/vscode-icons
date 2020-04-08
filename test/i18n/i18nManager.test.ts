/* eslint-disable prefer-arrow-callback */
/* eslint-disable no-unused-expressions */
import { expect } from 'chai';
import * as sinon from 'sinon';
import * as langResources from '../../../lang.nls.bundle.json';
import * as manifest from '../../../package.json';
import * as nls from '../../../locale/package/package.nls.json';
import * as nlsTemplate from '../../../locale/package.nls.template.json';
import {
  ILanguageResourceManager,
  LangResourceKeys,
} from '../../src/models/i18n';
import * as proxyq from 'proxyquire';

describe('LanguageResourceManager: tests', function () {
  context('ensures that', function () {
    let sandbox: sinon.SinonSandbox;
    let i18nManager: ILanguageResourceManager;
    let LanguageResourceManager: any;
    let initResourceCollection: string[];
    let resourceCollection: any;
    let numberOfLangResourceKeys: number;

    before(function () {
      proxyq.noCallThru();

      LanguageResourceManager = (resource: {}): any =>
        proxyq('../../src/i18n/languageResourceManager', {
          '../../../lang.nls.bundle.json': resource,
        }).LanguageResourceManager;
    });

    after(function () {
      proxyq.callThru();
    });

    beforeEach(function () {
      sandbox = sinon.createSandbox();
      numberOfLangResourceKeys = Reflect.ownKeys(
        LangResourceKeys,
      ).filter((key: string) => isNaN(parseInt(key, 10))).length;
      initResourceCollection = Array(numberOfLangResourceKeys).fill('');
    });

    afterEach(function () {
      sandbox.restore();
    });

    it(`'LangResourceKeys' length match ILangResource length`, function () {
      for (const collection of Reflect.ownKeys(langResources)) {
        expect(langResources[collection]).to.have.lengthOf(
          numberOfLangResourceKeys,
        );
      }
    });

    it(`'ILangResource' length match LangResourceKeys length`, function () {
      for (const collection of Reflect.ownKeys(langResources)) {
        expect(numberOfLangResourceKeys).to.equal(
          langResources[collection].length,
        );
      }
    });

    context(`function 'localize'`, function () {
      it(`filters out 'null' keys`, function () {
        resourceCollection = { en: initResourceCollection };

        i18nManager = new (LanguageResourceManager(resourceCollection))('en');

        const msg = i18nManager.localize(null);

        expect(msg).to.equal('');
      });

      it(`filters out 'undefined' keys`, function () {
        resourceCollection = { en: initResourceCollection };

        i18nManager = new (LanguageResourceManager(resourceCollection))('en');

        const msg = i18nManager.localize(undefined);

        expect(msg).to.equal('');
      });

      it('returns properly a combination of resource and literal messages', function () {
        resourceCollection = { en: initResourceCollection };
        resourceCollection.en[LangResourceKeys.newVersion] = 'brave flees';
        resourceCollection.en[LangResourceKeys.restart] =
          'jumped over the fence';

        i18nManager = new (LanguageResourceManager(resourceCollection))('en');

        const literalString1 = '10';
        const literalString2 = ' ';
        const literalString3 = '!';
        const expectedMsg =
          `${literalString1}${literalString2}` +
          `${resourceCollection.en[LangResourceKeys.newVersion]}` +
          `${literalString2}${
            resourceCollection.en[LangResourceKeys.restart]
          }${literalString3}`;

        const msg = i18nManager.localize(
          literalString1,
          literalString2,
          LangResourceKeys.newVersion,
          literalString2,
          LangResourceKeys.restart,
          literalString3,
        );

        expect(msg).to.equal(expectedMsg);
      });

      context('uses the default language resource', function () {
        it('if no message exists for the provided resource', function () {
          resourceCollection = {
            en: Array.from(initResourceCollection),
            es: Array.from(initResourceCollection),
          };
          resourceCollection.en[LangResourceKeys.reload] = 'Restart';

          i18nManager = new (LanguageResourceManager(resourceCollection))('es');

          const msg = i18nManager.localize(LangResourceKeys.reload);

          expect(msg).to.equal('Restart');
        });

        it('if no locale is provided', function () {
          i18nManager = new (LanguageResourceManager(langResources))();

          const msg = i18nManager.localize(LangResourceKeys.reload);

          expect(msg).to.equal('Restart');
        });

        it('if no locale exists', function () {
          i18nManager = new (LanguageResourceManager(langResources))('bg');

          const msg = i18nManager.localize(LangResourceKeys.reload);

          expect(msg).to.equal('Restart');
        });
      });

      context('for OS specific messages', function () {
        let platformStub: sinon.SinonStub;

        beforeEach(function () {
          platformStub = sandbox.stub(process, 'platform');
          resourceCollection = { test: initResourceCollection };

          resourceCollection.test[LangResourceKeys.welcome] = {
            darwin: 'Macintosh',
            linux: 'Linux',
            win32: 'Windows',
          };

          i18nManager = new (LanguageResourceManager(resourceCollection))(
            'test',
          );
        });

        context('returns properly messages for', function () {
          const testCase = (): void => {
            const msg = i18nManager.localize(LangResourceKeys.welcome);

            expect(msg).to.equal(
              resourceCollection.test[LangResourceKeys.welcome][
                process.platform
              ],
            );
          };

          it('osx (darwin)', function () {
            platformStub.value('darwin');

            testCase();
          });

          it('linux', function () {
            platformStub.value('linux');

            testCase();
          });

          it('win32 (windows)', function () {
            platformStub.value('win32');

            testCase();
          });
        });

        it('will throw an Error for NOT implemented platforms', function () {
          platformStub.value('freebsd');

          expect(() => i18nManager.localize(LangResourceKeys.welcome)).to.throw(
            Error,
            /Not Implemented/,
          );
        });
      });

      context('returns proper message for', function () {
        beforeEach(function () {
          resourceCollection = { en: initResourceCollection };
          resourceCollection.en[LangResourceKeys.newVersion] =
            '10 brave flees jumped ';
          resourceCollection.en[LangResourceKeys.welcome] = 'over the fence';

          i18nManager = new (LanguageResourceManager(resourceCollection))('en');
        });

        it('a literal string', function () {
          const literalString = 'test';

          const msg = i18nManager.localize(literalString);

          expect(msg).to.equal(literalString);
        });

        it('a literal string with punctuation marks', function () {
          const literalString = `test's can often fail. Or do they?`;

          const msg = i18nManager.localize(literalString);

          expect(msg).to.equal(literalString);
        });

        it('an array of literal strings', function () {
          const literalString1 = '10';
          const literalString2 = ' brave flees jumped ';
          const literalString3 = 'over the fence.';

          const msg = i18nManager.localize(
            literalString1,
            literalString2,
            literalString3,
          );

          expect(msg).to.equal(
            `${literalString1}${literalString2}${literalString3}`,
          );
        });

        it(`an array of 'LangResourceKeys'`, function () {
          const msg = i18nManager.localize(
            LangResourceKeys.newVersion,
            ' ',
            LangResourceKeys.welcome,
          );

          expect(msg).to.equal(
            `${resourceCollection.en[LangResourceKeys.newVersion]} ${
              resourceCollection.en[LangResourceKeys.welcome]
            }`,
          );
        });
      });

      context('will throw an Error for invalid', function () {
        beforeEach(function () {
          resourceCollection = { en: initResourceCollection };
          i18nManager = new (LanguageResourceManager(resourceCollection))('en');
        });

        it('resource keys', function () {
          expect(() => i18nManager.localize(50)).to.throw(
            Error,
            /is not valid/,
          );
        });

        it('characters', function () {
          const literalString = '#';

          expect(() => i18nManager.localize(literalString)).to.throw(
            Error,
            /is not valid/,
          );
        });
      });
    });

    context(`function 'getLangResourceKey'`, function () {
      beforeEach(function () {
        i18nManager = new (LanguageResourceManager(langResources))('en');
      });

      context(`returns 'undefined'`, function () {
        it(`if a message is NOT provided`, function () {
          expect(i18nManager.getLangResourceKey()).to.be.undefined;
        });

        it(`if a resource key is NOT found`, function () {
          expect(i18nManager.getLangResourceKey('test')).to.be.undefined;
        });
      });

      it(`returns the 'LangResourceKey' of a message`, function () {
        expect(i18nManager.getLangResourceKey('Restart')).to.equal(8);
      });
    });

    context('each', function () {
      it('command title has an nls entry', function () {
        expect(manifest.contributes).to.exist;
        expect(manifest.contributes.commands).to.exist;
        expect(manifest.contributes.commands).to.be.an.instanceOf(Array);
        manifest.contributes.commands.forEach((command: any) => {
          const title = command.title as string;
          const nlsEntry = title.replace(/%/g, '');
          expect(title).to.exist;
          expect(title).to.be.a('string');
          expect(nls[nlsEntry]).to.exist;
        });
      });

      it('configuration title has an nls entry', function () {
        expect(manifest.contributes).to.exist;
        expect(manifest.contributes.configuration).to.exist;
        const title = manifest.contributes.configuration.title as string;
        const nlsEntry = title.replace(/%/g, '');
        expect(title).to.exist;
        expect(title).to.be.a('string');
        expect(nls[nlsEntry]).to.exist;
      });

      it('configuration description has an nls entry', function () {
        expect(manifest.contributes).to.exist;
        expect(manifest.contributes.configuration).to.exist;
        const properties = manifest.contributes.configuration.properties;
        expect(properties).to.exist;
        expect(properties).to.be.an.instanceOf(Object);
        for (const prop of Reflect.ownKeys(properties)) {
          const description = properties[prop].description as string;
          const nlsEntry = description.replace(/%/g, '');
          expect(description).to.exist;
          expect(description).to.be.a('string');
          expect(nls[nlsEntry]).to.exist;
        }
      });
    });

    context('nls', function () {
      it('match nls template', function () {
        for (const key of Reflect.ownKeys(nls)) {
          expect(nlsTemplate[key]).to.exist;
        }
      });

      it('template match nls', function () {
        for (const key of Reflect.ownKeys(nlsTemplate)) {
          expect(nls[key]).to.exist;
        }
      });
    });
  });
});
