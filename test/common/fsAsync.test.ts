import * as fsPromises from 'node:fs/promises';

import { expect } from 'chai';

import * as fsAsync from '../../src/common/fsAsync';

describe('FsAsync: tests', function () {
  it('exports filesystem promise helpers', function () {
    expect(fsAsync.lstatAsync).to.equal(fsPromises.lstat);
    expect(fsAsync.mkdirAsync).to.equal(fsPromises.mkdir);
    expect(fsAsync.readFileAsync).to.equal(fsPromises.readFile);
    expect(fsAsync.readdirAsync).to.equal(fsPromises.readdir);
    expect(fsAsync.rmdirAsync).to.equal(fsPromises.rm);
    expect(fsAsync.unlinkAsync).to.equal(fsPromises.unlink);
    expect(fsAsync.writeFileAsync).to.equal(fsPromises.writeFile);
  });
});
