module.exports =
'/* eslint-disable */\n module.exports = { ' +
'iconClassReplace: \'t.prototype.iconClass = ' +
  'function(s) { return vsicons.iconClass(this, s); }\', ' +
'tabLabelReplace: \'vsicons.tabLabel(r)\', ' +
'vsicons: \'vsicons = {' +
  'iconClass: {{{iconClass}}}, ' +
  'tabLabel: {{{tabLabel}}}, ' +
  'checkAssociations: {{{checkAssociations}}}, ' +
  'iconResolve: {{{iconResolve}}}, ' +
  'extensions: {{{extensions}}}, ' +
  'specialExtensions: {{{specialExtensions}}}, ' +
  'specialSupportedExtensions: {{{specialSupportedExtensions}}}' +
'};\',' +
'css: \'{{{css}}}\' };';

