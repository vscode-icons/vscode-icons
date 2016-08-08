
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
      return asc[1] + (additionalClass || '');
    }
  }
  return null;
};

module.exports = checkAssociations.toString();
