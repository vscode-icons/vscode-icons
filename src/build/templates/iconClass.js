/* eslint-disable  no-underscore-dangle*/
/* global vsicons */
var iconClass = function (context, fileInfo) {
  var c = context.actionProvider.registry.instantiationService._services.get('configurationService');
  var cf = c ? c.getConfiguration() : null;
  var fileclass = '-file-icon file-icon';
  var hideFolder = cf && cf.vsicons && cf.vsicons.hideFolders;
  var result;
  if (fileInfo.isDirectory) return hideFolder ? 'folder-no-icon' : 'folder-icon';
  result = vsicons.iconResolve(cf, fileInfo.name, fileclass);
  return result;
};

module.exports = iconClass.toString();
