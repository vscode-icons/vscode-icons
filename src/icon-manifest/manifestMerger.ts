import * as _ from 'lodash';
import * as path from 'path';
import { IconGenerator } from './iconGenerator';
import { extensions } from './supportedExtensions';
import {
  IExtensionCollection,
  IFileExtension,
  IFolderExtension,
  IExtension,
  FileFormat,
  IIconSchema,
  IIconGenerator,
} from '../models';

export function mergeConfig(
  customFiles: IExtensionCollection<IFileExtension>,
  supportedFiles: IExtensionCollection<IFileExtension>,
  customFolders: IExtensionCollection<IFolderExtension>,
  supportedFolders: IExtensionCollection<IFolderExtension>,
  iconGenerator: IIconGenerator): IIconSchema {

  const files = mergeItems(customFiles, supportedFiles);
  const folders = mergeItems(customFolders, supportedFolders);
  const json = iconGenerator.generateJson(files, folders);
  // iconGenerator.persist('icons2.json', json);
  return json;
}

function mergeItems(
  custom: IExtensionCollection<IExtension>,
  supported: IExtensionCollection<IExtension>): IExtensionCollection<IExtension> {
  if (!custom || !custom.supported || !custom.supported.length) { return supported; }
  // start the merge operation
  let final: IExtension[] = _.cloneDeep(supported.supported);
  custom.supported.forEach(file => {
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
  return { supported: final };
}

export function toggleAngular2Preset(
  disable: boolean,
  customFiles: IExtensionCollection<IFileExtension>): IExtensionCollection<IFileExtension> {
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
  customFiles: IExtensionCollection<IFileExtension>): IExtensionCollection<IFileExtension> {
  const temp = togglePreset(disable, ['typescript_official'], customFiles);
  return togglePreset(!disable, ['typescript'], temp);
}

export function toggleJavascriptOfficialPreset(
  disable: boolean,
  customFiles: IExtensionCollection<IFileExtension>): IExtensionCollection<IFileExtension> {
  const temp = togglePreset(disable, ['js_official'], customFiles);
  return togglePreset(!disable, ['js'], temp);
}

function togglePreset(
  disable: boolean,
  icons: string[],
  customFiles: IExtensionCollection<IFileExtension>): IExtensionCollection<IFileExtension> {
  const workingCopy = _.cloneDeep(customFiles);
  icons.forEach(icon => {
    const existing = workingCopy.supported.filter(x => x.icon === icon);
    if (!existing.length) {
      workingCopy.supported.push({ icon, extensions: [], format: FileFormat.svg, disabled: disable });
    } else {
      existing.forEach(x => { x.disabled = disable; });
    }
  });
  return workingCopy;
}
