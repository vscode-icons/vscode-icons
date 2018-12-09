// tslint:disable only-arrow-functions
// tslint:disable no-unused-expression
import { expect } from 'chai';
import * as manifest from '../../../package.json';
import { constants } from '../../src/constants';

describe('Specifications: tests', function () {
  context(`ensures that`, function () {
    it(`every command starts with 'vsicons.'`, function () {
      manifest.contributes.commands.forEach(command => {
        expect(command.command.startsWith(constants.extension.name)).to.be.true;
      });
    });

    it(`every command has a title starts and ends with '%'`, function () {
      manifest.contributes.commands.forEach(command => {
        expect(command.title.startsWith('%')).to.be.true;
        expect(command.title.endsWith('%')).to.be.true;
      });
    });

    it(`every command has a category of 'Icons'`, function () {
      manifest.contributes.commands.forEach(command => {
        expect(command.category).to.equal('Icons');
      });
    });

    it(`every command has a callbackName`, function () {
      manifest.contributes.commands.forEach(command => {
        expect(command.callbackName).to.not.be.empty;
      });
    });
  });
});
