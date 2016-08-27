/* eslint-disable max-len */
exports.extensions = {
  supported: [
    { icon: 'dist', extensions: ['dist'] },
    { icon: 'git', extensions: ['git', 'github'] },
    { icon: 'node', extensions: ['node_modules'] },
    { icon: 'meteor', extensions: ['meteor'] },
    { icon: 'src', extensions: ['src'] },
    { icon: 'typings', extensions: ['typings'] },
    { icon: 'vscode', extensions: ['vscode'] }
  ],
  parse: function () {
    var s = this.replace(/\./g, '_');
    if ((/^\d/).test(s)) return 'n' + s;
    return s;
  }
};
