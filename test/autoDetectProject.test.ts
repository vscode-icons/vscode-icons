// tslint:disable only-arrow-functions
import { expect } from 'chai';
import * as sinon from 'sinon';
import { IVSIcons } from '../src/models';
import { detectProject } from '../src/init/autoDetectProject';

function getUserConfig() {
  const userConfig: IVSIcons = {
    dontShowNewVersionMessage: false,
    projectDetection: {
      autoReload: false,
      disableDetect: false,
    },
    presets: {
      angular: true,
      jsOfficial: false,
      tsOfficial: false,
      jsonOfficial: false,
      hideFolders: false,
    },
    associations: {
      files: [],
      folders: [],
      fileDefault: { file: undefined, file_light: undefined },
      folderDefault: { folder: undefined, folder_light: undefined },
    },
  };
  return userConfig;
}

describe('detectProject: tests', function () {

  it('ensures that the extension doesn\'t detect a project when detection is disabled',
    function () {
      const conf = getUserConfig();
      conf.projectDetection.disableDetect = true;
      detectProject(null, conf)
        .then(
        (res) => expect(res.isProject).to.be.false,
        (rej) => expect(rej.message).to.be.empty);
    });

  it('ensures that the extension can detect a project but it has not detected a \'package.json\'',
    function () {
      const findFiles = () => { return Promise.resolve([]); };
      const conf = getUserConfig();
      detectProject(findFiles, conf)
        .then(
        (res) => expect(res.isProject).to.be.false,
        (rej) => expect(rej.message).to.not.be.empty);
    });

  it.only('ensures that the extension can detect a project and has detected a \'package.json\' ' +
    'but it\'s not a detectable project',
    function () {
      const findFiles = () => { return Promise.resolve([{}]); };
      const conf = getUserConfig();
      detectProject(findFiles, conf)
        .then(
        (res) => expect(res.isProject).to.be.false,
        (rej) => expect(rej.message).to.be.empty);
    });

});
