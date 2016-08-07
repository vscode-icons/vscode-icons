/* eslint-disable max-len */
var mustache = require('mustache');
var _ = require('underscore');
var extensions = require('./supportedExtensions').extensions;
var fs = require('fs');
var ncp = require('ncp').ncp;
var iconClass = require('./templates/iconClass');
var cssTemplate = require('./templates/css');

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
  + iconClass
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

