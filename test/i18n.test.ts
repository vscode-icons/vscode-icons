/* tslint:disable only-arrow-functions */
import { expect } from 'chai';
import { LanguageResourceManager } from '../src/i18n';
import { langEn } from '../src/i18n/langResources';
import { LangResourceKeys, ILangResourceCollection } from '../src/models/i18n';

describe('i18n: tests', function () {

  describe('ensure that', function () {

    it('LangResourceKeys properties match ILangResource properties',
      function () {
        for (const key in LangResourceKeys) {
          // We only care about the enum members not the values
          if (isNaN(parseInt(key, 10))) {
            expect(Reflect.has(langEn, key)).to.be.true;
          }
        }
      });

    it('ILangResource properties match LangResourceKeys properties',
      function () {
        for (const key in langEn) {
          if (langEn.hasOwnProperty(key)) {
            expect(LangResourceKeys[key]).to.exist;
          }
        }
      });

    it('OS specific messages are properly shown',
      function () {
        const resourceCollection = {
          test: {
            activationPath: {
              darwin: 'Macintosh',
              linux: 'Linux',
              win32: 'Windows',
            },
          },
        };
        const msg = new LanguageResourceManager('test', resourceCollection).getMessage(LangResourceKeys.activationPath);
        expect(msg).to.equal(resourceCollection.test.activationPath[process.platform]);
      });

    it('a combination of resource and literal messages are properly shown',
      function () {
        const resourceCollection = {
          en: {
            newVersionMessage: 'brave flees jumped over the fence',
          },
        };

        const literalString1 = '10 ';
        const literalString2 = '!';
        const msg = new LanguageResourceManager('en', resourceCollection)
          .getMessage(literalString1, LangResourceKeys.newVersionMessage, literalString2);
        expect(msg).to.equal(`${literalString1}${resourceCollection.en.newVersionMessage}${literalString2}`);
      });

    it('if a language resource does not exist, the English resource is used',
      function () {
        const resourceCollection = {
          en: {
            enabled: 'Test',
          },
        };

        const msg = new LanguageResourceManager('en', resourceCollection).getMessage(LangResourceKeys.enabled);
        expect(msg).to.equal(resourceCollection.en.enabled);
      });

    it('if no resource collection is provided, an empty string is returned',
      function () {
        const msg = new LanguageResourceManager('en', {}).getMessage(undefined);
        expect(msg).to.equal('');
      });

    describe('the message is properly shown for', function () {

      let resourceCollection: ILangResourceCollection | {};

      before(() => {
        resourceCollection = {
          en: {},
        };
      });

      it('a literal string',
        function () {
          const literalString = 'test';
          const msg = new LanguageResourceManager('en', resourceCollection).getMessage(literalString);
          expect(msg).to.equal(literalString);
        });

      it('a literal string with punctuation marks',
        function () {
          const literalString = 'test\'s can often fail. Or do they?';
          const msg = new LanguageResourceManager('en', resourceCollection).getMessage(literalString);
          expect(msg).to.equal(literalString);
        });

      it('an array of literal strings',
        function () {
          const literalString1 = '10';
          const literalString2 = ' brave flees jumped over the fence';
          const literalString3 = '. ';
          const msg = new LanguageResourceManager('en', resourceCollection)
            .getMessage(literalString1, literalString2, literalString3);
          expect(msg).to.equal(`${literalString1}${literalString2}${literalString3}`);
        });

      describe('otherwise an error is thrown for invalid', function () {

        it('resource keys',
          function () {
            const i18nManager = new LanguageResourceManager('en', resourceCollection);
            expect(i18nManager.getMessage.bind(i18nManager, LangResourceKeys.enabled))
              .to.throw(Error, /is not valid/);
          });

        it('characters',
          function () {
            const literalString = '#';
            const i18nManager = new LanguageResourceManager('en', resourceCollection);
            expect(i18nManager.getMessage.bind(i18nManager, literalString)).to.throw(Error, /is not valid/);
          });

      });

    });

  });

});
