// tslint:disable only-arrow-functions
import { expect } from 'chai';
import { mergeConfig } from '../src/extension/merger';
import { extensions as fileExtensions } from './support/supportedExtensions';
import { extensions as folderExtensions } from './support/supportedFolders';
import { IExtensionCollection, IFileExtension, FileFormat } from '../src/models/IExtension';

describe.only('merging configuration documents', function () {

  it('ensures new extensions are added to existing file extension and respect the extension type', function () {
    const customFileExtensions: IExtensionCollection<IFileExtension> = {
      supported: [
        { icon: 'actionscript', extensions: ['as2'], format: FileFormat.svg},
      ],
    };

    const json = mergeConfig(customFileExtensions, fileExtensions, null, folderExtensions);
    const def = json.iconDefinitions['_f_actionscript'];
    expect(def).not.to.be.null;
    expect(def.iconPath).not.to.be.null;
    expect(def.iconPath.substr(def.iconPath.length - 3, 3)).equal('svg');
  });

  it('ensures overrides removes the specified extension', function () {
    const customFileExtensions: IExtensionCollection<IFileExtension> = {
      supported: [
        { icon: 'actionscript2', extensions: ['as2'], overrides: 'actionscript', format: FileFormat.svg },
      ],
    };

    const json = mergeConfig(customFileExtensions, fileExtensions, null, folderExtensions);
    const overridenPath = json.iconDefinitions['_f_actionscript'];
    const newPath: string = json.iconDefinitions['_f_actionscript2'].iconPath;
    expect(overridenPath).to.be.undefined;
    expect(newPath).not.to.be.null;
  });

  it('ensures extends replaces the extension', function () {
    const customFileExtensions: IExtensionCollection<IFileExtension> = {
      supported: [
        { icon: 'newExt', extensions: ['mynew'], extends: 'actionscript', format: 'png' },
      ],
    };

    const json = mergeConfig(customFileExtensions, fileExtensions, null, folderExtensions);
    const extendedPath = json.iconDefinitions['_f_actionscript'];
    const newPath: string = json.iconDefinitions['_f_newExt'].iconPath;
    expect(extendedPath).to.be.undefined;
    expect(newPath).not.to.be.null;
    expect(json.fileExtensions['as']).equal('_f_newExt');
    expect(json.fileExtensions['mynew']).equal('_f_newExt');
    expect(newPath.substr(newPath.length - 3, 3)).not.equals('svg');
  });

  it('ensures disabled extensions are not included into the manifest', function () {
    const customFileExtensions: IExtensionCollection<IFileExtension> = {
      supported: [
        { icon: 'actionscript', extensions: [], disabled: true },
      ],
    };
    const json = mergeConfig(customFileExtensions, fileExtensions, null, folderExtensions);
    const extendedPath = json.iconDefinitions['_f_actionscript'];
    expect(extendedPath).to.be.undefined;
    expect(json.iconDefinitions['_f_newExt']).to.be.undefined;
  });

});
