// tslint:disable only-arrow-functions
import * as fs from 'fs';
import * as path from 'path';
import { expect } from 'chai';
import { extensions as fileExtensions } from './support/supportedExtensions';
import { extensions as folderExtensions } from './support/supportedFolders';
import { vscode } from '../src/utils';
import { extensionSettings } from '../src/settings';
import {
  IconGenerator,
  mergeConfig,
  toggleAngularPreset,
  toggleOfficialIconsPreset,
  toggleHideFoldersPreset,
  schema,
} from '../src/icon-manifest';
import {
  IFileCollection,
  IFolderCollection,
} from '../src/models';
import { deleteDirectoryRecursively, tempPath } from '../src/utils';

let iconGenerator: IconGenerator;
const tempFolderPath = tempPath();

before(() => {
  // ensure the tests write to the temp folder
  process.chdir(tempFolderPath);

  if (fs.existsSync(extensionSettings.customIconFolderName)) {
    return;
  }

  fs.mkdir(extensionSettings.customIconFolderName);
});

after(() => {
  deleteDirectoryRecursively(extensionSettings.customIconFolderName);
});

beforeEach(() => {
  iconGenerator = new IconGenerator(vscode, schema);
  iconGenerator.settings.vscodeAppData = tempFolderPath;
});

afterEach(() => {
  iconGenerator = null;
});

describe('FileExtensions: merging configuration documents', function () {

  it('ensures new extensions are added to existing file extension and respect the extension type', function () {
    const custom: IFileCollection = {
      default: null,
      supported: [
        { icon: 'actionscript', extensions: ['as2'], format: 'svg' },
      ],
    };
    const json = mergeConfig(custom, fileExtensions, null, folderExtensions, iconGenerator);
    const def = json.iconDefinitions['_f_actionscript'];
    expect(def).exist;
    expect(def.iconPath).exist;
    expect(json.fileExtensions['as2']).equals('_f_actionscript');
    expect(path.extname(def.iconPath)).equal('.svg');
  });

  it('ensures overrides removes the specified extension', function () {
    const custom: IFileCollection = {
      default: null,
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
    const custom: IFileCollection = {
      default: null,
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
    expect(path.extname(newPath)).not.equals('.svg');
  });

  it('ensures disabled extensions are not included into the manifest', function () {
    const custom: IFileCollection = {
      default: null,
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
    const custom: IFileCollection = {
      default: null,
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
    const custom: IFileCollection = {
      default: null,
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

  it('ensures custom icon keeps the correct extension', function () {
    const custom: IFileCollection = {
      default: null,
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

  it('ensures custom icons have a custom path', function () {
    const custom: IFileCollection = {
      default: null,
      supported: [
        {
          icon: 'custom_icon',
          extensions: ['custom'],
          format: 'svg',
        },
      ],
    };
    const iconName =
      `${extensionSettings.filePrefix}${custom.supported[0].icon}` +
      `${extensionSettings.iconSuffix}.${custom.supported[0].format}`;

    try {
      fs.writeFileSync(path.join(extensionSettings.customIconFolderName, iconName), '');

      const json = mergeConfig(custom, fileExtensions, null, folderExtensions, iconGenerator);
      const icon = json.iconDefinitions['_f_custom_icon'];
      expect(icon).exist;
      expect(icon.iconPath).contains(extensionSettings.customIconFolderName);
      expect(json.fileExtensions['custom']).equals('_f_custom_icon');
    } finally {
      fs.unlinkSync(path.join(extensionSettings.customIconFolderName, iconName));
    }
  });

});

describe('FolderExtensions: merging configuration documents', function () {

  it('ensures new extensions are added to existing file extension and respect the extension type', function () {
    const custom: IFolderCollection = {
      default: null,
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
    const custom: IFolderCollection = {
      default: null,
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
    const custom: IFolderCollection = {
      default: null,
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
    const custom: IFolderCollection = {
      default: null,
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
    const custom: IFolderCollection = {
      default: null,
      supported: [
        { icon: 'newExt', extensions: ['aws'], format: 'svg' },
      ],
    };
    const json = mergeConfig(null, fileExtensions, custom, folderExtensions, iconGenerator);
    expect(json.iconDefinitions['_fd_newExt']).exist;
    expect(json.folderNames['aws']).equals('_fd_newExt');
  });

  it('ensures custom icon keeps the correct extension', function () {
    const custom: IFolderCollection = {
      default: null,
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

  it('ensures custom icons have a custom path', function () {
    const custom: IFolderCollection = {
      default: null,
      supported: [
        {
          icon: 'custom_icon',
          extensions: ['custom'],
          format: 'svg',
        },
      ],
    };
    const iconName =
      `${extensionSettings.folderPrefix}${custom.supported[0].icon}` +
      `${extensionSettings.iconSuffix}.${custom.supported[0].format}`;
    const iconNameOpen =
      `${extensionSettings.folderPrefix}${custom.supported[0].icon}_opened` +
      `${extensionSettings.iconSuffix}.${custom.supported[0].format}`;

    try {
      fs.writeFileSync(path.join(extensionSettings.customIconFolderName, iconName), '');
      fs.writeFileSync(path.join(extensionSettings.customIconFolderName, iconNameOpen), '');

      const json = mergeConfig(null, fileExtensions, custom, folderExtensions, iconGenerator);
      const icon = json.iconDefinitions['_fd_custom_icon'];
      expect(icon).exist;
      expect(icon.iconPath).contains(extensionSettings.customIconFolderName);
      expect(json.folderNames['custom']).equals('_fd_custom_icon');
      expect(json.folderNamesExpanded['custom']).equals('_fd_custom_icon_open');
    } finally {
      fs.unlinkSync(path.join(extensionSettings.customIconFolderName, iconName));
      fs.unlinkSync(path.join(extensionSettings.customIconFolderName, iconNameOpen));
    }
  });

});

describe('Presets: merging configuration documents', function () {

  it('ensures angular extensions are disabled', function () {
    const result = toggleAngularPreset(true, fileExtensions);
    const nggroup = result.supported.filter(x => x.icon.startsWith('ng_'));
    expect(nggroup.length).equals(14);
    nggroup.forEach(x => {
      expect(x.disabled).to.be.true;
    });
  });

  it('ensures all angular extensions are disabled even if duplicity is present', function () {
    const custom: IFileCollection = {
      default: null,
      supported: [
        { icon: 'ng_routing_ts', extensions: ['routing.ts'], format: 'svg' },
        { icon: 'ng_routing_js', extensions: ['routing.js'], format: 'svg' },
        { icon: 'ng_routing_ts', extensions: ['-routing.module.ts'], format: 'svg' },
        { icon: 'ng_routing_js', extensions: ['-routing.module.js'], format: 'svg' },
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

  it('ensures js official extension is enabled', function () {
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

  it('ensures ts official extension is enabled', function () {
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

  it('ensures json official extension is enabled', function () {
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

  it('ensures hide folders preset hides all folders', function () {
    const result = toggleHideFoldersPreset(true, folderExtensions);
    const supported = result.supported.find(x => x.icon === 'aws');
    expect(supported.disabled).to.be.true;
    expect(result.default.folder.disabled).to.be.true;
  });

});

describe('DefaultExtensions: merging configuration documents', function () {

  it('ensures default file icons can be added', function () {

    const custom: IFileCollection = {
      default: {
        file_light: { icon: 'customIconLight', format: 'svg' },
      },
      supported: [],
    };
    const iconName =
      `${extensionSettings.defaultExtensionPrefix}${custom.default.file_light.icon}` +
      `${extensionSettings.iconSuffix}.${custom.default.file_light.format}`;

    try {
      fs.writeFileSync(path.join(extensionSettings.customIconFolderName, iconName), '');

      const json = mergeConfig(custom, fileExtensions, null, folderExtensions, iconGenerator);
      const def = json.iconDefinitions._file_light;
      expect(def).exist;
      expect(def.iconPath).exist;
      expect(def.iconPath).contain(iconName);
      expect(def.iconPath).contain(extensionSettings.customIconFolderName);
    } finally {
      fs.unlinkSync(path.join(extensionSettings.customIconFolderName, iconName));
    }
  });

  it('ensures default folder icons can be added', function () {
    const custom: IFolderCollection = {
      default: {
        folder_light: { icon: 'customIconLight', format: 'svg' },
      },
      supported: [],
    };
    const iconName =
      `${extensionSettings.defaultExtensionPrefix}${custom.default.folder_light.icon}` +
      `${extensionSettings.iconSuffix}.${custom.default.folder_light.format}`;
    const iconNameOpen =
      `${extensionSettings.defaultExtensionPrefix}${custom.default.folder_light.icon}_opened` +
      `${extensionSettings.iconSuffix}.${custom.default.folder_light.format}`;

    try {
      fs.writeFileSync(path.join(extensionSettings.customIconFolderName, iconName), '');
      fs.writeFileSync(path.join(extensionSettings.customIconFolderName, iconNameOpen), '');

      const json = mergeConfig(null, fileExtensions, custom, folderExtensions, iconGenerator);
      const def = json.iconDefinitions._folder_light;
      const defOpen = json.iconDefinitions._folder_light_open;
      expect(def).exist;
      expect(defOpen).exist;
      expect(def.iconPath).exist;
      expect(defOpen.iconPath).exist;
      expect(def.iconPath).contain(iconName);
      expect(defOpen.iconPath).contain(iconNameOpen);
      expect(def.iconPath).contain(extensionSettings.customIconFolderName);
      expect(defOpen.iconPath).contain(extensionSettings.customIconFolderName);
    } finally {
      fs.unlinkSync(path.join(extensionSettings.customIconFolderName, iconName));
      fs.unlinkSync(path.join(extensionSettings.customIconFolderName, iconNameOpen));
    }
  });

  it('ensures default file icons can be overriden', function () {
    const custom: IFileCollection = {
      default: {
        file: { icon: 'customIcon', format: 'svg' },
      },
      supported: [],
    };
    const iconName =
      `${extensionSettings.defaultExtensionPrefix}${custom.default.file.icon}` +
      `${extensionSettings.iconSuffix}.${custom.default.file.format}`;

    try {
      fs.writeFileSync(path.join(extensionSettings.customIconFolderName, iconName), '');

      const json = mergeConfig(custom, fileExtensions, null, folderExtensions, iconGenerator);
      const def = json.iconDefinitions._file;
      expect(def).exist;
      expect(def.iconPath).exist;
      expect(def.iconPath).contain(iconName);
      expect(def.iconPath).contain(extensionSettings.customIconFolderName);
    } finally {
      fs.unlinkSync(path.join(extensionSettings.customIconFolderName, iconName));
    }
  });

  it('ensures default folder icons can be overriden', function () {
    const custom: IFolderCollection = {
      default: {
        folder: { icon: 'customIcon', format: 'svg' },
      },
      supported: [],
    };
    const iconName =
      `${extensionSettings.defaultExtensionPrefix}${custom.default.folder.icon}` +
      `${extensionSettings.iconSuffix}.${custom.default.folder.format}`;
    const iconNameOpen =
      `${extensionSettings.defaultExtensionPrefix}${custom.default.folder.icon}_opened` +
      `${extensionSettings.iconSuffix}.${custom.default.folder.format}`;

    try {
      fs.writeFileSync(path.join(extensionSettings.customIconFolderName, iconName), '');
      fs.writeFileSync(path.join(extensionSettings.customIconFolderName, iconNameOpen), '');

      const json = mergeConfig(null, fileExtensions, custom, folderExtensions, iconGenerator);
      const def = json.iconDefinitions._folder;
      const defOpen = json.iconDefinitions._folder_open;
      expect(def).exist;
      expect(defOpen).exist;
      expect(def.iconPath).exist;
      expect(defOpen.iconPath).exist;
      expect(def.iconPath).contain(iconName);
      expect(defOpen.iconPath).contain(iconNameOpen);
      expect(def.iconPath).contain(extensionSettings.customIconFolderName);
      expect(defOpen.iconPath).contain(extensionSettings.customIconFolderName);
    } finally {
      fs.unlinkSync(path.join(extensionSettings.customIconFolderName, iconName));
      fs.unlinkSync(path.join(extensionSettings.customIconFolderName, iconNameOpen));
    }
  });

  it('ensures default file icons can be disabled', function () {
    const custom: IFileCollection = {
      default: {
        file: { icon: '', format: 'svg', disabled: true },
      },
      supported: [],
    };
    const json = mergeConfig(custom, fileExtensions, null, folderExtensions, iconGenerator);
    const def = json.iconDefinitions._file;
    expect(def).exist;
    expect(def.iconPath).to.be.empty;
  });

  it('ensures default folder icons can be disabled', function () {
    const custom: IFolderCollection = {
      default: {
        folder: { icon: 'customIcon', format: 'svg', disabled: true },
      },
      supported: [],
    };
    const json = mergeConfig(null, fileExtensions, custom, folderExtensions, iconGenerator);
    const def = json.iconDefinitions._folder;
    const defOpen = json.iconDefinitions._folder_open;
    expect(def).exist;
    expect(defOpen).exist;
    expect(def.iconPath).to.be.empty;
    expect(defOpen.iconPath).to.be.empty;
  });

});
