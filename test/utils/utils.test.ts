/* eslint-disable prefer-arrow-callback */
/* eslint-disable no-unused-expressions */
import { expect } from 'chai';
import { ChildProcess } from 'child_process';
import { Stats } from 'fs';
import * as os from 'os';
import * as path from 'path';
import * as proxyq from 'proxyquire';
import * as sinon from 'sinon';
import * as fsAsync from '../../src/common/fsAsync';
import { FileFormat } from '../../src/models';
import { Utils } from '../../src/utils';

describe('Utils: tests', function () {
  interface IUtils {
    open: (target: string, options?: object) => Promise<ChildProcess>;
  }

  context('ensures that', function () {
    let sandbox: sinon.SinonSandbox;
    let existsAsyncStub: sinon.SinonStub;

    beforeEach(function () {
      sandbox = sinon.createSandbox();
      existsAsyncStub = sandbox.stub(fsAsync, 'existsAsync').resolves();
    });

    afterEach(function () {
      sandbox.restore();
    });

    context(`the 'getAppDataDirPath' function`, function () {
      context(`returns the correct 'vscode' path`, function () {
        context(`when the process platform is`, function () {
          let envStub: sinon.SinonStub;
          let platformStub: sinon.SinonStub;

          beforeEach(function () {
            envStub = sandbox.stub(process, 'env');
            platformStub = sandbox.stub(process, 'platform');
          });

          it('darwin (macOS)', function () {
            const dirPath = `${os.homedir()}/Library/Application Support`;
            platformStub.value('darwin');

            expect(Utils.getAppDataDirPath()).to.be.equal(dirPath);
          });

          it('linux', function () {
            const dirPath = `${os.homedir()}/.config`;
            platformStub.value('linux');

            expect(Utils.getAppDataDirPath()).to.be.equal(dirPath);
          });

          it('win32 (windows)', function () {
            const dirPath = 'C:\\Users\\User\\AppData\\Roaming';
            envStub.value({
              APPDATA: dirPath,
            });
            platformStub.value('win32');

            expect(Utils.getAppDataDirPath()).to.be.equal(dirPath);
          });

          it('NOT implemented', function () {
            const dirPath = '/var/local';
            platformStub.value('freebsd');

            expect(Utils.getAppDataDirPath()).to.be.equal(dirPath);
          });
        });
      });
    });

    context(`the 'pathUnixJoin' function`, function () {
      it('returns a path using Unix separator', function () {
        expect(Utils.pathUnixJoin('path', 'to', 'code')).to.equal(
          'path/to/code',
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

    context(`the 'createDirectoryRecursively' function`, function () {
      context('creates all directories asynchronously', function () {
        context(`when the process platform is`, function () {
          let pathSepStub: sinon.SinonStub;
          let mkdirAsyncStub: sinon.SinonStub;

          beforeEach(function () {
            pathSepStub = sandbox.stub(path, 'sep');
            mkdirAsyncStub = sandbox.stub(fsAsync, 'mkdirAsync').resolves();
          });

          const testCase = async (
            directoryPath: string,
            dirExists: boolean,
            expectedCounts: number,
          ): Promise<void> => {
            const fileCheck = existsAsyncStub.callsFake(
              (dirPath: string) =>
                dirExists || directoryPath.split(path.sep).includes(dirPath),
            );
            const createDirectory = mkdirAsyncStub.resolves();

            fileCheck.resetHistory();
            createDirectory.resetHistory();

            await Utils.createDirectoryRecursively(directoryPath);

            expect(fileCheck.callCount).to.be.equal(
              dirExists ? expectedCounts + 2 : expectedCounts,
            );
            expect(createDirectory.callCount).to.equal(expectedCounts);
          };

          it('win32 (windows)', async function () {
            pathSepStub.value('\\');

            // Directory Exists
            await testCase('path\\to', true, 0);

            // Create Directory
            // - Relative path
            await testCase('.\\path', false, 2);

            // - Absolute path
            await testCase('C:\\path\\to', false, 3);
          });

          it('*nix', async function () {
            pathSepStub.value('/');

            // Directory Exists
            await testCase('path/to', true, 0);

            // Create Directory
            // - Relative path
            await testCase('path/to', false, 2);

            // - Absolute path
            await testCase('/path/to', false, 3);
          });
        });
      });
    });

    context(`the 'deleteDirectoryRecursively' function`, function () {
      let readdirAsyncStub: sinon.SinonStub;

      it('deletes a directory and all subdirectories asynchronously', async function () {
        readdirAsyncStub = sandbox.stub(fsAsync, 'readdirAsync').resolves();
        const directoryPath = '/path/to';
        const lstatsAsyncStub = sandbox.stub(fsAsync, 'lstatAsync').resolves();
        const fileCheck = existsAsyncStub
          .onFirstCall()
          .resolves(true)
          .onSecondCall()
          .resolves(false);
        const readDirectory = readdirAsyncStub.resolves(['dir', 'file.txt']);
        const lstats = lstatsAsyncStub
          .onFirstCall()
          .resolves({
            isDirectory: () => true,
          } as Stats)
          .onSecondCall()
          .resolves({
            isDirectory: () => false,
          } as Stats);
        const deleteFile = sandbox.stub(fsAsync, 'unlinkAsync').resolves();
        const removeDirectory = sandbox.stub(fsAsync, 'rmdirAsync').resolves();

        await Utils.deleteDirectoryRecursively(directoryPath);

        expect(fileCheck.calledTwice).to.be.true;
        expect(readDirectory.calledOnce).to.be.true;
        expect(lstats.calledTwice).to.be.true;
        expect(deleteFile.calledOnce).to.be.true;
        expect(removeDirectory.calledOnce).to.be.true;
      });
    });

    context(`the 'parseJSON' function`, function () {
      it('returns an object when parsing succeeds', function () {
        const json =
          Utils.parseJSONSafe<Record<string, string>>('{"test": "test"}');

        expect(json).to.be.instanceOf(Object);
        expect(Object.getOwnPropertyNames(json)).to.include('test');
        expect(json.test).to.be.equal('test');
      });

      it(`returns an empty object when parsing fails`, function () {
        expect(Utils.parseJSONSafe('test')).to.be.empty;
      });
    });

    context(`the 'getRelativePath' function`, function () {
      context(`does NOT throw an Error`, function () {
        context(`if the destination directory does NOT exists`, function () {
          it('and a directory check should NOT be done', function () {
            const toDirName = 'path/to';

            expect(() =>
              Utils.getRelativePath('path/from', toDirName, false),
            ).to.not.throw(Error, `Directory '${toDirName}' not found.`);
          });
        });
      });

      context('returns a relative path that', function () {
        context('has a trailing path separator', function () {
          const trailingPathSeparatorTest = async (
            toDirName: string,
          ): Promise<void> => {
            const relativePath = await Utils.getRelativePath(
              'path/from',
              toDirName,
              false,
            );

            expect(relativePath.endsWith('/')).to.be.true;
            expect(/\/{2,}$/g.test(relativePath)).to.be.false;
          };

          it(`if it's provided`, async function () {
            await trailingPathSeparatorTest('path/to/');
          });

          it(`if it's NOT provided`, async function () {
            await trailingPathSeparatorTest('path/to');
          });

          it('that is NOT repeated', async function () {
            await trailingPathSeparatorTest('path/to//');
            await trailingPathSeparatorTest('path/to///');
          });
        });
      });

      context('throws an Error', function () {
        it('if the `fromDirPath` parameter is NOT defined', async function () {
          try {
            await Utils.getRelativePath(null, 'path/to');
          } catch (error) {
            expect(error).to.match(/fromDirPath not defined\./);
          }
        });

        it('if the `toDirName` parameter is NOT defined', async function () {
          try {
            await Utils.getRelativePath('path/from', null);
          } catch (error) {
            expect(error).to.match(/toDirName not defined\./);
          }
        });

        it('the destination directory does NOT exists', async function () {
          const toDirName = 'path/to';

          try {
            await Utils.getRelativePath('path/from', toDirName);
          } catch (error) {
            expect(error).to.match(
              new RegExp(`Directory '${toDirName}' not found.`),
            );
          }
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
        expect(Utils.belongToSameDrive('C:\\path\\to', 'D:\\path\to')).to.be
          .false;
      });

      it(`returns 'true', when paths do belong to the same drive`, function () {
        expect(Utils.belongToSameDrive('C:\\path\\to', 'C:\\anotherpath\to')).to
          .be.true;
      });
    });

    context(`the 'overwriteDrive' function`, function () {
      it('overwrites the drive', function () {
        const sourcePath = 'C:\\path\\to';
        const destPath = 'D:\\path\\to';

        expect(Utils.overwriteDrive(sourcePath, destPath)).to.be.equal(
          sourcePath,
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
      let readFileAsyncStub: sinon.SinonStub;
      let writeFileAsyncStub: sinon.SinonStub;
      let replacerStub: sinon.SinonStub;

      beforeEach(function () {
        readFileAsyncStub = sandbox.stub(fsAsync, 'readFileAsync');
        writeFileAsyncStub = sandbox.stub(fsAsync, 'writeFileAsync').resolves();
        replacerStub = sandbox.stub();
      });

      it('rejects on file read error', async function () {
        readFileAsyncStub.rejects(new Error('error on read'));
        try {
          await Utils.updateFile('', replacerStub);
        } catch (err) {
          expect(replacerStub.called).to.be.false;
          expect(err)
            .to.be.an.instanceof(Error)
            .that.matches(/error on read/);
        }
      });

      it('rejects on file write error', async function () {
        readFileAsyncStub.resolves('');
        writeFileAsyncStub.rejects(new Error('error on write'));
        replacerStub.returns([]);

        try {
          await Utils.updateFile('', replacerStub);
        } catch (error) {
          expect(replacerStub.calledOnce).to.be.true;
          expect(error)
            .to.be.an.instanceof(Error)
            .that.matches(/error on write/);
        }
      });

      it('correctly detects unix style EOL (LF)', async function () {
        readFileAsyncStub.resolves('\n');
        replacerStub.returns([]);

        const result = await Utils.updateFile('', replacerStub);

        expect(replacerStub.calledOnce).to.be.true;
        expect(result).to.be.undefined;
      });

      it('correctly detects windows style EOL (CRLF)', async function () {
        readFileAsyncStub.resolves('\r\n');
        replacerStub.returns([]);

        const result = await Utils.updateFile('', replacerStub);

        expect(replacerStub.calledOnce).to.be.true;
        expect(result).to.be.undefined;
      });

      it(`updates the file`, async function () {
        readFileAsyncStub.resolves('text\n');
        // Note: it's up to the replacer to provide the correct replaced context
        replacerStub.returns(['replaced\n']);

        const result = await Utils.updateFile('', replacerStub);

        expect(replacerStub.calledOnce).to.be.true;
        expect(result).to.be.undefined;
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
          .and.that.to.haveOwnProperty('dontShowNewVersionMessage').and.that.to
          .be.false;
      });
    });

    context(`the 'open' function`, function () {
      it(`to call the external module`, async function () {
        const openStub = sandbox.stub().resolves();
        const target = 'target';
        const utils = (
          proxyq.noCallThru().load('../../src/utils', {
            open: openStub,
          }) as Record<string, IUtils>
        ).Utils;

        await utils.open(target);

        expect(openStub.calledOnceWithExactly(target, undefined)).to.be.true;
      });
    });
  });
});
