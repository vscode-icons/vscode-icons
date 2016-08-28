/* eslint-disable  no-underscore-dangle*/
/* global vsicons */
var iconClass = function (context, fileInfo, isInsiders, seekCache) {
  var result;
  if (isInsiders && seekCache) {
    result = vsicons.iconCache[fileInfo];
    if (result) return result;
  }

  var c = context.actionProvider.registry.instantiationService
    ._services.get('configurationService');
  var cf = c ? c.getConfiguration() : null;
  var className = fileInfo.isDirectory ? '-folder-icon folder-icon' : '-file-icon file-icon';
  var hideFolder = cf && cf.vsicons && cf.vsicons.hideFolders;
  var hideCustomFolderIcons = cf && cf.vsicons && cf.vsicons.hideCustomFolderIcons;

  if (fileInfo.isDirectory) {
    if (hideFolder) return 'folder-no-icon';
    if (hideCustomFolderIcons) return 'folder-icon';
  }
  if (!fileInfo.name) return 'default-file-icon file-icon';
  result = vsicons.iconResolve(cf, fileInfo.name, className, fileInfo.isDirectory);
  if (isInsiders) {
    var resArray = result.split(' ');
    if (!seekCache) {
      vsicons.iconCache[fileInfo.resource.fsPath] = resArray;
    }
    return resArray;
  }
  return result;
};

module.exports = iconClass.toString();
