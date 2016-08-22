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
  var fileclass = '-file-icon file-icon';
  var hideFolder = cf && cf.vsicons && cf.vsicons.hideFolders;

  if (fileInfo.isDirectory) return hideFolder ? 'folder-no-icon' : 'folder-icon';
  if (!fileInfo.name) return 'default-file-icon file-icon';
  result = vsicons.iconResolve(cf, fileInfo.name, fileclass);
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
