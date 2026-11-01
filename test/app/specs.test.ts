import type { VSCodeManifest } from '../../src/types/package';
import type { VSCodeCommand } from '../../src/types/vscode';

import { expect } from 'chai';

import packageJson from '../../../package.json';
import { constants } from '../../src/constants';

describe('Specifications: tests', function () {
  let manifest: VSCodeManifest;

  before(function () {
    manifest = packageJson as VSCodeManifest;
  });

  context(`ensures that`, function () {
    it(`every command starts with 'vsicons.'`, function () {
      manifest.contributes.commands.forEach((command: VSCodeCommand) => {
        expect(command.command.startsWith(constants.extension.name)).to.be.true;
      });
    });

    it(`every command has a title starts and ends with '%'`, function () {
      manifest.contributes.commands.forEach((command: VSCodeCommand) => {
        expect(command.title.startsWith('%')).to.be.true;
        expect(command.title.endsWith('%')).to.be.true;
      });
    });

    it(`every command has a category of 'Icons'`, function () {
      manifest.contributes.commands.forEach((command: VSCodeCommand) => {
        expect(command.category).to.equal('Icons');
      });
    });

    it(`every command has a callbackName`, function () {
      manifest.contributes.commands.forEach((command: VSCodeCommand) => {
        expect(command.callbackName).to.not.be.empty;
      });
    });
  });
});
