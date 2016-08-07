/* eslint-disable  no-underscore-dangle, vars-on-top, max-len, no-undef */

// var sv = this.state.actionProvider.state._actionProvider.registry.instantiationService._services._entries[3][1]
// var sv = this.actionProvider.registry.instantiationService._services.get('configurationService');
// sv.getConfiguration().vsicons
// sv.loadConfiguration().then(function(a) { console.log(a); });
// tabs: 3 different approaches. -> o.contextService.options.globalSettings.settings.vsicons...
// or o.instantiationService._services.get("configurationService")
// use global cache: cache icon result in a global object and get it from tab-label function.
// Replace "tab-label" for a function call accepting the o || r (r insiders, o code)

// TODO CACHE EXTENSIONS

var iconClass = function (s) {
  var c = this.actionProvider.registry.instantiationService._services.get('configurationService');
  var cf = c ? c.getConfiguration() : null;
  var hideFolder = cf && cf.vsicons && cf.vsicons.hideFolders;
  if (s.isDirectory) return hideFolder ? 'folder-no-icon' : 'folder-icon';
  var fileclass = '-file-icon file-icon';
  var dot = s.name.lastIndexOf('.');
  var e = s.name.substring(dot + 1).toLowerCase();
  var exts = ['#exts'];
  var specialExt = ['#specialExt'];

  function sn(ext) {
    var fa = (cf && cf.vsicons && cf.vsicons.useFileAssociations && cf.vsicons.associations) ? cf.vsicons.associations['*.' + ext] : ext;
    var fext = fa || ext;
    var res = fext.replace(/\\./g, '_');
    if (/^\\d/.test(res)) res = 'n' + res;
    return res + fileclass;
  }

  if (specialExt.indexOf(e) >= 0) {
    var special = ['#special'];
    var f = s.name.substring(0, dot).toLowerCase();
    for (var kk = 0, len = special.length; kk < len; kk++) {
      var sp = special[kk];
      if (sp === f) return sn(sp);
      var r = new RegExp(sp.replace(/\\./g, '\\\\.') + '$');
      if (r.test(s.name.toLowerCase())) return sn(sp);
    }
  }
  if (exts.indexOf(e) >= 0) {
    return sn(e);
  }
  return 'default' + fileclass;
};

module.exports = iconClass.toString();
