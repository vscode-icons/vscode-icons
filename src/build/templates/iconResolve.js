/* eslint-disable  no-underscore-dangle, vars-on-top, max-len*/
/* global vsicons */
var iconResolve = function (config, filename, classname, isFolder) {
  var assoc = vsicons.checkAssociations(config, filename, classname);
  if (assoc) return assoc;

  var dot = filename.lastIndexOf('.');
  var e = filename.substring(dot + 1).toLowerCase();

  var exts = isFolder ? vsicons.folderExtensions : vsicons.extensions;
  var specialExt = isFolder ? vsicons.folderSpecialExtensions : vsicons.specialExtensions;

  function sn(ext) {
    var res = ext.replace(/\./g, '_');
    if (/^\d/.test(res)) res = 'n' + res;
    return res + classname;
  }

  var spext = specialExt[e];
  if (spext) {
    var f = filename.substring(0, dot).toLowerCase();
    for (var kk = 0, len = spext.length; kk < len; kk++) {
      var sp = spext[kk];
      if (sp === f) return sn(sp);
      var r = new RegExp(sp.replace(/\./gi, '\\.') + '$', 'gi');
      if (r.test(filename)) return sn(sp);
    }
  }

  if (exts.indexOf(e) >= 0) {
    return sn(e);
  }

  return 'default' + classname;
};

module.exports = iconResolve.toString();
