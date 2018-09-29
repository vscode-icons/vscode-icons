// tslint:disable only-arrow-functions
// tslint:disable no-unused-expression
import { expect } from 'chai';
import * as sinon from 'sinon';
import {
  IVSCodeManager,
  INotificationManager,
  ILanguageResourceManager,
} from '../../src/models';
import { VSCodeManager } from '../../src/vscode/vscodeManager';
import { LanguageResourceManager } from '../../src/i18n/languageResourceManager';
import { NotificationManager } from '../../src/notification/notificationManager';

describe('NotificationManager: tests', function () {
  context('ensures that', function () {
    let sandbox: sinon.SinonSandbox;
    let vscodeManagerStub: sinon.SinonStubbedInstance<IVSCodeManager>;
    let i18nManagerStub: sinon.SinonStubbedInstance<ILanguageResourceManager>;
    let notificationManager: INotificationManager;
    let showInformationMessageStub: sinon.SinonStub;

    beforeEach(function () {
      sandbox = sinon.createSandbox();

      vscodeManagerStub = sandbox.createStubInstance<IVSCodeManager>(
        VSCodeManager
      );

      showInformationMessageStub = sandbox.stub().resolves();
      sandbox.stub(vscodeManagerStub, 'window').get(() => ({
        showInformationMessage: showInformationMessageStub,
      }));

      i18nManagerStub = sandbox.createStubInstance<ILanguageResourceManager>(
        LanguageResourceManager
      );
      notificationManager = new NotificationManager(
        vscodeManagerStub,
        i18nManagerStub
      );
    });

    afterEach(function () {
      notificationManager = null;
      sandbox.restore();
    });

    context(`function 'notifyInfo'`, function () {
      context(`calls the 'showInformationMessage'`, function () {
        it(`once`, function () {
          return notificationManager.notifyInfo(undefined).then(() => {
            expect(showInformationMessageStub.calledOnceWithExactly(undefined))
              .to.be.true;
          });
        });

        it(`and then calls 'i18nManager.getLangResourceKey' once`, function () {
          return notificationManager.notifyInfo(undefined).then(() => {
            expect(
              i18nManagerStub.getLangResourceKey.calledOnceWithExactly(
                undefined
              )
            ).to.be.true;
          });
        });

        context(`when the first argument is a 'message'`, function () {
          let message: string;
          let items: string[];

          beforeEach(function () {
            message = 'test';
            items = ['test1', 'test2'];
            i18nManagerStub.getMessage
              .onFirstCall()
              .returns(message)
              .onSecondCall()
              .returns(items[0])
              .onThirdCall()
              .returns(items[1]);
          });

          it(`with the correct arguments`, function () {
            return notificationManager
              .notifyInfo(message, ...items)
              .then(
                () =>
                  expect(
                    showInformationMessageStub.calledWith(message, ...items)
                  ).to.be.true
              );
          });

          it(`returns the 'message'`, function () {
            showInformationMessageStub.resolves(message);
            i18nManagerStub.getLangResourceKey.returns(undefined);

            return notificationManager
              .notifyInfo(message, ...items)
              .then(result => expect(result).to.equal(message));
          });

          it(`returns the 'LangResourceKey'`, function () {
            showInformationMessageStub.resolves(message);
            i18nManagerStub.getLangResourceKey.returns(8);

            return notificationManager
              .notifyInfo(message, ...items)
              .then(result => expect(result).to.equal(8));
          });
        });

        context(`when the first argument is a 'format'`, function () {
          let message: string;
          let items: string[];

          beforeEach(function () {
            message = '%s %s %s';
            items = ['test1', 'test2', 'test3', 'test4'];
            i18nManagerStub.getMessage
              .onCall(0)
              .returns(items[0])
              .onCall(1)
              .returns(items[1])
              .onCall(2)
              .returns(items[2])
              .onCall(3)
              .returns(items[3]);
          });

          it(`with the correct arguments`, function () {
            const msg = 'test1 test2 test3';
            const msgItems = ['test4'];

            return notificationManager
              .notifyInfo(message, ...items)
              .then(
                () =>
                  expect(
                    showInformationMessageStub.calledWith(msg, ...msgItems)
                  ).to.be.true
              );
          });

          it(`returns the 'message'`, function () {
            const msg = 'test1 test2 test3';
            showInformationMessageStub.resolves(msg);
            i18nManagerStub.getLangResourceKey.returns(undefined);

            return notificationManager
              .notifyInfo(message, ...items)
              .then(result => expect(result).to.equal(msg));
          });

          it(`returns the 'LangResourceKey'`, function () {
            const msg = 'test1 test2 test3';
            showInformationMessageStub.resolves(msg);
            i18nManagerStub.getLangResourceKey.returns(18);

            return notificationManager
              .notifyInfo(message, ...items)
              .then(result => expect(result).to.equal(18));
          });
        });

        it(``, function () {
          return;
        });
      });
    });
  });
});
