module.exports =
'/* eslint-disable */\n module.exports = { ' +
'iconClassReplace: \'this.fileIconClasses((n||i).resource.fsPath).' +
  'concat(vsicons.iconClass(this, n||i))\', ' +
'iconClass2Replace: \'e.fileIconClasses(r).' +
  'concat(vsicons.iconClass(e, r, true))\', ' +
'iconClass3Replace: \'this.folderIconClasses((n||i).resource.fsPath).' +
  'concat(vsicons.iconClass(this, n||i))\', ' +
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

