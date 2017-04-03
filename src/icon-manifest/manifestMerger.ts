import * as _ from 'lodash';
import * as models from '../models';

export function mergeConfig(
  customFiles: models.IFileCollection,
  supportedFiles: models.IFileCollection,
  customFolders: models.IFolderCollection,
  supportedFolders: models.IFolderCollection,
  iconGenerator: models.IIconGenerator): models.IIconSchema {

  const dFiles = customFiles ? customFiles.default : null;
  const dFolders = customFolders ? customFolders.default : null;
  const sFiles = customFiles ? customFiles.supported : null;
  const sFolders = customFolders ? customFolders.supported : null;
  const files: models.IFileCollection = {
    default: mergeDefaultFiles(dFiles, supportedFiles.default),
    supported: mergeSupported(sFiles, supportedFiles.supported),
  };

  const folders: models.IFolderCollection = {
    default: mergeDefaultFolders(dFolders, supportedFolders.default),
    supported: mergeSupported(sFolders, supportedFolders.supported),
  };

  return iconGenerator.generateJson(files, folders);
}

function mergeDefaultFiles(custom: models.IFileDefault, supported: models.IFileDefault): models.IFileDefault {
  if (!custom) { return supported; }
  return {
    file: custom.file || supported.file,
    file_light: custom.file_light || supported.file_light,
  };
}

function mergeDefaultFolders(custom: models.IFolderDefault, supported: models.IFolderDefault): models.IFolderDefault {
  if (!custom) { return supported; }
  return {
    folder: custom.folder || supported.folder,
    folder_light: custom.folder_light || supported.folder_light,
  };
}

function mergeSupported(
  custom: models.IExtension[],
  supported: models.IExtension[]): models.IExtension[] {
  if (!custom || !custom.length) { return supported; }
  // start the merge operation
  let final: models.IExtension[] = _.cloneDeep(supported);
  custom.forEach(file => {
    const officialFiles = final.filter(x => x.icon === file.icon);
    if (officialFiles.length) {
      // existing icon
      // checking if the icon is disabled
      if (file.disabled != null) {
        officialFiles.forEach(x => x.disabled = file.disabled);
        if (file.disabled) { return; }
      }
      file.format = officialFiles[0].format;
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
        });
    }
    // remove overrides
    final = final.filter(x => x.icon !== file.overrides);
    // check if file extensions are already in use and remove them
    if (!file.extensions) { file.extensions = []; }
    file.extensions.forEach(ext => {
      final
        .filter(x => x.extensions.find(y => y === ext))
        .forEach(x => _.remove(x.extensions, ext));
    });
    final.push(file);
  });
  return final;
}

export function toggleAngularPreset(
  disable: boolean,
  files: models.IFileCollection): models.IFileCollection {
  const icons = files.supported
    .filter(x => x.icon.startsWith('ng_') && (x.icon.endsWith('_js') || x.icon.endsWith('_ts')))
    .map(x => x.icon);
  return togglePreset(disable, icons, files);
}

export function toggleOfficialIconsPreset(
  disable: boolean,
  customFiles: models.IFileCollection,
  officialIcons: string[],
  defaultIcons: string[]): models.IFileCollection {
  const temp = togglePreset(disable, officialIcons, customFiles);
  return togglePreset(!disable, defaultIcons, temp);
}

export function toggleHideFoldersPreset(
  disable: boolean,
  folders: models.IFolderCollection): models.IFolderCollection {
  const folderIcons = folders.supported.filter(x => !x.disabled).map(x => x.icon);
  const collection = togglePreset<models.IFolderCollection>(disable, folderIcons, folders);
  if (folders.default.folder) {
    collection.default.folder.disabled = disable;
  } else {
    collection.default.folder = { icon: 'folder', format: 0, disabled: disable };
  }
  if (folders.default.folder_light) {
    collection.default.folder_light.disabled = disable;
  } else {
    collection.default.folder_light = { icon: 'folder_light', format: 0, disabled: disable };
  }
  return collection;
}

export function toggleFoldersAllDefaultIconPreset(
  disable: boolean,
  folders: models.IFolderCollection): models.IFolderCollection {
  const folderIcons = folders.supported.filter(x => !x.disabled).map(x => x.icon);
  const collection = togglePreset<models.IFolderCollection>(disable, folderIcons, folders);
  if (folders.default.folder) {
    collection.default.folder.disabled = false;
  } else {
    collection.default.folder = { icon: 'folder', format: 0, disabled: false };
  }
  if (folders.default.folder_light) {
    collection.default.folder_light.disabled = false;
  } else {
    collection.default.folder_light = { icon: 'folder_light', format: 0, disabled: false };
  }
  return collection;
}

// Note: generics and union types don't work very well :(
// that's why we had to use IExtensionCollection<> instead of T
function togglePreset<T extends models.IFileCollection | models.IFolderCollection>(
  disable: boolean,
  icons: string[],
  customItems: models.IExtensionCollection<models.IExtension>): T {
  const workingCopy = _.cloneDeep(customItems);
  icons.forEach(icon => {
    const existing = workingCopy.supported.filter(x => x.icon === icon);
    if (!existing.length) {
      workingCopy.supported.push({ icon, extensions: [], format: models.FileFormat.svg, disabled: disable });
    } else {
      existing.forEach(x => { x.disabled = disable; });
    }
  });
  return workingCopy as T;
}
