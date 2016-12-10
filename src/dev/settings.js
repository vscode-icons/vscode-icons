var fs = require('fs');
var vscode = require('vscode');
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

  settings = {
    appPath: appPath,
    isWin: isWin,
    isInsiders: isInsiders,
    extensionFolder: extensionFolder,
    settingsPath: path.join(appPath, codePath, 'User', 'vsicons.settings.json'),
    extVersion: extVersion,
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
  var state = getState();
  state.version = extVersion;
  state.status = sts;
  state.welcomeShown = true;
  setState(state);
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
