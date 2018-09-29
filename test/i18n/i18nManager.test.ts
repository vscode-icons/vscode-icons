// tslint:disable only-arrow-functions
// tslint:disable no-unused-expression
import { expect } from 'chai';
import * as sinon from 'sinon';
import { LanguageResourceManager } from '../../src/i18n/languageResourceManager';
import { langResourceCollection } from '../../src/i18n/langResourceCollection';
import {
  LangResourceKeys,
  ILanguageResourceManager,
} from '../../src/models/i18n';
import * as manifest from '../../../package.json';
import * as nls from '../../../package.nls.json';
import * as nlsTemplate from '../../../package.nls.template.json';

describe('LanguageResourceManager: tests', function () {
  context('ensures that', function () {
    let sandbox: sinon.SinonSandbox;
    let resourceCollection: any;
    let i18nManager: ILanguageResourceManager;

    beforeEach(function () {
      sandbox = sinon.createSandbox();
    });

    afterEach(function () {
      sandbox.restore();
    });

    it(`'LangResourceKeys' properties match ILangResource properties`, function () {
      for (const key in LangResourceKeys) {
        // We only care about the enum members not the values
        if (isNaN(parseInt(key, 10))) {
          for (const collection of Reflect.ownKeys(langResourceCollection)) {
            expect(Reflect.has(langResourceCollection[collection], key)).to.be
              .true;
          }
        }
      }
    });

    it(`'ILangResource' properties match LangResourceKeys properties`, function () {
      for (const collection of Reflect.ownKeys(langResourceCollection)) {
        for (const key of Reflect.ownKeys(langResourceCollection[collection])) {
          expect(LangResourceKeys[key]).to.exist;
        }
      }
    });

    context(`function 'getMessage'`, function () {
      it('returns properly a combination of resource and literal messages', function () {
        resourceCollection = {
          en: {
            newVersion: 'brave flees',
            restart: 'jumped over the fence',
          },
        };
        i18nManager = new LanguageResourceManager(resourceCollection.en);
        const literalString1 = '10';
        const literalString2 = ' ';
        const literalString3 = '!';
        const expectedMsg =
          `${literalString1}${literalString2}` +
          `${resourceCollection.en.newVersion}` +
          `${literalString2}${resourceCollection.en.restart}${literalString3}`;

        const msg = i18nManager.getMessage(
          literalString1,
          literalString2,
          LangResourceKeys.newVersion,
          literalString2,
          LangResourceKeys.restart,
          literalString3
        );

        expect(msg).to.equal(expectedMsg);
      });

      context('uses the default language resource', function () {
        it('if no message exists for the provided resource', function () {
          resourceCollection = { es: { reload: '' } };
          i18nManager = new LanguageResourceManager(resourceCollection.es);

          const msg = i18nManager.getMessage(LangResourceKeys.reload);

          expect(msg).to.equal('Restart');
        });

        it('if an empty language resource is provided', function () {
          i18nManager = new LanguageResourceManager({} as any);

          const msg = i18nManager.getMessage(LangResourceKeys.reload);

          expect(msg).to.equal('Restart');
        });

        it('if no language resource exists', function () {
          i18nManager = new LanguageResourceManager(undefined);

          const msg = i18nManager.getMessage(LangResourceKeys.reload);

          expect(msg).to.equal('Restart');
        });
      });

      context('for OS specific messages', function () {
        let platformStub: sinon.SinonStub;

        beforeEach(function () {
          platformStub = sandbox.stub(process, 'platform');
          resourceCollection = {
            test: {
              welcome: {
                darwin: 'Macintosh',
                linux: 'Linux',
                win32: 'Windows',
              },
            },
          };
          i18nManager = new LanguageResourceManager(resourceCollection.test);
        });

        context('returns properly messages for', function () {
          it('osx (darwin)', function () {
            platformStub.value('darwin');

            const msg = i18nManager.getMessage(LangResourceKeys.welcome);

            expect(msg).to.equal(
              resourceCollection.test.welcome[process.platform]
            );
          });

          it('linux', function () {
            platformStub.value('linux');

            const msg = i18nManager.getMessage(LangResourceKeys.welcome);

            expect(msg).to.equal(
              resourceCollection.test.welcome[process.platform]
            );
          });

          it('win32 (windows)', function () {
            platformStub.value('win32');

            const msg = i18nManager.getMessage(LangResourceKeys.welcome);

            expect(msg).to.equal(
              resourceCollection.test.welcome[process.platform]
            );
          });
        });

        it('will throw an Error for NOT implemented platforms', function () {
          platformStub.value('freebsd');

          expect(() =>
            i18nManager.getMessage(LangResourceKeys.welcome)
          ).to.throw(Error, /Not Implemented/);
        });
      });

      context('returns proper message for', function () {
        beforeEach(function () {
          resourceCollection = {
            en: {
              newVersion: '10 brave flees jumped ',
              welcome: 'over the fence',
            },
          };

          i18nManager = new LanguageResourceManager(resourceCollection.en);
        });

        it('a literal string', function () {
          const literalString = 'test';

          const msg = i18nManager.getMessage(literalString);

          expect(msg).to.equal(literalString);
        });

        it('a literal string with punctuation marks', function () {
          const literalString = `test's can often fail. Or do they?`;

          const msg = i18nManager.getMessage(literalString);

          expect(msg).to.equal(literalString);
        });

        it('an array of literal strings', function () {
          const literalString1 = '10';
          const literalString2 = ' brave flees jumped ';
          const literalString3 = 'over the fence.';

          const msg = i18nManager.getMessage(
            literalString1,
            literalString2,
            literalString3
          );

          expect(msg).to.equal(
            `${literalString1}${literalString2}${literalString3}`
          );
        });

        it(`an array of 'LangResourceKeys'`, function () {
          const msg = i18nManager.getMessage(
            LangResourceKeys.newVersion,
            ' ',
            LangResourceKeys.welcome
          );

          expect(msg).to.equal(
            `${resourceCollection.en.newVersion} ${
              resourceCollection.en.welcome
            }`
          );
        });
      });

      context('will throw an Error for invalid', function () {
        it('resource keys', function () {
          expect(() =>
            i18nManager.getMessage(LangResourceKeys.restart)
          ).to.throw(Error, /is not valid/);
        });

        it('characters', function () {
          const literalString = '#';

          expect(() => i18nManager.getMessage(literalString)).to.throw(
            Error,
            /is not valid/
          );
        });
      });
    });

    context(`function 'getLangResourceKey'`, function () {
      beforeEach(function () {
        i18nManager = new LanguageResourceManager(langResourceCollection.en);
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
        manifest.contributes.commands.forEach(command => {
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
