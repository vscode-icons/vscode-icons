var fs = require('fs');
var vscode = require('vscode'); // eslint-disable-line
var semver = require('semver');
var path = require('path');
var getAppPath = require('./vscodePath');
var extVersion = require('./extVersion');
var settings = null;
var status = {
  enabled: 'enabled',
  disabled: 'disabled',
  notInstalled: 'notInstalled'
};

function getSettings() {
  if (settings) return settings;
  var isInsiders = /insiders/i.test(vscode.env.appName);
  var version = semver(vscode.version);
  var isGt160 = semver.lt(version.major + '.' + version.minor + '.' + version.patch, '1.6.0');
  var isWin = /^win/.test(process.platform);
  var homeDir = isWin ? 'USERPROFILE' : 'HOME';
  var extensionFolder = path.join(homeDir, isInsiders
    ? '.vscode-insiders'
    : '.vscode', 'extensions');
  var codePath = isInsiders ? '/Code - Insiders' : '/Code';
  var appPath = getAppPath();
  var appDir = path.dirname(require.main.filename);
  var base = appDir + (isWin ? '\\vs\\workbench' : '/vs/workbench');
  var iconFolder = base + (isWin ?
    '\\browser\\parts\\editor\\media' :
    '/browser/parts/editor/media');
  var cssfile = base + (isWin ?
    '\\workbench.main.css' :
    '/workbench.main.css');
  var cssfilebak = base + (isWin ? '\\workbench.main.css.bak' : '/workbench.main.css.bak');
  var cssreplace = '/*! *****************************************************************************'; // eslint-disable-line
  var jsiconsreplace =
    [
      /this\.fileIconClasses\((i|n)\.resource\.fsPath\)/,
      /e.fileIconClasses\((r|o)\)/,
      /this\.folderIconClasses\((i|n)\.resource\.fsPath\)/
    ];
  var jsfile = base + (isWin ? '\\workbench.main.js' : '/workbench.main.js');
  var jsfilebak = base + (isWin ? '\\workbench.main.js.bak' : '/workbench.main.js.bak');

  settings = {
    appPath: appPath,
    isWin: isWin,
    isInsiders: isInsiders,
    extensionFolder: extensionFolder,
    settingsPath: path.join(appPath, codePath, 'User', 'vsicons.settings.json'),
    iconFolder: iconFolder,
    cssfile: cssfile,
    jsfile: jsfile,
    cssfilebak: cssfilebak,
    jsfilebak: jsfilebak,
    cssreplace: cssreplace,
    extVersion: extVersion,
    jsiconsreplace: jsiconsreplace,
    version: version,
    isGt160: isGt160
  };
  return settings;
}

function getState() {
  var vars = getSettings();
  try {
    var state = fs.readFileSync(vars.settingsPath);
    return JSON.parse(state);
  } catch (error) {
    return {
      version: '0',
      status: status.notInstalled,
      welcomeShown: false
    };
  }
}

function setState(state) {
  var vars = getSettings();
  fs.writeFileSync(vars.settingsPath, JSON.stringify(state));
}

function setStatus(sts) {
  setState({
    version: extVersion,
    status: sts,
    welcomeShown: true
  });
}

function deleteState() {
  var vars = getSettings();
  fs.unlinkSync(vars.settingsPath);
}

module.exports = {
  getSettings: getSettings,
  getState: getState,
  setState: setState,
  status: status,
  setStatus: setStatus,
  deleteState: deleteState
};
