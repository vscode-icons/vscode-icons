/* eslint-disable  no-underscore-dangle, vars-on-top, max-len*/
/* global vsicons */
var tabLabel = function (context) {
  var c = context.instantiationService._services.get('configurationService');
  var cf = c ? c.getConfiguration() : null;
  if (cf && cf.vsicons && cf.vsicons.hideIconsInTabs) return 'tab-label';
  var result;
  result = vsicons.iconResolve(cf, context.name, '-file-icon file-icon tab-label explorer-item');
  return result;
};

module.exports = tabLabel.toString();
