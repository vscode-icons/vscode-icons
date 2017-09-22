// tslint:disable only-arrow-functions
// tslint:disable no-unused-expression
import { expect } from 'chai';
import { extensions as fileExtensions } from '../support/supportedExtensions';
import { extensions as folderExtensions } from '../support/supportedFolders';
import * as iconManifest from '../../src/icon-manifest';

describe('Presets: merging configuration documents', function () {

  context('ensures that', function () {

    let custom: any;
    beforeEach(() => {
      custom = {
        default: null,
        supported: [],
      };
    });

    it('all angular extensions get disabled',
      function () {
        const result = iconManifest.toggleAngularPreset(true, fileExtensions);
        const nggroup = result.supported.filter(x => x.icon.startsWith('ng_') && x.disabled);
        expect(nggroup.length).to.equals(34);
      });

    it('only first set of angular extensions get enabled',
      function () {
        const result = iconManifest.toggleAngularPreset(false, fileExtensions);
        const nggroup = result.supported.filter(x => x.icon.startsWith('ng_') && !x.disabled);
        expect(nggroup.length).to.equals(18);
      });

    it('only second set of angular extensions get enabled',
      function () {
        custom.supported.push(
          { icon: 'ng_component_ts2', extensions: ['component.ts'], format: 'svg' },
          { icon: 'ng_component_js2', extensions: ['component.js'], format: 'svg' },
          { icon: 'ng_smart_component_ts2', extensions: ['page.ts', 'container.ts'], format: 'svg' },
          { icon: 'ng_smart_component_js2', extensions: ['page.js', 'container.js'], format: 'svg' },
          { icon: 'ng_directive_ts2', extensions: ['directive.ts'], format: 'svg' },
          { icon: 'ng_directive_js2', extensions: ['directive.js'], format: 'svg' },
          { icon: 'ng_pipe_ts2', extensions: ['pipe.ts'], format: 'svg' },
          { icon: 'ng_pipe_js2', extensions: ['pipe.js'], format: 'svg' },
          { icon: 'ng_service_ts2', extensions: ['service.ts'], format: 'svg' },
          { icon: 'ng_service_js2', extensions: ['service.js'], format: 'svg' },
          { icon: 'ng_module_ts2', extensions: ['module.ts'], format: 'svg' },
          { icon: 'ng_module_js2', extensions: ['module.js'], format: 'svg' },
          { icon: 'ng_routing_ts2', extensions: ['routing.ts'], format: 'svg' },
          { icon: 'ng_routing_js2', extensions: ['routing.js'], format: 'svg' },
          { icon: 'ng_routing_ts2', extensions: ['app-routing.module.ts'], filename: true, format: 'svg' },
          { icon: 'ng_routing_js2', extensions: ['app-routing.module.js'], filename: true, format: 'svg' });
        const result = iconManifest.toggleAngularPreset(false, custom);
        const ngGroup = result.supported.filter(x => /^ng_.*2$/.test(x.icon) && !x.disabled);
        expect(ngGroup.length).to.equals(16);
      });

    it('all angular extensions are disabled even if duplicity is present',
      function () {
        custom.supported.push(
          { icon: 'ng_routing_ts', extensions: ['routing.ts'], format: 'svg' },
          { icon: 'ng_routing_js', extensions: ['routing.js'], format: 'svg' },
          { icon: 'ng_routing_ts', extensions: ['app-routing.module.ts'], filename: true, format: 'svg' },
          { icon: 'ng_routing_js', extensions: ['app-routing.module.js'], filename: true, format: 'svg' });
        const result = iconManifest.toggleAngularPreset(true, custom);
        const ngGroup = result.supported.filter(x => x.icon.startsWith('ng_') && x.disabled);
        expect(ngGroup.length).to.equals(4);
      });

    it('JS official extension is enabled',
      function () {
        const result = iconManifest.toggleOfficialIconsPreset(false, custom, ['js_official'], ['js']);
        const official = result.supported.find(x => x.icon === 'js_official');
        const unofficial = result.supported.find(x => x.icon === 'js');
        expect(official.disabled).to.be.false;
        expect(unofficial.disabled).to.be.true;
      });

    it('JS official extension toggling forth and back is working properly',
      function () {
        let official;
        let unofficial;
        const toggle = (disable: boolean) => {
          const result = iconManifest.toggleOfficialIconsPreset(disable, custom, ['js_official'], ['js']);
          official = result.supported.find(x => x.icon === 'js_official');
          unofficial = result.supported.find(x => x.icon === 'js');
        };
        toggle(false);
        expect(official.disabled).to.be.false;
        expect(unofficial.disabled).to.be.true;
        toggle(true);
        expect(official.disabled).to.be.true;
        expect(unofficial.disabled).to.be.false;
      });

    it('TS official extension is enabled',
      function () {
        const result = iconManifest.toggleOfficialIconsPreset(false, custom,
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

    it('TS official extension toggling forth and back is working properly',
      function () {
        let official;
        let unofficial;
        let officialDef;
        let unofficialDef;
        const toggle = (disable: boolean) => {
          const result = iconManifest.toggleOfficialIconsPreset(disable, custom,
            ['typescript_official', 'typescriptdef_official'], ['typescript', 'typescriptdef']);
          official = result.supported.find(x => x.icon === 'typescript_official');
          unofficial = result.supported.find(x => x.icon === 'typescript');
          officialDef = result.supported.find(x => x.icon === 'typescriptdef_official');
          unofficialDef = result.supported.find(x => x.icon === 'typescriptdef');
        };
        toggle(false);
        expect(official.disabled).to.be.false;
        expect(unofficial.disabled).to.be.true;
        expect(officialDef.disabled).to.be.false;
        expect(unofficialDef.disabled).to.be.true;
        toggle(true);
        expect(official.disabled).to.be.true;
        expect(unofficial.disabled).to.be.false;
        expect(officialDef.disabled).to.be.true;
        expect(unofficialDef.disabled).to.be.false;
      });

    it('JSON official extension is enabled',
      function () {
        const result = iconManifest.toggleOfficialIconsPreset(false, custom, ['json_official'], ['json']);
        const official = result.supported.find(x => x.icon === 'json_official');
        const unofficial = result.supported.find(x => x.icon === 'json');
        expect(official.disabled).to.be.false;
        expect(unofficial.disabled).to.be.true;
      });

    it('JSON official extension toggling forth and back is working properly',
      function () {
        let official;
        let unofficial;
        const toggle = (disable: boolean) => {
          const result = iconManifest.toggleOfficialIconsPreset(disable, custom, ['json_official'], ['json']);
          official = result.supported.find(x => x.icon === 'json_official');
          unofficial = result.supported.find(x => x.icon === 'json');
        };
        toggle(false);
        expect(official.disabled).to.be.false;
        expect(unofficial.disabled).to.be.true;
        toggle(true);
        expect(official.disabled).to.be.true;
        expect(unofficial.disabled).to.be.false;
      });

    context('hide folders preset', function () {

      it('hides all folders',
        function () {
          folderExtensions.default.folder_light = { icon: 'folderIconLight', format: 'svg' };
          folderExtensions.default.root_folder_light = { icon: 'rootFolderIconLight', format: 'svg' };
          const result = iconManifest.toggleHideFoldersPreset(true, folderExtensions);
          const supported = result.supported.find(x => x.icon === 'aws');
          expect(supported.disabled).to.be.true;
          expect(result.default.folder.disabled).to.be.true;
          expect(result.default.folder_light.disabled).to.be.true;
          expect(result.default.root_folder.disabled).to.be.true;
          expect(result.default.root_folder_light.disabled).to.be.true;
        });

      it('toggling forth and back is working properly',
        function () {
          folderExtensions.default.folder_light = { icon: 'folderIconLight', format: 'svg' };
          folderExtensions.default.root_folder_light = { icon: 'rootFolderIconLight', format: 'svg' };
          let result;
          let supported;
          const toggle = (disable: boolean) => {
            result = iconManifest.toggleHideFoldersPreset(disable, folderExtensions);
            supported = result.supported.find(x => x.icon === 'aws');
          };
          toggle(true);
          expect(supported.disabled).to.be.true;
          expect(result.default.folder.disabled).to.be.true;
          expect(result.default.folder_light.disabled).to.be.true;
          expect(result.default.root_folder.disabled).to.be.true;
          expect(result.default.root_folder_light.disabled).to.be.true;
          toggle(false);
          expect(supported.disabled).to.be.false;
          expect(result.default.folder.disabled).to.be.false;
          expect(result.default.folder_light.disabled).to.be.false;
          expect(result.default.root_folder.disabled).to.be.false;
          expect(result.default.root_folder_light.disabled).to.be.false;
        });

      it('hides all folders even custom ones',
        function () {
          custom.default = { folder: null, folder_light: null, root_folder: null, root_folder_light: null };
          custom.supported.push({ icon: 'newExt', extensions: ['aws'], format: 'svg' });
          const result = iconManifest.toggleHideFoldersPreset(true, custom);
          const supported = result.supported.find(x => x.icon === 'newExt');
          expect(supported.disabled).to.be.true;
          expect(result.default.folder).to.be.null;
          expect(result.default.folder_light).to.be.null;
          expect(result.default.root_folder).to.be.null;
          expect(result.default.root_folder_light).to.be.null;
        });
    });

    context('folders all default icon preset', function () {

      it('shows all folders with the default folder icon',
        function () {
          folderExtensions.default.folder_light = { icon: 'folderIconLight', format: 'svg' };
          folderExtensions.default.root_folder_light = { icon: 'rootFolderIconLight', format: 'svg' };
          const result = iconManifest.toggleFoldersAllDefaultIconPreset(true, folderExtensions);
          const supported = result.supported.find(x => x.icon === 'aws');
          expect(supported.disabled).to.be.true;
          expect(result.default.root_folder.disabled).to.be.false;
          expect(result.default.root_folder_light.disabled).to.be.false;
          expect(result.default.folder.disabled).to.be.false;
          expect(result.default.folder_light.disabled).to.be.false;
        });

      it('toggling forth and back is working properly',
        function () {
          folderExtensions.default.folder_light = { icon: 'folderIconLight', format: 'svg' };
          folderExtensions.default.root_folder_light = { icon: 'rootFolderIconLight', format: 'svg' };
          let result;
          let supported;
          const toggle = (disable: boolean) => {
            result = iconManifest.toggleFoldersAllDefaultIconPreset(disable, folderExtensions);
            supported = result.supported.find(x => x.icon === 'aws');
          };
          toggle(true);
          expect(supported.disabled).to.be.true;
          expect(result.default.root_folder.disabled).to.be.false;
          expect(result.default.root_folder_light.disabled).to.be.false;
          expect(result.default.folder.disabled).to.be.false;
          expect(result.default.folder_light.disabled).to.be.false;

          toggle(false);
          expect(supported.disabled).to.be.false;
          expect(result.default.root_folder.disabled).to.be.false;
          expect(result.default.root_folder_light.disabled).to.be.false;
          expect(result.default.folder.disabled).to.be.false;
          expect(result.default.folder_light.disabled).to.be.false;
        });

      it('shows all folders with the default folder icon even custom ones',
        function () {
          custom.default = { folder: null, folder_light: null, root_folder: null, root_folder_light: null };
          custom.supported.push({ icon: 'newExt', extensions: ['aws'], format: 'svg' });
          const result = iconManifest.toggleFoldersAllDefaultIconPreset(true, custom);
          const supported = result.supported.find(x => x.icon === 'newExt');
          expect(supported.disabled).to.be.true;
          expect(result.default.folder).to.be.null;
          expect(result.default.folder_light).to.be.null;
          expect(result.default.root_folder).to.be.null;
          expect(result.default.root_folder_light).to.be.null;
        });

    });

  });

});
