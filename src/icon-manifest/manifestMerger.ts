import * as _ from 'lodash';
import * as path from 'path';
import { IconGenerator } from './iconGenerator';
import { extensions } from './supportedExtensions';
import { fileFormatToString } from '../utils/index';
import {
  IFileCollection,
  IFolderCollection,
  IExtensionCollection,
  IFileExtension,
  IExtension,
  FileFormat,
  IIconSchema,
  IIconGenerator,
  IFileDefault,
  IFolderDefault,
} from '../models';

export function mergeConfig(
  customFiles: IFileCollection,
  supportedFiles: IFileCollection,
  customFolders: IFolderCollection,
  supportedFolders: IFolderCollection,
  iconGenerator: IIconGenerator): IIconSchema {

  const dFiles = customFiles ? customFiles.default : null;
  const dFolders = customFolders ? customFolders.default : null;
  const sFiles = customFiles ? customFiles.supported : null;
  const sFolders = customFolders ? customFolders.supported : null;
  const files: IFileCollection = {
    default: mergeDefaultFiles(dFiles, supportedFiles.default),
    supported: mergeSupported(sFiles, supportedFiles.supported),
  };

  const folders: IFolderCollection = {
    default: mergeDefaultFolders(dFolders, supportedFolders.default),
    supported: mergeSupported(sFolders, supportedFolders.supported),
  };

  return iconGenerator.generateJson(files, folders);
}

function mergeDefaultFiles(custom: IFileDefault, supported: IFileDefault): IFileDefault {
  if (!custom) { return supported; }
  const res = {
    file: custom.file || supported.file,
    file_light: custom.file_light || supported.file_light,
  };
  if (res.file) {
    res.file._custom = !!custom.file;
  }
  if (res.file_light) {
    res.file_light._custom = !!custom.file_light;
  }
  return res;
}

function mergeDefaultFolders(custom: IFolderDefault, supported: IFolderDefault): IFolderDefault {
  if (!custom) { return supported; }
  const res = {
    folder: custom.folder || supported.folder,
    folder_light: custom.folder_light || supported.folder_light,
  };
  if (res.folder) {
    res.folder._custom = !!custom.folder;
  }
  if (res.folder_light) {
    res.folder_light._custom = !!custom.folder_light;
  }
  return res;
}

function mergeSupported(
  custom: IExtension[],
  supported: IExtension[]): IExtension[] {
  if (!custom || !custom.length) { return supported; }
  // start the merge operation
  let final: IExtension[] = _.cloneDeep(supported);
  custom.forEach(file => {
    const officialFiles = final.filter(x => x.icon === file.icon);
    if (officialFiles.length) {
      // existing icon
      // checking if the icon is disabled
      if (file.disabled !== null || file.disabled !== undefined) {
        officialFiles.forEach(x => { x.disabled = file.disabled; });
        if (file.disabled) { return; }
      }
      file.format = officialFiles[0].format;
    }
    file._custom = !officialFiles.length;
    // extends? => copy the icon name to the existing ones.
    // override? => remove overriden extension.
    // check for exentensions in use.
    // we'll add a new node
    if (file.extends) {
      final
        .filter(x => x.icon === file.extends)
        .forEach(x => {
          x.icon = file.icon;
          x._custom = file._custom;
        });
    }
    // remove overrides
    final = final.filter(x => x.icon !== file.overrides);
    // check if file extensions are already in use and remove them
    file.extensions.forEach(ext => {
      final
        .filter(x => x.extensions.find(y => y === ext))
        .forEach(x => _.remove(x.extensions, ext));
    });
    final.push(file);
  });
  return final;
}

export function toggleAngular2Preset(
  disable: boolean,
  customFiles: IFileCollection): IFileCollection {
  const icons = [
    'ng2_component_ts',
    'ng2_component_js',
    'ng2_directive_ts',
    'ng2_directive_js',
    'ng2_pipe_ts',
    'ng2_pipe_js',
    'ng2_service_ts',
    'ng2_service_js',
    'ng2_module_ts',
    'ng2_module_js',
    'ng2_routing_ts',
    'ng2_routing_js',
  ];
  return togglePreset(disable, icons, customFiles);
}

export function toggleTypescriptOfficialPreset(
  disable: boolean,
  customFiles: IFileCollection): IFileCollection {
  const temp = togglePreset(disable, ['typescript_official'], customFiles);
  return togglePreset(!disable, ['typescript'], temp);
}

export function toggleJavascriptOfficialPreset(
  disable: boolean,
  customFiles: IFileCollection): IFileCollection {
  const temp = togglePreset(disable, ['js_official'], customFiles);
  return togglePreset(!disable, ['js'], temp);
}

export function toggleHideFoldersPreset(
  disable: boolean,
  folders: IFolderCollection): IFolderCollection {
  const folderIcons = folders.supported.map(x => x.icon);
  const collection = togglePreset<IFolderCollection>(disable, folderIcons, folders);
  if (folders.default.folder) {
   collection.default.folder.disabled = disable;
  }
  if (folders.default.folder_light) {
    collection.default.folder_light.disabled = disable;
  }
  return collection;
}

// HACK: generics an union types don't work very well :(
// that's why we had to use IExtensionCollection<> instead of T 
function togglePreset<T extends IFileCollection | IFolderCollection>(
  disable: boolean,
  icons: string[],
  customItems: IExtensionCollection<IExtension>): T {
  const workingCopy = _.cloneDeep(customItems);
  icons.forEach(icon => {
    const existing = workingCopy.supported.filter(x => x.icon === icon);
    if (!existing.length) {
      workingCopy.supported.push({ icon, extensions: [], format: FileFormat.svg, disabled: disable });
    } else {
      existing.forEach(x => { x.disabled = disable; });
    }
  });
  return <T> workingCopy;
}
