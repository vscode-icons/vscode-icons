/* eslint-disable max-len */
exports.extensions = {
  supported: [
    { icon: 'bower', extensions: ['bower_components'] },
    { icon: 'dist', extensions: ['dist', 'out', 'export', 'build'] },
    { icon: 'flow', extensions: ['flow'] },
    { icon: 'git', extensions: ['git', 'github'], dot: true },
    { icon: 'haxelib', extensions: ['haxelib'] },
    { icon: 'node', extensions: ['node_modules'] },
    { icon: 'meteor', extensions: ['meteor'], dot: true },
    { icon: 'script', extensions: ['script', 'scripts'] },
    { icon: 'src', extensions: ['src', 'source', 'sources'] },
    { icon: 'test', extensions: ['tests', 'test', '__tests__', '__test__'] },
    { icon: 'typings', extensions: ['typings'] },
    { icon: 'vscode', extensions: ['vscode'], dot: true }
  ],
  parse: function () {
    var s = this.replace(/\./g, '_');
    if ((/^\d/).test(s)) return 'n' + s;
    return s;
  }
};
