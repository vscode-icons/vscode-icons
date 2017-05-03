// tslint:disable only-arrow-functions
// tslint:disable no-unused-expression
import { expect } from 'chai';
import * as fs from 'fs';
import * as os from 'os';
import * as sinon from 'sinon';
import * as utils from '../src/utils';

describe('utils: tests', function () {

  context('ensures that', function () {

    context('the correct \'vscode\' path gets returned when the process platform is', function () {

      let env: any;
      let originalPlatform: any;

      before(() => {
        env = Object.assign({}, process.env);
        originalPlatform = process.platform;
      });

      after(() => {
        process.env = env;
        Object.defineProperty(process, 'platform', { value: originalPlatform });
      });

      it('darwin (macOS)',
        function () {
          process.env.HOME = os.homedir();
          const path = `${process.env.HOME}/Library/Application Support`;
          Object.defineProperty(process, 'platform', { value: 'darwin' });
          expect(utils.vscodePath()).to.be.equal(path);
        });

      it('linux',
        function () {
          const path = `${os.homedir()}/.config`;
          Object.defineProperty(process, 'platform', { value: 'linux' });
          expect(utils.vscodePath()).to.be.equal(path);
        });

      it('win32 (windows)',
        function () {
          const path = 'C:\Users\User\AppData\Roaming';
          process.env.APPDATA = path;
          Object.defineProperty(process, 'platform', { value: 'win32' });
          expect(utils.vscodePath()).to.be.equal(path);
        });

      it('not implemented',
        function () {
          const path = '/var/local';
          Object.defineProperty(process, 'platform', { value: 'freebsd' });
          expect(utils.vscodePath()).to.be.equal(path);
        });

    });

    context('the \'deleteDirectoryRecursively\' function', function () {

      it('deletes a directory recursively',
        function () {
          const directoryPath = '/path/to';
          const sandbox = sinon.sandbox.create();
          const fileCheck = sandbox.stub(fs, 'existsSync').callsFake(path => path === directoryPath);
          const readDirectory = sandbox.stub(fs, 'readdirSync').callsFake(() => ['dir', 'file.txt']);
          const stats = sandbox.stub(fs, 'lstatSync').callsFake(path => ({
            isDirectory: () => path !== '/path/to/file.txt',
          }));
          const deleteFile = sandbox.stub(fs, 'unlinkSync');
          const removeDirectory = sandbox.stub(fs, 'rmdirSync');
          utils.deleteDirectoryRecursively(directoryPath);
          expect(fileCheck.called).to.be.true;
          expect(readDirectory.called).to.be.true;
          expect(stats.called).to.be.true;
          expect(deleteFile.called).to.be.true;
          expect(removeDirectory.called).to.be.true;
          sandbox.restore();
        });

    });

    context('the \'parseJSON\' function', function () {

      it('returns an object when parsing succeeds',
        function () {
          const json = utils.parseJSON('{"test": "test"}');
          expect(json).to.be.instanceOf(Object);
          expect(Object.getOwnPropertyNames(json)).to.include('test');
          expect(json['test']).to.be.equal('test');
        });

      it('returns \'null\' when parsing fails',
        function () {
          expect(utils.parseJSON('test')).to.be.null;
        });

    });

    context('the \'getRelativePath\' function', function () {

      it('does not throw an Error, ' +
        'if the destination directory does not exists and a directory check should not be done',
        function () {
          const toDirName = 'path/to';
          expect(utils.getRelativePath.bind(utils.getRelativePath, 'path/from', toDirName, false))
            .to.not.throw(Error, `Directory '${toDirName}' not found.`);
        });

      context('returns a relative path that', function () {

        context('has a trailing path separator', function () {

          const trailingPathSeparatorTest = (toDirName: string) => {
            const relativePath = utils.getRelativePath('path/from', toDirName, false);
            expect(/\/$/g.test(relativePath)).to.be.true;
            expect(/\/{2,}$/g.test(relativePath)).to.be.false;
          };

          it('if it is provided',
            function () {
              trailingPathSeparatorTest('path/to/');
            });

          it('if it is not provided',
            function () {
              trailingPathSeparatorTest('path/to');
            });

          it('that is not repeated',
            function () {
              trailingPathSeparatorTest('path/to//');
              trailingPathSeparatorTest('path/to///');
            });

        });

      });

      context('throws an Error if', function () {

        it('the `fromDirPath` parameter is not defined',
          function () {
            expect(utils.getRelativePath.bind(utils.getRelativePath, null, 'path/to'))
              .to.throw(Error, 'fromDirPath not defined.');
          });

        it('the `toDirName` parameter is not defined',
          function () {
            expect(utils.getRelativePath.bind(utils.getRelativePath, 'path/from', null))
              .to.throw(Error, 'toDirName not defined.');
          });

        it('the destination directory does not exists',
          function () {
            const toDirName = 'path/to';
            expect(utils.getRelativePath.bind(utils.getRelativePath, 'path/from', toDirName))
              .to.throw(Error, `Directory '${toDirName}' not found.`);
          });

      });

    });

    context('the \'removeFirstDot\' function', function () {

      it('removes the leading dot',
        function () {
          expect(utils.removeFirstDot('.test')).to.be.equal('test');
        });

    });

    context('the \'overwriteDrive\' function', function () {

      it('overwrites the drive',
        function () {
          const sourcePath = 'C:\\path\\to';
          const destPath = 'D:\\path\\to';
          expect(utils.overwriteDrive(sourcePath, destPath)).to.be.equal(sourcePath);
        });

    });

    context('the \'getDrives\' function returns an', function () {

      it('Array of the provided drives',
        function () {
          const drive1 = 'C:';
          const drive2 = 'D:';
          expect(utils.getDrives(drive1)).to.be.an.instanceOf(Array).and.include(drive1);
          expect(utils.getDrives(drive1, drive2)).an.instanceOf(Array).and.include.members([drive1, drive2]);
        });

      it('empty Array, if no drive is provided',
        function () {
          expect(utils.getDrives()).to.be.an.instanceOf(Array).and.be.empty;
        });

      it('Array of undefined drives, if provided paths are not actual drives',
        function () {
          expect(utils.getDrives('/', 'file:///')).to.be.an.instanceOf(Array).and.include.members([undefined]);
        });

    });

  });

});
