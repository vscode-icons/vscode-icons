module.exports =
'/* eslint-disable */\n module.exports = { ' +
'iconClassReplace: \'t.prototype.iconClass = ' +
  'function(s) { return vsicons.iconClass(this, s); }\', ' +
'iconClassInsidersReplace: \'this.fileIconClasses(n.resource.fsPath).' +
  'concat(vsicons.iconClass(this, n, true))\', ' +
'iconClassInsiders2Replace: \'e.fileIconClasses(r).' +
  'concat(vsicons.iconClass(e, r, true, true))\', ' +
'iconClassInsiders3Replace: \'this.folderIconClasses(n.resource.fsPath).' +
  'concat(vsicons.iconClass(this, n, true))\', ' +
'tabLabelReplace: \'vsicons.tabLabel(r)\', ' +
'editorsReplace: \'vsicons.editors(this)\', ' +
'vsicons: \'vsicons = {' +
  'iconCache: {{{iconCache}}}, ' +
  'iconClass: {{{iconClass}}}, ' +
  'tabLabel: {{{tabLabel}}}, ' +
  'editors: {{{editors}}}, ' +
  'checkAssociations: {{{checkAssociations}}}, ' +
  'checkAssociations: {{{checkAssociations}}}, ' +
  'iconResolve: {{{iconResolve}}}, ' +
  'extensions: {{{extensions}}}, ' +
  'specialExtensions: {{{specialExtensions}}}, ' +
  'folderExtensions: {{{folderExtensions}}}, ' +
  'folderSpecialExtensions: {{{folderSpecialExtensions}}}, ' +
'};\',' +
'css: \'{{{css}}}\' };';

