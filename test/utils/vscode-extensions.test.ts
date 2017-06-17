// tslint:disable only-arrow-functions
// tslint:disable no-unused-expression
import { expect } from 'chai';
import * as mockery from 'mockery';

describe('vscode-extensions: tests', function () {

  context('ensures that', function () {

    context('getVsiconsConfig returns', function () {
      let vsMock;
      let vsExt;

      const config = {
        files: {
          workspaceValue: undefined,
          globalValue: undefined,
        },
        folders: {
          workspaceValue: undefined,
          globalValue: undefined,
        },
        inspect: key => {
          switch (key) {
            case 'vsicons.associations.files':
              return config.files;
            case 'vsicons.associations.folders':
              return config.folders;
            default:
              return null;
          }
        },
        vsicons: {
          associations: {
            files: [],
            folders: [],
          },
        },
      };

      before(() => {
        mockery.enable({
          warnOnUnregistered: false,
        });
        mockery.registerAllowable('../../src/utils/vscode-extensions');
        vsMock = {};
        mockery.registerMock('vscode', vsMock);
        vsExt = require('../../src/utils/vscode-extensions');
        vsMock.workspace = {
          getConfiguration: () => config,
        };
      });

      after(() => {
        mockery.disable();
      });

      context('for files:', function () {
        it('the configuration\'s vsicons property if no workspaceValue present',
          function () {
            config.files.globalValue = [
              { icon: "js", extensions: ["myExt1", "myExt2.custom.js"], format: "svg" },
            ];
            config.vsicons.associations.files = config.files.globalValue;
            expect(vsExt.getVsiconsConfig()).to.equals(config.vsicons);
          });

        it('the configuration\'s vsicons property if workspaceValue is an empty array',
          function () {
            config.files.globalValue = [
              { icon: "js", extensions: ["myExt1", "myExt2.custom.js"], format: "svg" },
            ];
            config.files.workspaceValue = [];
            config.vsicons.associations.files = config.files.globalValue;
            expect(vsExt.getVsiconsConfig()).to.equals(config.vsicons);
          });

        it('both workspace and global settings for files',
          function () {
            config.files.globalValue = [
              { icon: "js", extensions: ["myExt1", "myExt2.custom.js"], format: "svg" },
            ];
            config.files.workspaceValue = [
              { icon: "js2", extensions: ["myExt1", "myExt2.custom.js"], format: "svg" },
            ];
            // if workspaceValue is present vsicons will return it.
            config.vsicons.associations.files = config.files.workspaceValue;
            expect(vsExt.getVsiconsConfig().associations.files).to.deep.equals([
              { icon: "js2", extensions: ["myExt1", "myExt2.custom.js"], format: "svg" },
              { icon: "js", extensions: ["myExt1", "myExt2.custom.js"], format: "svg" },
            ]);
          });

        it('both workspace and global settings for files and removes exact duplicates',
          function () {
            config.files.globalValue = [
              { icon: "js", extensions: ["myExt", "myExt2.custom.js"], format: "svg" },
            ];
            config.files.workspaceValue = [
              { icon: "js", extensions: ["myExt1", "myExt2.custom.js"], format: "svg" },
              { icon: "js", extensions: ["myExt", "myExt2.custom.js"], format: "svg" },
            ];
            // if workspaceValue is present vsicons will return it.
            config.vsicons.associations.files = config.files.workspaceValue;
            expect(vsExt.getVsiconsConfig().associations.files).to.deep.equals([
              { icon: "js", extensions: ["myExt1", "myExt2.custom.js"], format: "svg" },
              { icon: "js", extensions: ["myExt", "myExt2.custom.js"], format: "svg" },
            ]);
          });
      });

      context('for folders:', function () {
        it('the configuration\'s vsicons property if no workspaceValue present',
          function () {
            config.folders.globalValue = [
              { icon: "js", extensions: ["myExt1", "myExt2.custom.js"], format: "svg" },
            ];
            config.vsicons.associations.folders = config.folders.globalValue;
            expect(vsExt.getVsiconsConfig()).to.equals(config.vsicons);
          });

        it('the configuration\'s vsicons property if workspaceValue is an empty array',
          function () {
            config.folders.globalValue = [
              { icon: "js", extensions: ["myExt1", "myExt2.custom.js"], format: "svg" },
            ];
            config.folders.workspaceValue = [];
            config.vsicons.associations.files = config.folders.globalValue;
            expect(vsExt.getVsiconsConfig()).to.equals(config.vsicons);
          });

        it('both workspace and global settings for files',
          function () {
            config.folders.globalValue = [
              { icon: "js", extensions: ["myExt1", "myExt2.custom.js"], format: "svg" },
            ];
            config.folders.workspaceValue = [
              { icon: "js2", extensions: ["myExt1", "myExt2.custom.js"], format: "svg" },
            ];
            // if workspaceValue is present vsicons will return it.
            config.vsicons.associations.folders = config.folders.workspaceValue;
            expect(vsExt.getVsiconsConfig().associations.folders).to.deep.equals([
              { icon: "js2", extensions: ["myExt1", "myExt2.custom.js"], format: "svg" },
              { icon: "js", extensions: ["myExt1", "myExt2.custom.js"], format: "svg" },
            ]);
          });

        it('both workspace and global settings for files and removes exact duplicates',
          function () {
            config.folders.globalValue = [
              { icon: "js", extensions: ["myExt", "myExt2.custom.js"], format: "svg" },
            ];
            config.folders.workspaceValue = [
              { icon: "js", extensions: ["myExt1", "myExt2.custom.js"], format: "svg" },
              { icon: "js", extensions: ["myExt", "myExt2.custom.js"], format: "svg" },
            ];
            // if workspaceValue is present vsicons will return it.
            config.vsicons.associations.folders = config.folders.workspaceValue;
            expect(vsExt.getVsiconsConfig().associations.folders).to.deep.equals([
              { icon: "js", extensions: ["myExt1", "myExt2.custom.js"], format: "svg" },
              { icon: "js", extensions: ["myExt", "myExt2.custom.js"], format: "svg" },
            ]);
          });
      });

    });

  });

});
