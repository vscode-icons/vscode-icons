// tslint:disable only-arrow-functions
// tslint:disable no-unused-expression
import { expect } from 'chai';
import * as sinon from 'sinon';
import * as proxyq from 'proxyquire';
import * as fs from 'fs';
import * as os from 'os';
import { Utils } from '../../src/utils';
import { FileFormat } from '../../src/models';

describe('Utils: tests', function () {
  context('ensures that', function () {
    let sandbox: sinon.SinonSandbox;

    beforeEach(function () {
      sandbox = sinon.createSandbox();
    });

    afterEach(function () {
      sandbox.restore();
    });
    context(`the 'getAppDataDirPath' function`, function () {
      context(`returns the correct 'vscode' path`, function () {
        context(` when the process platform is`, function () {
          let envStub: sinon.SinonStub;
          let platformStub: sinon.SinonStub;

          beforeEach(function () {
            envStub = sandbox.stub(process, 'env');
            platformStub = sandbox.stub(process, 'platform');
          });

          it('darwin (macOS)', function () {
            const path = `${os.homedir()}/Library/Application Support`;
            platformStub.value('darwin');

            expect(Utils.getAppDataDirPath()).to.be.equal(path);
          });

          it('linux', function () {
            const path = `${os.homedir()}/.config`;
            platformStub.value('linux');

            expect(Utils.getAppDataDirPath()).to.be.equal(path);
          });

          it('win32 (windows)', function () {
            const path = 'C:\\Users\\User\\AppData\\Roaming';
            envStub.value({
              APPDATA: path,
            });
            platformStub.value('win32');

            expect(Utils.getAppDataDirPath()).to.be.equal(path);
          });

          it('NOT implemented', function () {
            const path = '/var/local';
            platformStub.value('freebsd');

            expect(Utils.getAppDataDirPath()).to.be.equal(path);
          });
        });
      });
    });

    context(`the 'pathUnixJoin' function`, function () {
      it('returns a path using Unix separator', function () {
        expect(Utils.pathUnixJoin('path', 'to', 'code')).to.equal(
          'path/to/code'
        );
      });
    });

    context(`the 'tempPath' function`, function () {
      it('returns the path to the OS temporary directory', function () {
        expect(Utils.tempPath()).to.equal(os.tmpdir());
      });
    });

    context(`the 'fileFormatToString' function`, function () {
      it(`returns the string representation of the 'FileFormat'`, function () {
        expect(Utils.fileFormatToString('svg')).to.equal('.svg');
        expect(Utils.fileFormatToString(FileFormat.svg)).to.equal('.svg');
      });
    });

    context(`the 'createDirectoryRecursivelySync' function`, function () {
      it('creates a directory and all subdirectories synchronously', function () {
        const existsStub = sandbox.stub(fs, 'existsSync');
        const createDirectory = sandbox.stub(fs, 'mkdirSync');
        const testCase = (
          directoryPath: string,
          dirExists: boolean,
          expectedCounts: number
        ) => {
          const fileCheck = existsStub.callsFake(
            path => dirExists || directoryPath.split('/').indexOf(path) !== -1
          );

          existsStub.resetHistory();
          createDirectory.resetHistory();

          Utils.createDirectoryRecursively(directoryPath);

          expect(fileCheck.callCount).to.be.equal(
            dirExists ? expectedCounts + 2 : expectedCounts
          );
          expect(createDirectory.callCount).to.equal(expectedCounts);
        };

        // Create directory
        testCase('path/to', true, 0);
        // Absolute path
        testCase('/path/to', false, 3);
        // Relative path
        testCase('path/to', false, 2);
      });
    });

    context(`the 'deleteDirectoryRecursivelySync' function`, function () {
      it('deletes a directory and all subdirectories synchronously', function () {
        const directoryPath = '/path/to';
        const fileCheck = sandbox
          .stub(fs, 'existsSync')
          .callsFake(path => path === directoryPath);
        const readDirectory = sandbox
          .stub(fs, 'readdirSync')
          .callsFake(() => ['dir', 'file.txt']);
        const stats = sandbox.stub(fs, 'lstatSync').callsFake(path => ({
          isDirectory: () => path !== '/path/to/file.txt',
        }));
        const deleteFile = sandbox.stub(fs, 'unlinkSync');
        const removeDirectory = sandbox.stub(fs, 'rmdirSync');

        Utils.deleteDirectoryRecursively(directoryPath);

        expect(fileCheck.calledTwice).to.be.true;
        expect(readDirectory.calledOnce).to.be.true;
        expect(stats.calledTwice).to.be.true;
        expect(deleteFile.calledOnce).to.be.true;
        expect(removeDirectory.calledOnce).to.be.true;
      });
    });

    context(`the 'parseJSON' function`, function () {
      it('returns an object when parsing succeeds', function () {
        const json = Utils.parseJSON('{"test": "test"}');

        expect(json).to.be.instanceOf(Object);
        expect(Object.getOwnPropertyNames(json)).to.include('test');
        expect(json['test']).to.be.equal('test');
      });

      it(`returns 'null' when parsing fails`, function () {
        expect(Utils.parseJSON('test')).to.be.null;
      });
    });

    context(`the 'getRelativePath' function`, function () {
      context(`does NOT throw an Error`, function () {
        context(`if the destination directory does NOT exists`, function () {
          it('and a directory check should NOT be done', function () {
            const toDirName = 'path/to';

            expect(() =>
              Utils.getRelativePath('path/from', toDirName, false)
            ).to.not.throw(Error, `Directory '${toDirName}' not found.`);
          });
        });
      });

      context('returns a relative path that', function () {
        context('has a trailing path separator', function () {
          const trailingPathSeparatorTest = (toDirName: string) => {
            const relativePath = Utils.getRelativePath(
              'path/from',
              toDirName,
              false
            );

            expect(/\/$/g.test(relativePath)).to.be.true;
            expect(/\/{2,}$/g.test(relativePath)).to.be.false;
          };

          it(`if it's provided`, function () {
            trailingPathSeparatorTest('path/to/');
          });

          it(`if it's NOT provided`, function () {
            trailingPathSeparatorTest('path/to');
          });

          it('that is NOT repeated', function () {
            trailingPathSeparatorTest('path/to//');
            trailingPathSeparatorTest('path/to///');
          });
        });
      });

      context('throws an Error if', function () {
        it('the `fromDirPath` parameter is NOT defined', function () {
          expect(() => Utils.getRelativePath(null, 'path/to')).to.throw(
            Error,
            'fromDirPath not defined.'
          );
        });

        it('the `toDirName` parameter is NOT defined', function () {
          expect(() => Utils.getRelativePath('path/from', null)).to.throw(
            Error,
            'toDirName not defined.'
          );
        });

        it('the destination directory does NOT exists', function () {
          const toDirName = 'path/to';

          expect(() => Utils.getRelativePath('path/from', toDirName)).to.throw(
            Error,
            `Directory '${toDirName}' not found.`
          );
        });
      });
    });

    context(`the 'removeFirstDot' function`, function () {
      it('removes the leading dot', function () {
        expect(Utils.removeFirstDot('.test')).to.be.equal('test');
      });

      it('ignores when no leading dot', function () {
        expect(Utils.removeFirstDot('test')).to.be.equal('test');
      });
    });

    context(`the 'belongToSameDrive' function`, function () {
      it(`returns 'false', when paths do NOT belong to the same drive`, function () {
        expect(
          Utils.belongToSameDrive('C:\\path\\to', 'D:\\path\to')
        ).to.be.false;
      });

      it(`returns 'true', when paths do belong to the same drive`, function () {
        expect(
          Utils.belongToSameDrive('C:\\path\\to', 'C:\\anotherpath\to')
        ).to.be.true;
      });
    });

    context(`the 'overwriteDrive' function`, function () {
      it('overwrites the drive', function () {
        const sourcePath = 'C:\\path\\to';
        const destPath = 'D:\\path\\to';

        expect(Utils.overwriteDrive(sourcePath, destPath)).to.be.equal(
          sourcePath
        );
      });
    });

    context(`the 'getDrives' function returns an`, function () {
      it('Array of the provided drives', function () {
        const drive1 = 'C:';
        const drive2 = 'D:';

        expect(Utils.getDrives(drive1))
          .to.be.an.instanceOf(Array)
          .and.include(drive1);
        expect(Utils.getDrives(drive1, drive2))
          .an.instanceOf(Array)
          .and.include.members([drive1, drive2]);
      });

      it('empty Array, if no drive is provided', function () {
        expect(Utils.getDrives()).to.be.an.instanceOf(Array).and.be.empty;
      });

      it('Array of undefined drives, if provided paths are NOT actual drives', function () {
        expect(Utils.getDrives('/', 'file:///'))
          .to.be.an.instanceOf(Array)
          .and.include.members([undefined]);
      });
    });

    context(`the 'combine' function`, function () {
      it('returns an array combining the elements of the provided arrays', function () {
        const array1 = ['webpack.base.conf', 'webpack.common'];
        const array2 = ['js', 'coffee', 'ts'];
        const combinedArray = [
          'webpack.base.conf.js',
          'webpack.base.conf.coffee',
          'webpack.base.conf.ts',
          'webpack.common.js',
          'webpack.common.coffee',
          'webpack.common.ts',
        ];
        expect(Utils.combine(array1, array2))
          .to.be.an.instanceOf(Array)
          .and.have.deep.members(combinedArray);
      });
    });

    context(`the 'updateFile' function`, function () {
      let readFileStub: sinon.SinonStub;
      let writeFileStub: sinon.SinonStub;
      let replacerStub: sinon.SinonStub;

      beforeEach(function () {
        readFileStub = sandbox.stub(fs, 'readFile');
        writeFileStub = sandbox.stub(fs, 'writeFile');
        replacerStub = sandbox.stub();
      });

      it('rejects on file read error', function () {
        readFileStub.yields(new Error('error on read'), null);

        return Utils.updateFile('', replacerStub).then(void 0, err => {
          expect(replacerStub.called).to.be.false;
          expect(err)
            .to.be.an.instanceof(Error)
            .that.matches(/error on read/);
        });
      });

      it('rejects on file write error', function () {
        readFileStub.yields(null, '');
        writeFileStub.yields(new Error('error on write'));
        replacerStub.returns([]);

        return Utils.updateFile('', replacerStub).then(void 0, err => {
          expect(replacerStub.calledOnce).to.be.true;
          expect(err)
            .to.be.an.instanceof(Error)
            .that.matches(/error on write/);
        });
      });

      it('correctly detects unix style EOL (LF)', function () {
        readFileStub.yields(null, '\n');
        writeFileStub.yields(null);
        replacerStub.returns([]);

        return Utils.updateFile('', replacerStub).then(res => {
          expect(replacerStub.calledOnce).to.be.true;
          expect(res).to.be.undefined;
        });
      });

      it('correctly detects windows style EOL (CRLF)', function () {
        readFileStub.yields(null, '\r\n');
        writeFileStub.yields(null);
        replacerStub.returns([]);

        return Utils.updateFile('', replacerStub).then(res => {
          expect(replacerStub.calledOnce).to.be.true;
          expect(res).to.be.undefined;
        });
      });

      it(`updates the file`, function () {
        readFileStub.yields(null, 'text\n');
        writeFileStub.yields(null);
        // Note: it's up to the replacer to provide the correct replaced context
        replacerStub.returns(['replaced\n']);

        return Utils.updateFile('', replacerStub).then(res => {
          expect(replacerStub.calledOnce).to.be.true;
          expect(res).to.be.undefined;
        });
      });
    });

    context(`the 'unflattenProperties' function`, function () {
      it(`returns an object with individual properties structure`, function () {
        const obj = {
          'vsicons.dontShowNewVersionMessage': {
            default: false,
          },
        };

        expect(Utils.unflattenProperties(obj, 'default'))
          .to.be.an('object')
          .with.ownProperty('vsicons')
          .and.that.to.haveOwnProperty(
            'dontShowNewVersionMessage'
          ).and.that.to.be.false;
      });
    });

    context(`the 'open' function`, function () {
      it(`to call the external module`, function () {
        const opnStub = sandbox.stub().resolves();
        const target = 'target';
        const utils = proxyq('../../src/utils', {
          opn: opnStub,
        }).Utils;

        return utils.open(target).then(() => {
          expect(opnStub.calledOnceWithExactly(target, undefined)).to.be.true;
        });
      });
    });
  });
});
