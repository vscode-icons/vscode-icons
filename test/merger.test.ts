// tslint:disable only-arrow-functions
import { expect } from 'chai';
import { extensions as fileExtensions } from './support/supportedExtensions';
import { extensions as folderExtensions } from './support/supportedFolders';
import { vscode } from '../src/utils';
import { IconGenerator } from '../src/icon-manifest/iconGenerator';
import {
  mergeConfig,
  toggleAngular2Preset,
  toggleJavascriptOfficialPreset,
  toggleTypescriptOfficialPreset,
} from '../src/merger';
import {
  IExtensionCollection,
  IFileExtension,
  FileFormat,
  IFolderExtension,
} from '../src/models/IExtension';

let iconGenerator: IconGenerator;

beforeEach(() => {
  iconGenerator = new IconGenerator(vscode);
});

describe('FileExtensions: merging configuration documents', function () {

  it('ensures new extensions are added to existing file extension and respect the extension type', function () {
    const custom: IExtensionCollection<IFileExtension> = {
      supported: [
        { icon: 'actionscript', extensions: ['as2'], format: 'svg' },
      ],
    };
    const json = mergeConfig(custom, fileExtensions, null, folderExtensions, iconGenerator);
    const def = json.iconDefinitions['_f_actionscript'];
    expect(def).exist;
    expect(def.iconPath).exist;
    expect(json.fileExtensions['as2']).equals('_f_actionscript');
    expect(def.iconPath.substr(def.iconPath.length - 3, 3)).equal('svg');
  });

  it('ensures overrides removes the specified extension', function () {
    const custom: IExtensionCollection<IFileExtension> = {
      supported: [
        { icon: 'actionscript2', extensions: ['as2'], overrides: 'actionscript', format: 'svg' },
      ],
    };

    const json = mergeConfig(custom, fileExtensions, null, folderExtensions, iconGenerator);
    const overridenPath = json.iconDefinitions['_f_actionscript'];
    const newPath: string = json.iconDefinitions['_f_actionscript2'].iconPath;
    expect(overridenPath).to.not.exist;
    expect(newPath).exist;
  });

  it('ensures extends replaces the extension', function () {
    const custom: IExtensionCollection<IFileExtension> = {
      supported: [
        { icon: 'newExt', extensions: ['mynew'], extends: 'actionscript', format: 'png' },
      ],
    };

    const json = mergeConfig(custom, fileExtensions, null, folderExtensions, iconGenerator);
    const extendedPath = json.iconDefinitions['_f_actionscript'];
    const newPath: string = json.iconDefinitions['_f_newExt'].iconPath;
    expect(extendedPath).not.to.exist;
    expect(newPath).exist;
    expect(json.fileExtensions['as']).equal('_f_newExt');
    expect(json.fileExtensions['mynew']).equal('_f_newExt');
    expect(newPath.substr(newPath.length - 3, 3)).not.equals('svg');
  });

  it('ensures disabled extensions are not included into the manifest', function () {
    const custom: IExtensionCollection<IFileExtension> = {
      supported: [
        { icon: 'actionscript', extensions: [], disabled: true, format: 'svg' },
      ],
    };
    const json = mergeConfig(custom, fileExtensions, null, folderExtensions, iconGenerator);
    const extendedPath = json.iconDefinitions['_f_actionscript'];
    expect(extendedPath).not.to.exist;
    expect(json.iconDefinitions['_f_newExt']).not.to.exist;
  });

  it('ensures existing extensions are removed from the original Extension', function () {
    const custom: IExtensionCollection<IFileExtension> = {
      supported: [
        { icon: 'newExt', extensions: ['bin', 'o'], format: 'svg' },
      ],
    };
    const json = mergeConfig(custom, fileExtensions, null, folderExtensions, iconGenerator);
    expect(json.iconDefinitions['_f_newExt']).exist;
    expect(json.fileExtensions['bin']).equals('_f_newExt');
    expect(json.fileExtensions['o']).equals('_f_newExt');
  });

  it('ensures existing extensions accept languageId', function () {
    const custom: IExtensionCollection<IFileExtension> = {
      supported: [
        {
          icon: 'actionscript',
          extensions: [],
          format: 'svg',
          languages: [{ ids: 'newlang', defaultExtension: 'newlang' }],
        },
      ],
    };
    const json = mergeConfig(custom, fileExtensions, null, folderExtensions, iconGenerator);
    expect(json.iconDefinitions['_f_actionscript']).exist;
    expect(json.languageIds['newlang']).equals('_f_actionscript');
  });

  it('ensures _custom icon keeps the correct extension', function () {
    const custom: IExtensionCollection<IFileExtension> = {
      supported: [
        {
          icon: 'custom_icon',
          extensions: ['custom'],
          format: 'svg',
        },
      ],
    };
    const json = mergeConfig(custom, fileExtensions, null, folderExtensions, iconGenerator);
    const icon = json.iconDefinitions['_f_custom_icon'];
    expect(icon).exist;
    expect(icon.iconPath.substr(icon.iconPath.length - 3, 3)).equals('svg');
  });

  // vscode doesn't allow absolute paths in icon css for the moment.
  it.skip('ensures _custom icons have an absolute path', function () {
    const custom: IExtensionCollection<IFileExtension> = {
      supported: [
        {
          icon: 'custom_icon',
          extensions: ['custom'],
          format: 'svg',
        },
      ],
    };
    const json = mergeConfig(custom, fileExtensions, null, folderExtensions, iconGenerator);
    const icon = json.iconDefinitions['_f_custom_icon'];
    expect(icon).exist;
    expect(icon.iconPath.startsWith('C:')).to.be.true;
    expect(json.fileExtensions['custom']).equals('_f_custom_icon');
  });

  it('ensures _custom icons have a custom path', function () {
    const custom: IExtensionCollection<IFileExtension> = {
      supported: [
        {
          icon: 'custom_icon',
          extensions: ['custom'],
          format: 'svg',
        },
      ],
    };
    const json = mergeConfig(custom, fileExtensions, null, folderExtensions, iconGenerator);
    const icon = json.iconDefinitions['_f_custom_icon'];
    expect(icon).exist;
    expect(icon.iconPath.indexOf('robertohuertasm.vscode-icons.custom-icons')).to.be.greaterThan(-1);
    expect(json.fileExtensions['custom']).equals('_f_custom_icon');
  });

});

describe('FolderExtensions: merging configuration documents', function () {

  it('ensures new extensions are added to existing file extension and respect the extension type', function () {
    const custom: IExtensionCollection<IFolderExtension> = {
      supported: [
        { icon: 'aws', extensions: ['aws3'], format: 'svg' },
      ],
    };

    const json = mergeConfig(null, fileExtensions, custom, folderExtensions, iconGenerator);
    const def = json.iconDefinitions['_fd_aws'];
    expect(def).exist;
    expect(def.iconPath).exist;
    expect(json.folderNames['aws3']).equals('_fd_aws');
    expect(json.folderNamesExpanded['aws3']).equals('_fd_aws_open');
    expect(def.iconPath.substr(def.iconPath.length - 3, 3)).equal('svg');
  });

  it('ensures overrides removes the specified extension', function () {
    const custom: IExtensionCollection<IFolderExtension> = {
      supported: [
        { icon: 'aws2', extensions: ['aws2'], overrides: 'aws', format: 'svg' },
      ],
    };

    const json = mergeConfig(null, fileExtensions, custom, folderExtensions, iconGenerator);
    const overridenPath = json.iconDefinitions['_fd_aws'];
    const newPath: string = json.iconDefinitions['_fd_aws2'].iconPath;
    expect(overridenPath).to.not.exist;
    expect(newPath).exist;
  });

  it('ensures extends replaces the extension', function () {
    const custom: IExtensionCollection<IFolderExtension> = {
      supported: [
        { icon: 'newExt', extensions: ['mynew'], extends: 'aws', format: 'png' },
      ],
    };

    const json = mergeConfig(null, fileExtensions, custom, folderExtensions, iconGenerator);
    const extendedPath = json.iconDefinitions['_fd_aws'];
    const newPath: string = json.iconDefinitions['_fd_newExt'].iconPath;
    expect(extendedPath).not.to.exist;
    expect(newPath).exist;
    expect(json.folderNames['aws']).equal('_fd_newExt');
    expect(json.folderNamesExpanded['aws']).equal('_fd_newExt_open');
    expect(json.folderNames['mynew']).equal('_fd_newExt');
    expect(json.folderNamesExpanded['mynew']).equal('_fd_newExt_open');
    expect(newPath.substr(newPath.length - 3, 3)).not.equals('svg');
  });

  it('ensures disabled extensions are not included into the manifest', function () {
    const custom: IExtensionCollection<IFolderExtension> = {
      supported: [
        { icon: 'aws', extensions: [], disabled: true, format: 'svg' },
      ],
    };
    const json = mergeConfig(null, fileExtensions, custom, folderExtensions, iconGenerator);
    const extendedPath = json.iconDefinitions['_fd_aws'];
    expect(extendedPath).not.to.exist;
    expect(json.iconDefinitions['_fd_newExt']).not.to.exist;
  });

  it('ensures existing extensions are removed from the original Extension', function () {
    const custom: IExtensionCollection<IFolderExtension> = {
      supported: [
        { icon: 'newExt', extensions: ['aws'], format: 'svg' },
      ],
    };
    const json = mergeConfig(null, fileExtensions, custom, folderExtensions, iconGenerator);
    expect(json.iconDefinitions['_fd_newExt']).exist;
    expect(json.folderNames['aws']).equals('_fd_newExt');
  });

  it('ensures _custom icon keeps the correct extension', function () {
    const custom: IExtensionCollection<IFolderExtension> = {
      supported: [
        {
          icon: 'custom_icon',
          extensions: ['custom'],
          format: 'svg',
        },
      ],
    };
    const json = mergeConfig(null, fileExtensions, custom, folderExtensions, iconGenerator);
    const icon = json.iconDefinitions['_fd_custom_icon'];
    expect(icon).exist;
    expect(icon.iconPath.substr(icon.iconPath.length - 3, 3)).equals('svg');
  });

  // vscode doesn't allow absolute paths in icon css for the moment.
  it.skip('ensures _custom icons have an absolute path', function () {
    const custom: IExtensionCollection<IFolderExtension> = {
      supported: [
        {
          icon: 'custom_icon',
          extensions: ['custom'],
          format: 'svg',
        },
      ],
    };
    const json = mergeConfig(null, fileExtensions, custom, folderExtensions, iconGenerator);
    const icon = json.iconDefinitions['_f_custom_icon'];
    expect(icon).exist;
    expect(icon.iconPath.startsWith('C:')).to.be.true;
    expect(json.fileExtensions['custom']).equals('_f_custom_icon');
  });

  it('ensures _custom icons have a custom path', function () {
    const custom: IExtensionCollection<IFolderExtension> = {
      supported: [
        {
          icon: 'custom_icon',
          extensions: ['custom'],
          format: 'svg',
        },
      ],
    };
    const json = mergeConfig(null, fileExtensions, custom, folderExtensions, iconGenerator);
    const icon = json.iconDefinitions['_fd_custom_icon'];
    expect(icon).exist;
    expect(icon.iconPath.indexOf('robertohuertasm.vscode-icons.custom-icons')).to.be.greaterThan(-1);
    expect(json.folderNames['custom']).equals('_fd_custom_icon');
    expect(json.folderNamesExpanded['custom']).equals('_fd_custom_icon_open');
  });

});

describe('Presets: merging configuration documents', function () {

  it('ensures angular2 extensions are disabled', function () {
    const custom: IExtensionCollection<IFileExtension> = {
      supported: [],
    };
    const result = toggleAngular2Preset(true, custom);
    const ng2group = result.supported
      .filter(x => x.icon.startsWith('ng2_'));
    expect(ng2group.length).equals(12);
    ng2group.forEach(x => {
      expect(x.disabled).to.be.true;
    });
  });

  it('ensures angular2 extensions are disabled even if custom icon is present', function () {
    const custom: IExtensionCollection<IFileExtension> = {
      supported: [
        { icon: 'ng2_component_ts', extensions: ['mycomponent.ts'], format: FileFormat.svg },
      ],
    };

    const result = toggleAngular2Preset(true, custom);
    const ng2group = result.supported
      .filter(x => x.icon.startsWith('ng2_'));
    expect(ng2group.length).equals(12);
    ng2group.forEach(x => {
      expect(x.disabled).to.be.true;
    });
  });

  it('ensures all angular2 extensions are disabled even if duplicity is present', function () {
    const custom: IExtensionCollection<IFileExtension> = {
      supported: [
        { icon: 'ng2_routing_ts', extensions: ['routing.ts'], format: FileFormat.svg },
        { icon: 'ng2_routing_js', extensions: ['routing.js'], format: FileFormat.svg },
        { icon: 'ng2_routing_ts', extensions: ['app-routing.module.ts'], filename: true, format: FileFormat.svg },
        { icon: 'ng2_routing_js', extensions: ['app-routing.module.js'], filename: true, format: FileFormat.svg },
      ],
    };

    const result = toggleAngular2Preset(true, custom);
    const ng2group = result.supported
      .filter(x => x.icon.startsWith('ng2_'));
    expect(ng2group.length).equals(14);
    ng2group.forEach(x => {
      expect(x.disabled).to.be.true;
    });
  });

  it('ensures js official extension is enabled', function () {
    const custom: IExtensionCollection<IFileExtension> = {
      supported: [],
    };
    const result = toggleJavascriptOfficialPreset(false, custom);
    const official = result.supported.find(x => x.icon === 'js_official');
    const unofficial = result.supported.find(x => x.icon === 'js');
    expect(official.disabled).to.be.false;
    expect(unofficial.disabled).to.be.true;
  });

  it('ensures ts official extension is enabled', function () {
    const custom: IExtensionCollection<IFileExtension> = {
      supported: [],
    };
    const result = toggleTypescriptOfficialPreset(false, custom);
    const official = result.supported.find(x => x.icon === 'typescript_official');
    const unofficial = result.supported.find(x => x.icon === 'typescript');
    expect(official.disabled).to.be.false;
    expect(unofficial.disabled).to.be.true;
  });

});
