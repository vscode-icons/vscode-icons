import type { VSCodeManifest } from '../../src/types/package';
import type { VSCodeCommand } from '../../src/types/vscode';
import type { LanguageResourceManagerContract } from '../../src/types/vsicons';

import { expect } from 'chai';
import proxyq from 'proxyquire';
import * as sinon from 'sinon';

import langResourcesJson from '../../../lang.nls.bundle.json';
import nlsJson from '../../../locale/package/package.nls.json';
import nlsTemplateJson from '../../../locale/package.nls.template.json';
import packageJson from '../../../package.json';
import * as enums from '../../src/types/enums';

describe('LanguageResourceManager: tests', function () {
  type LanguageResourceManager = (arg?: string) => void;

  context('ensures that', function () {
    let sandbox: sinon.SinonSandbox;
    let i18nManager: LanguageResourceManagerContract;
    let LanguageResourceManager: (
      resource: Record<string, unknown>,
    ) => LanguageResourceManager;
    let initResourceCollection: string[];
    let resourceCollection: Record<string, unknown>;
    let numberOfLangResourceKeys: number;
    let langResources: Record<string, string[]>;
    let nls: Record<string, string>;

    before(function () {
      proxyq.noCallThru();

      LanguageResourceManager = (
        resource: Record<string, unknown>,
      ): LanguageResourceManager =>
        (
          proxyq('../../src/i18n/languageResourceManager', {
            '../../../lang.nls.bundle.json': resource,
          }) as Record<string, LanguageResourceManager>
        ).LanguageResourceManager;
    });

    after(function () {
      proxyq.callThru();
    });

    beforeEach(function () {
      sandbox = sinon.createSandbox();
      numberOfLangResourceKeys = Reflect.ownKeys(enums.LangResourceKeys).filter(
        (key: string) => isNaN(parseInt(key, 10)),
      ).length;
      initResourceCollection = Array(numberOfLangResourceKeys).fill(
        '',
      ) as string[];
      langResources = langResourcesJson as Record<string, string[]>;
      nls = nlsJson as Record<string, string>;
    });

    afterEach(function () {
      sandbox.restore();
    });

    it(`'LangResourceKeys' length match ILangResource length`, function () {
      for (const collection of Reflect.ownKeys(langResources) as string[]) {
        expect(langResources[collection]).to.have.lengthOf(
          numberOfLangResourceKeys,
        );
      }
    });

    it(`'ILangResource' length match LangResourceKeys length`, function () {
      for (const collection of Reflect.ownKeys(langResources) as string[]) {
        expect(numberOfLangResourceKeys).to.equal(
          langResources[collection].length,
        );
      }
    });

    context(`function 'localize'`, function () {
      it(`filters out 'null' keys`, function () {
        resourceCollection = { en: initResourceCollection };

        i18nManager = new (LanguageResourceManager(resourceCollection))(
          'en',
        ) as LanguageResourceManagerContract;

        const msg = i18nManager.localize(null);

        expect(msg).to.equal('');
      });

      it(`filters out 'undefined' keys`, function () {
        resourceCollection = { en: initResourceCollection };

        i18nManager = new (LanguageResourceManager(resourceCollection))(
          'en',
        ) as LanguageResourceManagerContract;

        const msg = i18nManager.localize(undefined);

        expect(msg).to.equal('');
      });

      it('returns properly a combination of resource and literal messages', function () {
        resourceCollection = { en: initResourceCollection };
        resourceCollection.en[enums.LangResourceKeys.newVersion] =
          'brave flees';
        resourceCollection.en[enums.LangResourceKeys.restart] =
          'jumped over the fence';

        i18nManager = new (LanguageResourceManager(resourceCollection))(
          'en',
        ) as LanguageResourceManagerContract;

        const literalString1 = '10';
        const literalString2 = ' ';
        const literalString3 = '!';
        const expectedMsg =
          `${literalString1}${literalString2}` +
          `${resourceCollection.en[enums.LangResourceKeys.newVersion] as string}` +
          `${literalString2}${
            resourceCollection.en[enums.LangResourceKeys.restart] as string
          }${literalString3}`;

        const msg = i18nManager.localize(
          literalString1,
          literalString2,
          enums.LangResourceKeys.newVersion,
          literalString2,
          enums.LangResourceKeys.restart,
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
          resourceCollection.en[enums.LangResourceKeys.reload] = 'Restart';

          i18nManager = new (LanguageResourceManager(resourceCollection))(
            'es',
          ) as LanguageResourceManagerContract;

          const msg = i18nManager.localize(enums.LangResourceKeys.reload);

          expect(msg).to.equal('Restart');
        });

        it('if no locale is provided', function () {
          i18nManager = new (LanguageResourceManager(
            langResources,
          ))() as LanguageResourceManagerContract;

          const msg = i18nManager.localize(enums.LangResourceKeys.reload);

          expect(msg).to.equal('Restart');
        });

        it('if no locale exists', function () {
          i18nManager = new (LanguageResourceManager(langResources))(
            'bg',
          ) as LanguageResourceManagerContract;

          const msg = i18nManager.localize(enums.LangResourceKeys.reload);

          expect(msg).to.equal('Restart');
        });
      });

      context('for OS specific messages', function () {
        let platformStub: sinon.SinonStub;

        beforeEach(function () {
          platformStub = sandbox.stub(process, 'platform');
          resourceCollection = { test: initResourceCollection };

          resourceCollection.test[enums.LangResourceKeys.welcome] = {
            darwin: 'Macintosh',
            linux: 'Linux',
            win32: 'Windows',
          };

          i18nManager = new (LanguageResourceManager(resourceCollection))(
            'test',
          ) as LanguageResourceManagerContract;
        });

        context('returns properly messages for', function () {
          const testCase = (): void => {
            const msg = i18nManager.localize(enums.LangResourceKeys.welcome);
            const testResource: string[] = resourceCollection.test[
              enums.LangResourceKeys.welcome
            ] as string[];

            expect(msg).to.equal(testResource[process.platform]);
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

          expect(() =>
            i18nManager.localize(enums.LangResourceKeys.welcome),
          ).to.throw(Error, /Not Implemented/);
        });
      });

      context('returns proper message for', function () {
        beforeEach(function () {
          resourceCollection = { en: initResourceCollection };
          resourceCollection.en[enums.LangResourceKeys.newVersion] =
            '10 brave flees jumped ';
          resourceCollection.en[enums.LangResourceKeys.welcome] =
            'over the fence';

          i18nManager = new (LanguageResourceManager(resourceCollection))(
            'en',
          ) as LanguageResourceManagerContract;
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
            enums.LangResourceKeys.newVersion,
            ' ',
            enums.LangResourceKeys.welcome,
          );

          expect(msg).to.equal(
            `${resourceCollection.en[enums.LangResourceKeys.newVersion] as string} ${
              resourceCollection.en[enums.LangResourceKeys.welcome] as string
            }`,
          );
        });
      });

      context('will throw an Error for invalid', function () {
        beforeEach(function () {
          resourceCollection = { en: initResourceCollection };
          i18nManager = new (LanguageResourceManager(resourceCollection))(
            'en',
          ) as LanguageResourceManagerContract;
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
        i18nManager = new (LanguageResourceManager(langResources))(
          'en',
        ) as LanguageResourceManagerContract;
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
      let manifest: VSCodeManifest;

      beforeEach(function () {
        manifest = packageJson as VSCodeManifest;
      });

      it('command title has an nls entry', function () {
        expect(manifest.contributes).to.exist;
        expect(manifest.contributes.commands).to.exist;
        expect(manifest.contributes.commands).to.be.an.instanceOf(Array);
        manifest.contributes.commands.forEach((command: VSCodeCommand) => {
          const title = command.title;
          const nlsEntry = title.replace(/%/g, '');
          expect(title).to.exist;
          expect(title).to.be.a('string');
          expect(nls[nlsEntry]).to.exist;
        });
      });

      it('configuration title has an nls entry', function () {
        expect(manifest.contributes).to.exist;
        expect(manifest.contributes.configuration).to.exist;
        const title = manifest.contributes.configuration.title;
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
        for (const prop of Reflect.ownKeys(properties) as string[]) {
          const description = properties[prop].description;
          const nlsEntry = description.replace(/%/g, '');
          expect(description).to.exist;
          expect(description).to.be.a('string');
          expect(nls[nlsEntry], `description: ${description}`).to.exist;
        }
      });
    });

    context('nls', function () {
      it('match nls template', function () {
        const nlsTemplate = nlsTemplateJson as Record<string, string>;
        for (const key of Reflect.ownKeys(nls) as string[]) {
          expect(nlsTemplate[key]).to.exist;
        }
      });

      it('template match nls', function () {
        for (const key of Reflect.ownKeys(
          nlsTemplateJson as object,
        ) as string[]) {
          expect(nls[key]).to.exist;
        }
      });
    });
  });
});
