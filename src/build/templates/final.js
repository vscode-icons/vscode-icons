module.exports =
'/* eslint-disable */\n module.exports = { ' +
'iconClassReplace: \'t.prototype.iconClass = ' +
  'function(s) { return vsicons.iconClass(this, s); }\', ' +
'tabLabelReplace: \'vsicons.tabLabel(r)\', ' +
'editorsReplace: \'vsicons.editors(this)\', ' +
'vsicons: \'vsicons = {' +
  'iconClass: {{{iconClass}}}, ' +
  'tabLabel: {{{tabLabel}}}, ' +
  'editors: {{{editors}}}, ' +
  'checkAssociations: {{{checkAssociations}}}, ' +
  'checkAssociations: {{{checkAssociations}}}, ' +
  'iconResolve: {{{iconResolve}}}, ' +
  'extensions: {{{extensions}}}, ' +
  'specialExtensions: {{{specialExtensions}}} ' +
'};\',' +
'css: \'{{{css}}}\' };';

