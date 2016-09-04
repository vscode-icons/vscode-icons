
var checkAssociations = function checkAssociations(config, filename, additionalClass) {
  var ascs;
  var asc;
  var rx;
  var i = 0;
  var len;

  if (!config ||
      !config.vsicons ||
      !config.vsicons.useFileAssociations ||
      !config.vsicons.associations) return null;
  ascs = config.vsicons.associations;
  for (len = ascs.length; i < len; i++) {
    asc = ascs[i];
    rx = new RegExp(asc[0], 'gi');
    if (rx.test(filename)) {
      var s = asc[1].replace(/\./g, '_');
      if ((/^\d/).test(s)) s = 'n' + s;
      return s + (additionalClass || '');
    }
  }
  return null;
};

module.exports = checkAssociations.toString();
