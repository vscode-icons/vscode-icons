/* eslint-disable  no-underscore-dangle, vars-on-top, max-len*/
/* global vsicons */
var iconResolve = function (config, filename, classname) {
  var assoc = vsicons.checkAssociations(config, filename, classname);
  if (assoc) return assoc;

  var dot = filename.lastIndexOf('.');
  var e = filename.substring(dot + 1).toLowerCase();

  var exts = vsicons.extensions;
  var specialExt = vsicons.specialExtensions;

  function sn(ext) {
    var res = ext.replace(/\\./g, '_');
    if (/^\\d/.test(res)) res = 'n' + res;
    return res + classname;
  }

  if (specialExt.indexOf(e) >= 0) {
    var special = vsicons.specialSupportedExtensions;
    var f = filename.substring(0, dot).toLowerCase();
    for (var kk = 0, len = special.length; kk < len; kk++) {
      var sp = special[kk];
      if (sp === f) return sn(sp);
      var r = new RegExp(sp.replace(/\\./g, '\\\\.') + '$');
      if (r.test(filename.toLowerCase())) return sn(sp);
    }
  }

  if (exts.indexOf(e) >= 0) {
    return sn(e);
  }

  return 'default' + classname;
};

module.exports = iconResolve.toString();
