/* eslint-disable max-len */
var mustache = require('mustache');
var _ = require('underscore');
var extensions = require('./supportedExtensions').extensions;
var fs = require('fs');
var ncp = require('ncp').ncp;
var iconClassTemplate = require('./templates/iconClass');
var checkAssociationsTemplate = require('./templates/checkAssociations');
var iconResolveTemplate = require('./templates/iconResolve');
var tabLabelTemplate = require('./templates/tabLabel');
var finalTemplate = require('./templates/final');
var cssTemplate = require('./templates/css');

var css = mustache.render(cssTemplate, extensions);

var allExtensions = _.flatten(_.map(extensions.supported, function (x) { return x.extensions; }));
var specialExtensions = _.uniq(_.filter(extensions.supported, function (x) { return x.special; }).map(function (x) { return x.special; }));
var specialSupportedExtensions = _.flatten(_.filter(extensions.supported, function (x) { return x.special; }).map(function (x) { return x.extensions; }));

var arrToStr = function (arr) {
  return JSON.stringify(arr);
};

var jsView = {
  extensions: arrToStr(allExtensions),
  specialExtensions: arrToStr(specialExtensions),
  specialSupportedExtensions: arrToStr(specialSupportedExtensions)
};

var parse = function (st) {
  return st
         .replace(/'/gi, '"')
         .replace(/[\n\r]/gi, '')
         .replace(/\\/gi, '\\\\');
};

var final = mustache.render(finalTemplate, {
  iconClass: parse(iconClassTemplate),
  checkAssociations: parse(checkAssociationsTemplate),
  tabLabel: parse(tabLabelTemplate),
  iconResolve: parse(iconResolveTemplate),
  css: css,
  extensions: parse(jsView.extensions),
  specialExtensions: parse(jsView.specialExtensions),
  specialSupportedExtensions: parse(jsView.specialSupportedExtensions)
});

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

