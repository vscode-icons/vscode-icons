// tslint:disable only-arrow-functions
// tslint:disable no-unused-expression
import { expect } from 'chai';
import { LanguageResourceManager } from '../../src/i18n';
import { langResourceCollection } from '../../src/i18n/langResourceCollection';
import { LangResourceKeys } from '../../src/models/i18n';
import * as packageJson from '../../../package.json';
import * as nls from '../../../package.nls.json';
import * as nlsTemplate from '../../../package.nls.template.json';

describe('I18n: tests', function () {

  context('ensures that', function () {

    it('LangResourceKeys properties match ILangResource properties',
      function () {
        for (const key in LangResourceKeys) {
          // We only care about the enum members not the values
          if (isNaN(parseInt(key, 10))) {
            expect(Reflect.has(langResourceCollection.en, key)).to.be.true;
          }
        }
      });

    it('ILangResource properties match LangResourceKeys properties',
      function () {
        for (const key of Reflect.ownKeys(langResourceCollection.en)) {
          expect(LangResourceKeys[key]).to.exist;
        }
      });

    context('OS specific messages', function () {

      let resourceCollection: any;
      let originalPlatform: any;

      before(() => {
        originalPlatform = process.platform;
        resourceCollection = {
          test: {
            welcome: {
              darwin: 'Macintosh',
              linux: 'Linux',
              win32: 'Windows',
            },
          },
        };
      });

      after(() => {
        Object.defineProperty(process, 'platform', { value: originalPlatform });
      });

      context('are properly shown for', function () {

        it('osx (darwin)',
          function () {
            Object.defineProperty(process, 'platform', { value: 'darwin' });
            const msg = new LanguageResourceManager('test', resourceCollection)
              .getMessage(LangResourceKeys.welcome);
            expect(msg).to.equal(resourceCollection.test.welcome[process.platform]);
          });

        it('linux',
          function () {
            Object.defineProperty(process, 'platform', { value: 'linux' });
            const msg = new LanguageResourceManager('test', resourceCollection)
              .getMessage(LangResourceKeys.welcome);
            expect(msg).to.equal(resourceCollection.test.welcome[process.platform]);
          });

        it('win32 (windows)',
          function () {
            Object.defineProperty(process, 'platform', { value: 'win32' });
            const msg = new LanguageResourceManager('test', resourceCollection)
              .getMessage(LangResourceKeys.welcome);
            expect(msg).to.equal(resourceCollection.test.welcome[process.platform]);
          });

      });

      it('will throw an error for not implemented platforms',
        function () {
          Object.defineProperty(process, 'platform', { value: 'freebsd' });
          const i18nManager = new LanguageResourceManager('test', resourceCollection);
          expect(i18nManager.getMessage.bind(i18nManager, LangResourceKeys.welcome))
            .to.throw(Error, /Not Implemented/);
        });

    });

    it('a combination of resource and literal messages are properly shown',
      function () {
        const resourceCollection = {
          en: {
            newVersion: 'brave flees',
            restart: 'jumped over the fence',
          },
        };
        const literalString1 = '10';
        const literalString2 = ' ';
        const literalString3 = '!';
        const msg = new LanguageResourceManager('en', resourceCollection).getMessage(
          literalString1,
          literalString2,
          LangResourceKeys.newVersion,
          literalString2,
          LangResourceKeys.restart,
          literalString3);
        const expectedMsg = `${literalString1}${literalString2}${resourceCollection.en.newVersion}` +
          `${literalString2}${resourceCollection.en.restart}${literalString3}`;
        expect(msg).to.equal(expectedMsg);
      });

    it('if a language resource does not exist, the English resource is used',
      function () {
        const resourceCollection = {
          en: {
            restart: 'Test',
          },
        };

        const msg = new LanguageResourceManager('en', resourceCollection).getMessage(LangResourceKeys.restart);
        expect(msg).to.equal(resourceCollection.en.restart);
      });

    it('if no message exists for the provided resource, the message of the English resource is used',
      function () {
        const resourceCollection = {
          lang: {
            reload: '',
          },
        };
        const msg = new LanguageResourceManager('lang', resourceCollection).getMessage(LangResourceKeys.reload);
        expect(msg).to.equal('Restart');
      });

    it('if an empty resource collection is provided, an empty string is returned',
      function () {
        const msg = new LanguageResourceManager('en', {}).getMessage(undefined);
        expect(msg).to.equal('');
      });

    it('if no resource collection is provided, the default language resource collection is used',
      function () {
        const msg = new LanguageResourceManager('en', null).getMessage('Test');
        expect(msg).to.equal('Test');
      });

    context('the message is properly shown for', function () {

      let resourceCollection: any;

      before(() => {
        resourceCollection = {
          en: {
            newVersion: '10 brave flees jumped ',
            welcome: 'over the fence',
          },
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
          const literalString2 = ' brave flees jumped ';
          const literalString3 = 'over the fence.';
          const msg = new LanguageResourceManager('en', resourceCollection)
            .getMessage(literalString1, literalString2, literalString3);
          expect(msg).to.equal(`${literalString1}${literalString2}${literalString3}`);
        });

      it('an array of LangResourceKeys',
        function () {
          const msg = new LanguageResourceManager('en', resourceCollection)
            .getMessage(LangResourceKeys.newVersion, ' ', LangResourceKeys.welcome);
          expect(msg).to.equal(`${resourceCollection.en.newVersion} ${resourceCollection.en.welcome}`);
        });

      context('otherwise an error is thrown for invalid', function () {

        it('resource keys',
          function () {
            const i18nManager = new LanguageResourceManager('en', resourceCollection);
            expect(i18nManager.getMessage.bind(i18nManager, LangResourceKeys.restart))
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

    context('each', function () {

      it('command title has an nls entry',
        function () {
          expect(packageJson.contributes).to.exist;
          expect(packageJson.contributes.commands).to.exist;
          expect(packageJson.contributes.commands).to.be.an.instanceOf(Array);
          packageJson.contributes.commands.forEach(command => {
            const title = command.title as string;
            const nlsEntry = title.replace(/%/g, '');
            expect(title).to.exist;
            expect(title).to.be.a('string');
            expect(nls[nlsEntry]).to.exist;
          });
        });

      it('configuration title has an nls entry',
        function () {
          expect(packageJson.contributes).to.exist;
          expect(packageJson.contributes.configuration).to.exist;
          const title = packageJson.contributes.configuration.title as string;
          const nlsEntry = title.replace(/%/g, '');
          expect(title).to.exist;
          expect(title).to.be.a('string');
          expect(nls[nlsEntry]).to.exist;
        });

      it('configuration description has an nls entry',
        function () {
          expect(packageJson.contributes).to.exist;
          expect(packageJson.contributes.configuration).to.exist;
          const properties = packageJson.contributes.configuration.properties;
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

      it('match nls template',
        function () {
          for (const key of Reflect.ownKeys(nls)) {
            expect(nlsTemplate[key]).to.exist;
          }
        });

      it('template match nls',
        function () {
          for (const key of Reflect.ownKeys(nlsTemplate)) {
            expect(nls[key]).to.exist;
          }
        });

    });

  });

});
