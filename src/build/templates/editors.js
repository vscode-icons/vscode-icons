/* eslint-disable  no-underscore-dangle, vars-on-top, max-len*/
/* global vsicons */
var editors = function (context) {
  if (!context.context.controller.instantiationService) return ['monaco-tree-row'];
  var c = context.context.controller.instantiationService._services.get('configurationService');
  var cf = c ? c.getConfiguration() : null;
  var element = context.model.getElement();
  var name = element.editor ? element.editor.name : null;
  if ((!name) ||
  (cf && cf.vsicons && cf.vsicons.hideIconsEditors)) {
    return ['monaco-tree-row'];
  }
  var icon = vsicons.iconResolve(cf, name, '-file-icon file-icon monaco-tree-row explorer-item editors');
  return [icon];
};

module.exports = editors.toString();
