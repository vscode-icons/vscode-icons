import * as _ from 'lodash';
import * as path from 'path';
import { generateJson, persist } from '../../build-tools/iconGenerator';
import { IExtensionCollection, IFileExtension, IFolderExtension } from '../../models/IExtension';
import { extensions } from '../../build-tools/supportedExtensions';
import { IIconSchema } from '../../models/IIconSchema';
import { isCodeContext } from '../utils/context';

// TODO set this in settings/config
const outDir = isCodeContext() ? path.join(__dirname, '../../../../icons') : './out/src/extension';

export function mergeConfig(
  customFiles: IExtensionCollection<IFileExtension>,
  supportedFiles: IExtensionCollection<IFileExtension>,
  customFolders: IExtensionCollection<IFolderExtension>,
  supportedFolders: IExtensionCollection<IFolderExtension>): IIconSchema {

  const files = mergeFiles(customFiles, supportedFiles);
  const folders = mergeFiles(customFolders, supportedFolders);
  const json = generateJson(outDir, files, folders);
  persist('icons.json', outDir, json); // TODO remove
  return json;
}

function mergeFiles(
  custom: IExtensionCollection<IFileExtension>,
  supported: IExtensionCollection<IFileExtension>): IExtensionCollection<IFileExtension> {
  if (!custom || !custom.supported || !custom.supported.length) { return supported; }
  // start the merge operation
  let final: IFileExtension[] = supported.supported.concat();
  custom.supported.forEach(file => {
    const officialFiles = final.filter(x => x.icon === file.icon);
    if (officialFiles.length) {
      // checking if the icon is disabled
      if (file.disabled !== null || file.disabled !== undefined) {
        officialFiles.forEach(x => { x.disabled = file.disabled; });
        if (file.disabled) { return; }
      }
      file.svg = officialFiles[0].svg;
      file._custom = true;
    }
    // extends? => copy the icon name to the existing ones.
    // override? => remove overriden extension.
    // check for exentensions in use.
    // we'll add a new node
    if (file.extends) {
      final
        .filter(x => x.icon === file.extends)
        .forEach(x => {
          x.icon = file.icon;
          x._custom = true;
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

function mergeFolders(
  custom: IExtensionCollection<IFolderExtension>,
  supported: IExtensionCollection<IFolderExtension>): IExtensionCollection<IFolderExtension> {
  if (!custom || !custom.supported || !custom.supported.length) { return supported; }
  return supported;
}
