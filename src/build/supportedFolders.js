/* eslint-disable max-len */
exports.extensions = {
  supported: [
    { icon: 'bower', extensions: ['bower_components'] },
    { icon: 'dist', extensions: ['dist', 'out', 'export'] },
    { icon: 'git', extensions: ['git', 'github'] },
    { icon: 'haxelib', extensions: ['haxelib'] },
    { icon: 'node', extensions: ['node_modules'] },
    { icon: 'meteor', extensions: ['meteor'] },
    { icon: 'src', extensions: ['src', 'source', 'sources'] },
    { icon: 'test', extensions: ['tests', 'test', '__tests__', '__test__'] },
    { icon: 'typings', extensions: ['typings'] },
    { icon: 'vscode', extensions: ['vscode'] }
  ],
  parse: function () {
    var s = this.replace(/\./g, '_');
    if ((/^\d/).test(s)) return 'n' + s;
    return s;
  }
};
