// tslint:disable only-arrow-functions
import { expect } from 'chai';
import { mergeConfig } from '../src/merger';
import { extensions as fileExtensions } from './support/supportedExtensions';
import { extensions as folderExtensions } from './support/supportedFolders';
import { IExtensionCollection, IFileExtension, FileFormat, IFolderExtension } from '../src/models/IExtension';
import { vscode } from '../src/utils';

describe('FileExtensions: merging configuration documents', function () {

  it('ensures new extensions are added to existing file extension and respect the extension type', function () {
    const custom: IExtensionCollection<IFileExtension> = {
      supported: [
        { icon: 'actionscript', extensions: ['as2'], format: 'svg' },
      ],
    };

    const json = mergeConfig(custom, fileExtensions, null, folderExtensions, vscode);
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

    const json = mergeConfig(custom, fileExtensions, null, folderExtensions, vscode);
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

    const json = mergeConfig(custom, fileExtensions, null, folderExtensions, vscode);
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
    const json = mergeConfig(custom, fileExtensions, null, folderExtensions, vscode);
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
    const json = mergeConfig(custom, fileExtensions, null, folderExtensions, vscode);
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
    const json = mergeConfig(custom, fileExtensions, null, folderExtensions, vscode);
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
    const json = mergeConfig(custom, fileExtensions, null, folderExtensions, vscode);
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
    const json = mergeConfig(custom, fileExtensions, null, folderExtensions, vscode);
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
    const json = mergeConfig(custom, fileExtensions, null, folderExtensions, vscode);
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

    const json = mergeConfig(null, fileExtensions, custom, folderExtensions, vscode);
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

    const json = mergeConfig(null, fileExtensions, custom, folderExtensions, vscode);
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

    const json = mergeConfig(null, fileExtensions, custom, folderExtensions, vscode);
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
    const json = mergeConfig(null, fileExtensions, custom, folderExtensions, vscode);
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
    const json = mergeConfig(null, fileExtensions, custom, folderExtensions, vscode);
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
    const json = mergeConfig(null, fileExtensions, custom, folderExtensions, vscode);
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
    const json = mergeConfig(null, fileExtensions, custom, folderExtensions, vscode);
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
    const json = mergeConfig(null, fileExtensions, custom, folderExtensions, vscode);
    const icon = json.iconDefinitions['_fd_custom_icon'];
    expect(icon).exist;
    expect(icon.iconPath.indexOf('robertohuertasm.vscode-icons.custom-icons')).to.be.greaterThan(-1);
    expect(json.folderNames['custom']).equals('_fd_custom_icon');
    expect(json.folderNamesExpanded['custom']).equals('_fd_custom_icon_open');
  });

});
