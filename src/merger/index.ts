import * as _ from 'lodash';
import * as path from 'path';
import { IconGenerator } from '../icon-manifest/iconGenerator';
import { IExtensionCollection, IFileExtension, IFolderExtension, IExtension } from '../models/IExtension';
import { extensions } from '../icon-manifest/supportedExtensions';
import { IIconSchema } from '../models/IIconSchema';
import { isCodeContext } from '../utils';
import { IVSCode } from '../models/IVSCode';

// TODO set this in settings/config
const outDir = isCodeContext() ? path.join(__dirname, '../../../icons') : './out/src';

export function mergeConfig(
  customFiles: IExtensionCollection<IFileExtension>,
  supportedFiles: IExtensionCollection<IFileExtension>,
  customFolders: IExtensionCollection<IFolderExtension>,
  supportedFolders: IExtensionCollection<IFolderExtension>,
  vscode: IVSCode): IIconSchema {

  const iconGenerator = new IconGenerator(vscode);
  const files = mergeItems(customFiles, supportedFiles);
  const folders = mergeItems(customFolders, supportedFolders);
  const json = iconGenerator.generateJson(outDir, files, folders);
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
