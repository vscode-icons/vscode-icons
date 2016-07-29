/* eslint-disable max-len */
var mustache = require('mustache');
var _ = require('underscore');
var extensions = require('./supportedExtensions').extensions;
var fs = require('fs');
var ncp = require('ncp').ncp;

var cssTemplate =
  '.monaco-tree-row .content .sub-content .explorer-item.folder-icon {' +
    'padding-left: 22px;' +
    'background: url(browser/parts/editor/media/icons/Folder_inverse.svg) 1px 4px no-repeat;' +
  '}'
  +
  '.monaco-tree-row.expanded .content .sub-content .explorer-item.folder-icon { ' +
    'padding-left: 22px;' +
    'background: url(browser/parts/editor/media/icons/Folder_opened.svg) 1px 4px no-repeat;' +
    'background-size: 16px;' +
  '}'
  +
  '.explorer-item.default-file-icon {' +
    'padding-left:22px;' +
    'adding-left:22px;background:url(browser/parts/editor/media/icons/File.svg) 1px 3px no-repeat;' +
    'background-size: 16px;' +
  '}' +
  '.explorer-item.file-icon {' +
    'padding-left:22px;' +
    'background-size: 16px !important;' +
  '}' +
  '{{#supported}} ' +
    '{{#extensions}}' +
      '.explorer-item.{{parse}}-file-icon { ' +
      'background: url(browser/parts/editor/media/icons/file_type_{{icon}}@2x.png) 1px 4px no-repeat;' +
    '}' +
   '{{/extensions}}' +
  '{{/supported}}';

var css = mustache.render(cssTemplate, extensions);

var allExtensions = _.flatten(_.map(extensions.supported, function (x) { return x.extensions; }));

var specialExtensions = _.uniq(_.filter(extensions.supported, function (x) { return x.special; }).map(function (x) { return x.special; }));

var specialSupportedExtensions = _.flatten(_.filter(extensions.supported, function (x) { return x.special; }).map(function (x) { return x.extensions; }));

var arrToStr = function (arr) {
  return JSON.stringify(arr);
};

var jsView = {
  allExtensions: arrToStr(allExtensions),
  specialExtensions: arrToStr(specialExtensions),
  specialSupportedExtensions: arrToStr(specialSupportedExtensions)
};

// var sv = this.state.actionProvider.state._actionProvider.registry.instantiationService._services._entries[3][1]
// var sv = this.actionProvider.registry.instantiationService._services.get('configurationService');
// sv.getConfiguration().vsicons
// sv.loadConfiguration().then(function(a) { console.log(a); });
// tabs: 3 different approaches. -> o.contextService.options.globalSettings.settings.vsicons...
// or o.instantiationService._services.get("configurationService")
// use global cache: cache icon result in a global object and get it from tab-label function.
// Replace "tab-label" for a function call accepting the o || r (r insiders, o code)

// TODO CACHE EXTENSIONS

var jsTemplate =
  't.prototype.iconClass = function (s) {' +
  'var c = this.actionProvider.registry.instantiationService._services.get("configurationService");' +
  'var cf = c ? c.getConfiguration() : null;' +
  'var hideFolder = cf && cf.vsicons && cf.vsicons.hideFolders;' +
  'if (s.isDirectory) return hideFolder ? "folder-no-icon": "folder-icon";' +
  'var fileclass = "-file-icon file-icon";' +
  'var dot = s.name.lastIndexOf(".");' +
  'var e = s.name.substring(dot + 1).toLowerCase();' +
  'if (window.extensionCache) {' +
    'var ch = window.extensionCache[e];' +
    'if (ch) return ch;' +
  '}' +
  'var exts = {{{allExtensions}}};' +
  'var specialExt = {{{specialExtensions}}};' +

  'function sn(ext){' +
    'var fa = (cf && cf.vsicons && cf.vsicons.useFileAssociations && cf.files && cf.files.associations) ? cf.files.associations["*." + ext] : ext;' +
    'ext =  fa || ext;' +
    'var res = ext.replace(/\\\\./g,"_");' +
    'if(/^\\\\d/.test(res)) res = "n" + res;' +
    'window.extensionCache = window.extensionCache || {};' +
    'window.extensionCache[e] = res + fileclass;' +
    'return res + fileclass;' +
  '}' +

  'if (specialExt.indexOf(e) >= 0) {' +
    'var special = {{{specialSupportedExtensions}}};' +
    'var f = s.name.substring(0, dot).toLowerCase();' +
    'for(var kk=0, len=special.length; kk<len; kk++) {' +
      'var sp = special[kk];' +
      'if(sp===f) return sn(sp);' +
      'var r = new RegExp(sp.replace(/\\\\./g,"\\\\\\\\.") + "$");' +
      'if(r.test(s.name.toLowerCase())) return sn(sp);' +
    '}' +
  '}' +

  'if(exts.indexOf(e) >= 0) {' +
    'return sn(e);' +
  '}else{' +
    'return "default" + fileclass;' +
  '}' +
'}';

var js = mustache.render(jsTemplate, jsView);

var finalTemplate =
'/* eslint-disable */\n module.exports = { js: \'{{{js}}}\', css: \'{{{css}}}\' };';

var final = mustache.render(finalTemplate, { js: js, css: css });

// writing the files
fs.writeFileSync('./src/dev/replacements.js', final);
console.log('File with replacements successfully created!'); // eslint-disable-line

// moving to dist
ncp.limit = 16;
ncp('./src/dev', './dist', function (err) {
  if (err) {
    console.error(err); // eslint-disable-line
    return;
  }
  console.log('Build completed!'); // eslint-disable-line
});

