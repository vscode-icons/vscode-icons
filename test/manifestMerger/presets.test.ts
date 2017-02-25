// tslint:disable only-arrow-functions
import { expect } from 'chai';
import { extensions as fileExtensions } from '../support/supportedExtensions';
import { extensions as folderExtensions } from '../support/supportedFolders';
import {
  toggleAngularPreset,
  toggleOfficialIconsPreset,
  toggleHideFoldersPreset,
} from '../../src/icon-manifest';
import { IFileCollection } from '../../src/models';

describe('Presets: merging configuration documents', function () {

  context('ensures', function () {

    it('angular extensions are disabled', function () {
      const result = toggleAngularPreset(true, fileExtensions);
      const nggroup = result.supported.filter(x => x.icon.startsWith('ng_'));
      expect(nggroup.length).equals(14);
      nggroup.forEach(x => {
        expect(x.disabled).to.be.true;
      });
    });

    it('all angular extensions are disabled even if duplicity is present', function () {
      const custom: IFileCollection = {
        default: null,
        supported: [
          { icon: 'ng_routing_ts', extensions: ['routing.ts'], format: 'svg' },
          { icon: 'ng_routing_js', extensions: ['routing.js'], format: 'svg' },
          { icon: 'ng_routing_ts', extensions: ['app-routing.module.ts'], filename: true, format: 'svg' },
          { icon: 'ng_routing_js', extensions: ['app-routing.module.js'], filename: true, format: 'svg' },
        ],
      };

      const result = toggleAngularPreset(true, custom);
      const ngGroup = result.supported
        .filter(x => x.icon.startsWith('ng_'));
      expect(ngGroup.length).equals(4);
      ngGroup.forEach(x => {
        expect(x.disabled).to.be.true;
      });
    });

    it('js official extension is enabled', function () {
      const custom: IFileCollection = {
        default: null,
        supported: [],
      };
      const result = toggleOfficialIconsPreset(false, custom, ['js_official'], ['js']);
      const official = result.supported.find(x => x.icon === 'js_official');
      const unofficial = result.supported.find(x => x.icon === 'js');
      expect(official.disabled).to.be.false;
      expect(unofficial.disabled).to.be.true;
    });

    it('ts official extension is enabled', function () {
      const custom: IFileCollection = {
        default: null,
        supported: [],
      };
      const result = toggleOfficialIconsPreset(false, custom,
        ['typescript_official', 'typescriptdef_official'], ['typescript', 'typescriptdef']);
      const official = result.supported.find(x => x.icon === 'typescript_official');
      const unofficial = result.supported.find(x => x.icon === 'typescript');
      const officialDef = result.supported.find(x => x.icon === 'typescriptdef_official');
      const unofficialDef = result.supported.find(x => x.icon === 'typescriptdef');
      expect(official.disabled).to.be.false;
      expect(unofficial.disabled).to.be.true;
      expect(officialDef.disabled).to.be.false;
      expect(unofficialDef.disabled).to.be.true;
    });

    it('json official extension is enabled', function () {
      const custom: IFileCollection = {
        default: null,
        supported: [],
      };
      const result = toggleOfficialIconsPreset(false, custom, ['json_official'], ['json']);
      const official = result.supported.find(x => x.icon === 'json_official');
      const unofficial = result.supported.find(x => x.icon === 'json');
      expect(official.disabled).to.be.false;
      expect(unofficial.disabled).to.be.true;
    });

    it('hide folders preset hides all folders', function () {
      const result = toggleHideFoldersPreset(true, folderExtensions);
      const supported = result.supported.find(x => x.icon === 'aws');
      expect(supported.disabled).to.be.true;
      expect(result.default.folder.disabled).to.be.true;
    });

  });

});
