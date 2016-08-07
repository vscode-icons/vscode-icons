/* eslint-disable max-len */
var mustache = require('mustache');
var _ = require('underscore');
var extensions = require('./supportedExtensions').extensions;
var fs = require('fs');
var ncp = require('ncp').ncp;
var tempJs = require('./jsTemplate');

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

var jsTemplate =
  't.prototype.iconClass = '
  + tempJs
  .toString()
  .replace(/'/gi, '"')
  .replace(/[\n\r]/gi, '')
  .replace(/\\/gi, '\\\\')
  .replace(/\["#exts"\]/gi, '{{{allExtensions}}}')
  .replace(/\["#specialExt"\]/gi, '{{{specialExtensions}}}')
  .replace(/\["#special"\]/gi, '{{{specialSupportedExtensions}}}');

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

