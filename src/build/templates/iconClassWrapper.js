/* eslint-disable  no-underscore-dangle*/
/* global vsicons */
var iconClassWrapper = function (context, options, callback) {
  var fileInfo = null;
  for (var index = 0, len = options.length; index < len; index++) {
    var obj = options[index];
    if (obj.resource) {
      fileInfo = obj;
      break;
    }
  }
  if (!fileInfo) throw new Error('vscode-icons error. Submit a Github issue to https://github.com/robertohuertasm/vscode-icons/issues/');
  return callback(fileInfo.resource.fsPath).concat(vsicons.iconClass(context, fileInfo));
};

module.exports = iconClassWrapper.toString();
