/* eslint-disable prefer-arrow-callback */
/* eslint-disable no-unused-expressions */
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
    let showWarningMessageStub: sinon.SinonStub;
    let showErrorMessageStub: sinon.SinonStub;

    beforeEach(function () {
      sandbox = sinon.createSandbox();

      vscodeManagerStub =
        sandbox.createStubInstance<IVSCodeManager>(VSCodeManager);

      showInformationMessageStub = sandbox.stub().resolves();
      showWarningMessageStub = sandbox.stub().resolves();
      showErrorMessageStub = sandbox.stub().resolves();

      sandbox.stub(vscodeManagerStub, 'window').get(() => ({
        showInformationMessage: showInformationMessageStub,
        showWarningMessage: showWarningMessageStub,
        showErrorMessage: showErrorMessageStub,
      }));

      i18nManagerStub = sandbox.createStubInstance<ILanguageResourceManager>(
        LanguageResourceManager,
      );
      notificationManager = new NotificationManager(
        vscodeManagerStub,
        i18nManagerStub,
      );
    });

    afterEach(function () {
      notificationManager = null;
      sandbox.restore();
    });

    context(`function 'notifyInfo'`, function () {
      context(`calls the 'showInformationMessage'`, function () {
        it(`once`, async function () {
          await notificationManager.notifyInfo(undefined);

          expect(showInformationMessageStub.calledOnceWithExactly(undefined)).to
            .be.true;
        });

        it(`and then calls 'i18nManager.getLangResourceKey' once`, async function () {
          await notificationManager.notifyInfo(undefined);

          expect(
            i18nManagerStub.getLangResourceKey.calledOnceWithExactly(undefined),
          ).to.be.true;
        });

        context(`when the first argument is a 'message'`, function () {
          let message: string;
          let items: string[];

          beforeEach(function () {
            message = 'test';
            items = ['test1', 'test2'];
            i18nManagerStub.localize
              .onFirstCall()
              .returns(message)
              .onSecondCall()
              .returns(items[0])
              .onThirdCall()
              .returns(items[1]);
          });

          it(`with the correct arguments`, async function () {
            await notificationManager.notifyInfo(message, ...items);

            expect(showInformationMessageStub.calledWith(message, ...items)).to
              .be.true;
          });

          context(`returns the 'message'`, function () {
            it(`when no 'items' are provided`, async function () {
              showInformationMessageStub.resolves(message);
              i18nManagerStub.getLangResourceKey.returns(undefined);

              const result = await notificationManager.notifyInfo(message);

              expect(result).to.equal(message);
            });

            it(`when 'items' are provided`, async function () {
              showInformationMessageStub.resolves(message);
              i18nManagerStub.getLangResourceKey.returns(undefined);

              const result = await notificationManager.notifyInfo(
                message,
                ...items,
              );

              expect(result).to.equal(message);
            });
          });

          it(`returns the 'LangResourceKey'`, async function () {
            showInformationMessageStub.resolves(message);
            i18nManagerStub.getLangResourceKey.returns(8);

            const result = await notificationManager.notifyInfo(
              message,
              ...items,
            );

            expect(result).to.equal(8);
          });
        });

        context(`when the first argument is a 'format'`, function () {
          let message: string;
          let items: string[];

          beforeEach(function () {
            message = '%s %s %s';
            items = ['test1', 'test2', 'test3', 'test4'];
            i18nManagerStub.localize
              .onCall(0)
              .returns(items[0])
              .onCall(1)
              .returns(items[1])
              .onCall(2)
              .returns(items[2])
              .onCall(3)
              .returns(items[3]);
          });

          it(`with the correct arguments`, async function () {
            const msg = 'test1 test2 test3';
            const msgItems = ['test4'];

            await notificationManager.notifyInfo(message, ...items);

            expect(showInformationMessageStub.calledWith(msg, ...msgItems)).to
              .be.true;
          });

          it(`returns the 'message'`, async function () {
            const msg = 'test1 test2 test3';
            showInformationMessageStub.resolves(msg);
            i18nManagerStub.getLangResourceKey.returns(undefined);

            const result = await notificationManager.notifyInfo(
              message,
              ...items,
            );

            expect(result).to.equal(msg);
          });

          it(`returns the 'LangResourceKey'`, async function () {
            const msg = 'test1 test2 test3';
            showInformationMessageStub.resolves(msg);
            i18nManagerStub.getLangResourceKey.returns(18);

            const result = await notificationManager.notifyInfo(
              message,
              ...items,
            );

            expect(result).to.equal(18);
          });
        });
      });
    });

    context(`function 'notifyWarning'`, function () {
      context(`calls the 'showWarningMessage'`, function () {
        it(`once`, async function () {
          await notificationManager.notifyWarning(undefined);

          expect(showWarningMessageStub.calledOnceWithExactly(undefined)).to.be
            .true;
        });

        it(`and then calls 'i18nManager.getLangResourceKey' once`, async function () {
          await notificationManager.notifyWarning(undefined);

          expect(
            i18nManagerStub.getLangResourceKey.calledOnceWithExactly(undefined),
          ).to.be.true;
        });

        context(`when the first argument is a 'message'`, function () {
          let message: string;
          let items: string[];

          beforeEach(function () {
            message = 'test';
            items = ['test1', 'test2'];
            i18nManagerStub.localize
              .onFirstCall()
              .returns(message)
              .onSecondCall()
              .returns(items[0])
              .onThirdCall()
              .returns(items[1]);
          });

          it(`with the correct arguments`, async function () {
            await notificationManager.notifyWarning(message, ...items);

            expect(showWarningMessageStub.calledWith(message, ...items)).to.be
              .true;
          });

          context(`returns the 'message'`, function () {
            it(`when no 'items' are provided`, async function () {
              showWarningMessageStub.resolves(message);
              i18nManagerStub.getLangResourceKey.returns(undefined);

              const result = await notificationManager.notifyWarning(message);

              expect(result).to.equal(message);
            });

            it(`when 'items' are provided`, async function () {
              showWarningMessageStub.resolves(message);
              i18nManagerStub.getLangResourceKey.returns(undefined);

              const result = await notificationManager.notifyWarning(
                message,
                ...items,
              );

              expect(result).to.equal(message);
            });
          });

          it(`returns the 'LangResourceKey'`, async function () {
            showWarningMessageStub.resolves(message);
            i18nManagerStub.getLangResourceKey.returns(8);

            const result = await notificationManager.notifyWarning(
              message,
              ...items,
            );

            expect(result).to.equal(8);
          });
        });

        context(`when the first argument is a 'format'`, function () {
          let message: string;
          let items: string[];

          beforeEach(function () {
            message = '%s %s %s';
            items = ['test1', 'test2', 'test3', 'test4'];
            i18nManagerStub.localize
              .onCall(0)
              .returns(items[0])
              .onCall(1)
              .returns(items[1])
              .onCall(2)
              .returns(items[2])
              .onCall(3)
              .returns(items[3]);
          });

          it(`with the correct arguments`, async function () {
            const msg = 'test1 test2 test3';
            const msgItems = ['test4'];

            await notificationManager.notifyWarning(message, ...items);

            expect(showWarningMessageStub.calledWith(msg, ...msgItems)).to.be
              .true;
          });

          it(`returns the 'message'`, async function () {
            const msg = 'test1 test2 test3';
            showWarningMessageStub.resolves(msg);
            i18nManagerStub.getLangResourceKey.returns(undefined);

            const result = await notificationManager.notifyWarning(
              message,
              ...items,
            );

            expect(result).to.equal(msg);
          });

          it(`returns the 'LangResourceKey'`, async function () {
            const msg = 'test1 test2 test3';
            showWarningMessageStub.resolves(msg);
            i18nManagerStub.getLangResourceKey.returns(18);

            const result = await notificationManager.notifyWarning(
              message,
              ...items,
            );

            expect(result).to.equal(18);
          });
        });
      });
    });

    context(`function 'notifyError'`, function () {
      context(`calls the 'showErrorMessage'`, function () {
        it(`once`, async function () {
          await notificationManager.notifyError(undefined);

          expect(showErrorMessageStub.calledOnceWithExactly(undefined)).to.be
            .true;
        });

        it(`and then calls 'i18nManager.getLangResourceKey' once`, async function () {
          await notificationManager.notifyError(undefined);

          expect(
            i18nManagerStub.getLangResourceKey.calledOnceWithExactly(undefined),
          ).to.be.true;
        });

        context(`when the first argument is a 'message'`, function () {
          let message: string;
          let items: string[];

          beforeEach(function () {
            message = 'test';
            items = ['test1', 'test2'];
            i18nManagerStub.localize
              .onFirstCall()
              .returns(message)
              .onSecondCall()
              .returns(items[0])
              .onThirdCall()
              .returns(items[1]);
          });

          it(`with the correct arguments`, async function () {
            await notificationManager.notifyError(message, ...items);

            expect(showErrorMessageStub.calledWith(message, ...items)).to.be
              .true;
          });
          context(`returns the 'message'`, function () {
            it(`when no 'items' are provided`, async function () {
              showErrorMessageStub.resolves(message);
              i18nManagerStub.getLangResourceKey.returns(undefined);

              const result = await notificationManager.notifyError(message);

              expect(result).to.equal(message);
            });

            it(`when 'items' are provided`, async function () {
              showErrorMessageStub.resolves(message);
              i18nManagerStub.getLangResourceKey.returns(undefined);

              const result = await notificationManager.notifyError(
                message,
                ...items,
              );

              expect(result).to.equal(message);
            });
          });

          it(`returns the 'LangResourceKey'`, async function () {
            showErrorMessageStub.resolves(message);
            i18nManagerStub.getLangResourceKey.returns(8);

            const result = await notificationManager.notifyError(
              message,
              ...items,
            );

            expect(result).to.equal(8);
          });
        });

        context(`when the first argument is a 'format'`, function () {
          let message: string;
          let items: string[];

          beforeEach(function () {
            message = '%s %s %s';
            items = ['test1', 'test2', 'test3', 'test4'];
            i18nManagerStub.localize
              .onCall(0)
              .returns(items[0])
              .onCall(1)
              .returns(items[1])
              .onCall(2)
              .returns(items[2])
              .onCall(3)
              .returns(items[3]);
          });

          it(`with the correct arguments`, async function () {
            const msg = 'test1 test2 test3';
            const msgItems = ['test4'];

            await notificationManager.notifyError(message, ...items);

            expect(showErrorMessageStub.calledWith(msg, ...msgItems)).to.be
              .true;
          });

          it(`returns the 'message'`, async function () {
            const msg = 'test1 test2 test3';
            showErrorMessageStub.resolves(msg);
            i18nManagerStub.getLangResourceKey.returns(undefined);

            const result = await notificationManager.notifyError(
              message,
              ...items,
            );

            expect(result).to.equal(msg);
          });

          it(`returns the 'LangResourceKey'`, async function () {
            const msg = 'test1 test2 test3';
            showErrorMessageStub.resolves(msg);
            i18nManagerStub.getLangResourceKey.returns(18);

            const result = await notificationManager.notifyError(
              message,
              ...items,
            );

            expect(result).to.equal(18);
          });
        });
      });
    });
  });
});
