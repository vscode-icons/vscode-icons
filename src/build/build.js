var mustache = require('mustache');
var _ = require('underscore');
var extensions = require('./supportedExtensions').extensions;
var fs = require('fs');
var ncp = require('ncp').ncp;

var cssTemplate =
  '.monaco-tree-row .content .sub-content .explorer-item.folder-icon {' +
    'padding-left: 22px;' +
    'background: url(parts/files/browser/media/icons/Folder_inverse.svg) 1px 4px no-repeat;' +
  '}'
  +
  '.monaco-tree-row.expanded .content .sub-content .explorer-item.folder-icon { ' +
    'padding-left: 22px;' +
    'background: url(parts/files/browser/media/icons/Folder_opened.svg) 1px 4px no-repeat;' +
    'background-size: 16px;' +
  '}'
  +
  '.explorer-item.default-file-icon {' +
    'padding-left:22px;' +
    'adding-left:22px;background:url(parts/files/browser/media/icons/File.svg) 1px 3px no-repeat;' +
    'background-size: 16px;' +
  '}' +
  '.explorer-item.file-icon {' +
    'padding-left:22px;' +
    'background-size: 16px !important;' +
  '}' +
  '{{#supported}} ' +
    '{{#extensions}}' +
      '.explorer-item.{{parse}}-file-icon { ' +
      'background: url(parts/files/browser/media/icons/file_type_{{icon}}@2x.png) 1px 4px no-repeat;' +
    '}' +
   '{{/extensions}}' +
  '{{/supported}}';
  
var css = mustache.render(cssTemplate, extensions);

var allExtensions = _.flatten(_.map(extensions.supported, function(x){ return x.extensions;}));

var specialExtensions = _.uniq(_.filter(extensions.supported, function(x) { return x.special;}).map(function(x) {return x.special;}));

var specialSupportedExtensions = _.flatten(_.filter(extensions.supported, function(x) { return x.special;}).map(function(x) {return x.extensions;}));

function arrToStr(arr){
  return JSON.stringify(arr);
}

var jsView = {
  allExtensions: arrToStr(allExtensions),
  specialExtensions: arrToStr(specialExtensions),
  specialSupportedExtensions : arrToStr(specialSupportedExtensions)
};

var jsTemplate = 
't.prototype.iconClass = function (s) {' +
  'if (s.isDirectory) return "folder-icon";' +
  'var fileclass = "-file-icon file-icon";' +
  'var dot = s.name.lastIndexOf(".");' +
  'var e = s.name.substring(dot + 1).toLowerCase();' +
  'var exts = {{{allExtensions}}};' +
  'var specialExt = {{{specialExtensions}}};' +
  
  'if (specialExt.indexOf(e) >= 0) {' +
    'var special = {{{specialSupportedExtensions}}};' +
    'var f = s.name.substring(0, dot);' +
    'if(special.indexOf(f) >=0) return f + fileclass;' +
  '}' +
  
  'if(exts.indexOf(e) >= 0) {' +
    'if(/^\\\\d/.test(e)) e = "n" + e;' +
    'return e + fileclass;' +
    '}else{' +
    'return "default" + fileclass;'+
    '}' +
'}';

var js = mustache.render(jsTemplate, jsView);

var finalTemplate = 
'module.exports = { js: \'{{{js}}}\', css: \'{{{css}}}\' };';

var final = mustache.render(finalTemplate, {js: js, css: css});

//writing the files
fs.writeFileSync('./src/dev/replacements.js', final);
console.log('File with replacemnts successfully created!');

//moving to dist
ncp.limit = 16;
ncp('./src/dev', './dist', function (err) {
 if (err) {
   return console.error(err);
 }
 console.log('Build completed!');
});

