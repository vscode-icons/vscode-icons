/* eslint-disable prefer-arrow-callback */
/* eslint-disable no-unused-expressions */
import { expect } from 'chai';
import * as packageJson from '../../../package.json';
import { constants } from '../../src/constants';
import { IVSCodeManifest } from '../../src/models/packageManifest/vscode';
import { IVSCodeCommand } from '../../src/models/vscode/vscodeCommand';

describe('Specifications: tests', function () {
  let manifest: IVSCodeManifest;

  before(function () {
    manifest = packageJson as IVSCodeManifest;
  });

  context(`ensures that`, function () {
    it(`every command starts with 'vsicons.'`, function () {
      manifest.contributes.commands.forEach((command: IVSCodeCommand) => {
        expect(command.command.startsWith(constants.extension.name)).to.be.true;
      });
    });

    it(`every command has a title starts and ends with '%'`, function () {
      manifest.contributes.commands.forEach((command: IVSCodeCommand) => {
        expect(command.title.startsWith('%')).to.be.true;
        expect(command.title.endsWith('%')).to.be.true;
      });
    });

    it(`every command has a category of 'Icons'`, function () {
      manifest.contributes.commands.forEach((command: IVSCodeCommand) => {
        expect(command.category).to.equal('Icons');
      });
    });

    it(`every command has a callbackName`, function () {
      manifest.contributes.commands.forEach((command: IVSCodeCommand) => {
        expect(command.callbackName).to.not.be.empty;
      });
    });
  });
});
